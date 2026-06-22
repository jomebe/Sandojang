import { describe, expect, it } from 'vitest';

import type { BackupPayload, ClimbRecord, HikingSession, Mountain } from '../types/models';
import { evaluateAchievements } from '../utils/achievementUtils';
import { calculateDistanceKm, isNearSummit } from '../utils/distanceUtils';
import { validateBackup } from '../utils/importExportValidation';
import { calculateStats } from '../utils/statsUtils';
import { getProgress, getRemainingMinutes, restoreActiveSession } from '../utils/timeProgressUtils';

const mountains: Mountain[] = [
  { id: 'hallasan', nameKo: '한라산', region: '제주특별자치도', altitudeMeters: 1947, latitude: 33.3617, longitude: 126.5292 },
  { id: 'bukhansan', nameKo: '북한산', region: '서울특별시', altitudeMeters: 836, latitude: 37.6587, longitude: 126.9779 },
];

function record(id: string, mountainId: string, climbedAt = '2026-06-10T03:00:00.000Z'): ClimbRecord {
  return { id, mountainId, climbedAt, memo: '', weather: '맑음', difficulty: 'normal', companions: '', durationMinutes: 120, photoUris: [], verificationType: 'manual', createdAt: climbedAt, updatedAt: climbedAt };
}

function session(overrides: Partial<HikingSession> = {}): HikingSession {
  return { id: 'session-1', mountainId: 'bukhansan', mountainName: '북한산', status: 'active', goalName: '정상', startedAt: '2026-06-22T00:00:00.000Z', totalPausedMs: 0, estimatedDurationMinutes: 120, estimatedArrivalAt: '2026-06-22T02:00:00.000Z', verificationType: 'manual', memo: '', createdAt: '2026-06-22T00:00:00.000Z', updatedAt: '2026-06-22T00:00:00.000Z', ...overrides };
}

describe('통계 계산', () => {
  it('중복 산은 한 번만 고도와 완등 수에 포함한다', () => {
    const stats = calculateStats(mountains, [record('1', 'hallasan'), record('2', 'hallasan')], new Date('2026-06-22T00:00:00Z'));
    expect(stats.totalClimbedMountains).toBe(1);
    expect(stats.totalRecords).toBe(2);
    expect(stats.totalAltitudeMeters).toBe(1947);
    expect(stats.completionRate).toBe(50);
  });
});

describe('업적 계산', () => {
  it('첫 도장과 지정 산 도장을 해제한다', () => {
    const achievements = evaluateAchievements([record('1', 'hallasan')], new Map(mountains.map((item) => [item.id, item.nameKo])));
    expect(achievements.find((item) => item.id === 'first')?.unlockedAt).toBeTruthy();
    expect(achievements.find((item) => item.id === 'hallasan')?.unlockedAt).toBeTruthy();
    expect(achievements.find((item) => item.id === 'five')?.unlockedAt).toBeUndefined();
  });
});

describe('거리 계산', () => {
  it('같은 좌표 거리는 0이고 300m 이내는 정상 인증한다', () => {
    expect(calculateDistanceKm(37, 127, 37, 127)).toBe(0);
    expect(isNearSummit(calculateDistanceKm(37, 127, 37.001, 127))).toBe(true);
    expect(isNearSummit(0.31)).toBe(false);
  });
});

describe('라이브 시간 계산', () => {
  it('경과 비율과 남은 시간을 타임스탬프로 계산한다', () => {
    const hiking = session();
    const now = Date.parse('2026-06-22T00:30:00.000Z');
    expect(getProgress(hiking, now)).toBe(0.25);
    expect(getRemainingMinutes(hiking, now)).toBe(90);
  });

  it('가장 최근 활성/일시정지 세션을 복원한다', () => {
    const old = session({ id: 'old', updatedAt: '2026-06-22T01:00:00Z' });
    const recent = session({ id: 'recent', status: 'paused', updatedAt: '2026-06-22T02:00:00Z' });
    const finished = session({ id: 'done', status: 'finished', updatedAt: '2026-06-22T03:00:00Z' });
    expect(restoreActiveSession([old, recent, finished])?.id).toBe('recent');
  });
});

describe('백업 검증', () => {
  it('정상 백업은 반환하고 손상된 백업은 거부한다', () => {
    const hiking = session();
    const payload: BackupPayload = { version: 1, exportedAt: '2026-06-22T03:00:00Z', records: [record('1', 'hallasan')], sessions: [hiking] };
    expect(validateBackup(payload)).toEqual(payload);
    expect(() => validateBackup({ ...payload, records: [{ id: 1 }] })).toThrow('등산 기록 형식');
  });
});
