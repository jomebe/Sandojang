import { getDatabase } from '@/storage/database';
import type { ClimbRecord, ClimbRecordInput } from '@/types/models';
import { createId } from '@/utils/idUtils';

interface ClimbRecordRow {
  id: string;
  mountain_id: string;
  climbed_at: string;
  memo: string;
  weather: string;
  difficulty: ClimbRecord['difficulty'];
  companions: string;
  duration_minutes: number;
  photo_uris: string;
  verification_type: ClimbRecord['verificationType'];
  created_at: string;
  updated_at: string;
}

function parsePhotos(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function mapRecord(row: ClimbRecordRow): ClimbRecord {
  return {
    id: row.id,
    mountainId: row.mountain_id,
    climbedAt: row.climbed_at,
    memo: row.memo,
    weather: row.weather,
    difficulty: row.difficulty,
    companions: row.companions,
    durationMinutes: row.duration_minutes,
    photoUris: parsePhotos(row.photo_uris),
    verificationType: row.verification_type,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const climbRecordService = {
  async getAll(): Promise<ClimbRecord[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<ClimbRecordRow>('SELECT * FROM climb_records ORDER BY climbed_at DESC');
    return rows.map(mapRecord);
  },

  async getById(id: string): Promise<ClimbRecord | undefined> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<ClimbRecordRow>('SELECT * FROM climb_records WHERE id = ?', id);
    return row ? mapRecord(row) : undefined;
  },

  async create(input: ClimbRecordInput): Promise<ClimbRecord> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const record: ClimbRecord = { id: createId('climb'), ...input, createdAt: now, updatedAt: now };
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT INTO climb_records
          (id, mountain_id, climbed_at, memo, weather, difficulty, companions, duration_minutes,
           photo_uris, verification_type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        record.id, record.mountainId, record.climbedAt, record.memo, record.weather, record.difficulty,
        record.companions, record.durationMinutes, JSON.stringify(record.photoUris), record.verificationType,
        record.createdAt, record.updatedAt,
      );
      for (const uri of record.photoUris) {
        await db.runAsync('INSERT INTO photos (id, climb_record_id, uri, created_at) VALUES (?, ?, ?, ?)', createId('photo'), record.id, uri, now);
      }
    });
    return record;
  },

  async update(id: string, input: ClimbRecordInput): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `UPDATE climb_records SET mountain_id = ?, climbed_at = ?, memo = ?, weather = ?, difficulty = ?,
         companions = ?, duration_minutes = ?, photo_uris = ?, verification_type = ?, updated_at = ? WHERE id = ?`,
        input.mountainId, input.climbedAt, input.memo, input.weather, input.difficulty, input.companions,
        input.durationMinutes, JSON.stringify(input.photoUris), input.verificationType, now, id,
      );
      await db.runAsync('DELETE FROM photos WHERE climb_record_id = ?', id);
      for (const uri of input.photoUris) {
        await db.runAsync('INSERT INTO photos (id, climb_record_id, uri, created_at) VALUES (?, ?, ?, ?)', createId('photo'), id, uri, now);
      }
    });
  },

  async remove(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM climb_records WHERE id = ?', id);
  },
};
