import { getDatabase } from '@/storage/database';
import type { HikingSession, HikingSessionInput } from '@/types/models';
import { createId } from '@/utils/idUtils';

interface SessionRow {
  id: string;
  mountain_id: string;
  mountain_name: string;
  status: HikingSession['status'];
  goal_name: string;
  started_at: string;
  paused_at: string | null;
  total_paused_ms: number;
  estimated_duration_minutes: number;
  estimated_arrival_at: string;
  finished_at: string | null;
  verification_type: HikingSession['verificationType'];
  last_known_latitude: number | null;
  last_known_longitude: number | null;
  memo: string;
  created_at: string;
  updated_at: string;
}

function mapSession(row: SessionRow): HikingSession {
  return {
    id: row.id,
    mountainId: row.mountain_id,
    mountainName: row.mountain_name,
    status: row.status,
    goalName: row.goal_name,
    startedAt: row.started_at,
    pausedAt: row.paused_at ?? undefined,
    totalPausedMs: row.total_paused_ms,
    estimatedDurationMinutes: row.estimated_duration_minutes,
    estimatedArrivalAt: row.estimated_arrival_at,
    finishedAt: row.finished_at ?? undefined,
    verificationType: row.verification_type,
    lastKnownLatitude: row.last_known_latitude ?? undefined,
    lastKnownLongitude: row.last_known_longitude ?? undefined,
    memo: row.memo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const hikingSessionService = {
  async getAll(): Promise<HikingSession[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<SessionRow>('SELECT * FROM hiking_sessions ORDER BY created_at DESC');
    return rows.map(mapSession);
  },

  async getActive(): Promise<HikingSession | undefined> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<SessionRow>(
      `SELECT * FROM hiking_sessions WHERE status IN ('active', 'paused') ORDER BY updated_at DESC LIMIT 1`,
    );
    return row ? mapSession(row) : undefined;
  },

  async getById(id: string): Promise<HikingSession | undefined> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<SessionRow>('SELECT * FROM hiking_sessions WHERE id = ?', id);
    return row ? mapSession(row) : undefined;
  },

  async start(input: HikingSessionInput): Promise<HikingSession> {
    const active = await this.getActive();
    if (active) throw new Error('이미 진행 중인 등산이 있어요.');
    const db = await getDatabase();
    const now = new Date();
    const iso = now.toISOString();
    const session: HikingSession = {
      id: createId('session'),
      ...input,
      status: 'active',
      startedAt: iso,
      totalPausedMs: 0,
      estimatedArrivalAt: new Date(now.getTime() + input.estimatedDurationMinutes * 60_000).toISOString(),
      createdAt: iso,
      updatedAt: iso,
    };
    await db.runAsync(
      `INSERT INTO hiking_sessions
       (id, mountain_id, mountain_name, status, goal_name, started_at, total_paused_ms,
        estimated_duration_minutes, estimated_arrival_at, verification_type, memo, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      session.id,
      session.mountainId,
      session.mountainName,
      session.status,
      session.goalName,
      session.startedAt,
      0,
      session.estimatedDurationMinutes,
      session.estimatedArrivalAt,
      session.verificationType,
      session.memo,
      session.createdAt,
      session.updatedAt,
    );
    return session;
  },

  async pause(session: HikingSession): Promise<void> {
    const now = new Date().toISOString();
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE hiking_sessions SET status = 'paused', paused_at = ?, updated_at = ? WHERE id = ?`,
      now,
      now,
      session.id,
    );
  },

  async resume(session: HikingSession): Promise<void> {
    const now = Date.now();
    const addedPause = session.pausedAt ? Math.max(0, now - Date.parse(session.pausedAt)) : 0;
    const totalPausedMs = session.totalPausedMs + addedPause;
    const estimatedArrivalAt = new Date(
      Date.parse(session.startedAt) + totalPausedMs + session.estimatedDurationMinutes * 60_000,
    ).toISOString();
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE hiking_sessions SET status = 'active', paused_at = NULL, total_paused_ms = ?,
       estimated_arrival_at = ?, updated_at = ? WHERE id = ?`,
      totalPausedMs,
      estimatedArrivalAt,
      new Date(now).toISOString(),
      session.id,
    );
  },

  async finish(id: string, cancelled = false): Promise<void> {
    const current = await this.getById(id);
    const nowMs = Date.now();
    const now = new Date(nowMs).toISOString();
    const totalPausedMs = current?.status === 'paused' && current.pausedAt
      ? current.totalPausedMs + Math.max(0, nowMs - Date.parse(current.pausedAt))
      : current?.totalPausedMs ?? 0;
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE hiking_sessions SET status = ?, finished_at = ?, paused_at = NULL,
       total_paused_ms = ?, updated_at = ? WHERE id = ?`,
      cancelled ? 'cancelled' : 'finished',
      now,
      totalPausedMs,
      now,
      id,
    );
  },

  async updateLocation(id: string, latitude: number, longitude: number, gpsVerified: boolean): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE hiking_sessions SET last_known_latitude = ?, last_known_longitude = ?,
       verification_type = ?, updated_at = ? WHERE id = ?`,
      latitude,
      longitude,
      gpsVerified ? 'gps' : 'manual',
      new Date().toISOString(),
      id,
    );
  },
};
