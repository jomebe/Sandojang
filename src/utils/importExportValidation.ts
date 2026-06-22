import type { BackupPayload, ClimbRecord, HikingSession } from '@/types/models';

const difficulties = new Set(['easy', 'normal', 'hard']);
const verifications = new Set(['gps', 'manual']);
const statuses = new Set(['active', 'paused', 'finished', 'cancelled']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isClimbRecord(value: unknown): value is ClimbRecord {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.mountainId === 'string' &&
    typeof value.climbedAt === 'string' &&
    typeof value.memo === 'string' &&
    typeof value.weather === 'string' &&
    difficulties.has(String(value.difficulty)) &&
    typeof value.companions === 'string' &&
    typeof value.durationMinutes === 'number' &&
    Array.isArray(value.photoUris) &&
    value.photoUris.every((uri) => typeof uri === 'string') &&
    verifications.has(String(value.verificationType)) &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string'
  );
}

function isSession(value: unknown): value is HikingSession {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.mountainId === 'string' &&
    typeof value.mountainName === 'string' &&
    statuses.has(String(value.status)) &&
    typeof value.goalName === 'string' &&
    typeof value.startedAt === 'string' &&
    typeof value.totalPausedMs === 'number' &&
    typeof value.estimatedDurationMinutes === 'number' &&
    typeof value.estimatedArrivalAt === 'string' &&
    verifications.has(String(value.verificationType)) &&
    typeof value.memo === 'string' &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string'
  );
}

export function validateBackup(value: unknown): BackupPayload {
  if (!isRecord(value) || value.version !== 1 || typeof value.exportedAt !== 'string') {
    throw new Error('산도장 백업 파일이 아니거나 지원하지 않는 버전이에요.');
  }
  if (!Array.isArray(value.records) || !value.records.every(isClimbRecord)) {
    throw new Error('등산 기록 형식이 올바르지 않아요.');
  }
  if (!Array.isArray(value.sessions) || !value.sessions.every(isSession)) {
    throw new Error('등산 세션 형식이 올바르지 않아요.');
  }
  return value as unknown as BackupPayload;
}
