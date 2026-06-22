import type { HikingSession } from '@/types/models';

export function getElapsedMs(session: HikingSession, now = Date.now()): number {
  const end = session.status === 'paused' && session.pausedAt
    ? Date.parse(session.pausedAt)
    : session.finishedAt
      ? Date.parse(session.finishedAt)
      : now;
  return Math.max(0, end - Date.parse(session.startedAt) - session.totalPausedMs);
}

export function getElapsedMinutes(session: HikingSession, now = Date.now()): number {
  return Math.floor(getElapsedMs(session, now) / 60_000);
}

export function getRemainingMinutes(session: HikingSession, now = Date.now()): number {
  return Math.max(0, session.estimatedDurationMinutes - getElapsedMinutes(session, now));
}

export function getProgress(session: HikingSession, now = Date.now()): number {
  if (session.estimatedDurationMinutes <= 0) return 1;
  return Math.min(1, getElapsedMs(session, now) / (session.estimatedDurationMinutes * 60_000));
}

export function restoreActiveSession(sessions: HikingSession[]): HikingSession | undefined {
  return sessions
    .filter((session) => session.status === 'active' || session.status === 'paused')
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))[0];
}
