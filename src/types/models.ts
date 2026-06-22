export type Difficulty = 'easy' | 'normal' | 'hard';
export type VerificationType = 'gps' | 'manual';
export type HikingSessionStatus = 'active' | 'paused' | 'finished' | 'cancelled';

export interface Mountain {
  id: string;
  nameKo: string;
  region: string;
  altitudeMeters: number;
  latitude: number;
  longitude: number;
  description?: string;
}

export interface ClimbRecord {
  id: string;
  mountainId: string;
  climbedAt: string;
  memo: string;
  weather: string;
  difficulty: Difficulty;
  companions: string;
  durationMinutes: number;
  photoUris: string[];
  verificationType: VerificationType;
  createdAt: string;
  updatedAt: string;
}

export interface ClimbRecordInput {
  mountainId: string;
  climbedAt: string;
  memo: string;
  weather: string;
  difficulty: Difficulty;
  companions: string;
  durationMinutes: number;
  photoUris: string[];
  verificationType: VerificationType;
}

export interface HikingSession {
  id: string;
  mountainId: string;
  mountainName: string;
  status: HikingSessionStatus;
  goalName: string;
  startedAt: string;
  pausedAt?: string;
  totalPausedMs: number;
  estimatedDurationMinutes: number;
  estimatedArrivalAt: string;
  finishedAt?: string;
  verificationType: VerificationType;
  lastKnownLatitude?: number;
  lastKnownLongitude?: number;
  memo: string;
  createdAt: string;
  updatedAt: string;
}

export interface HikingSessionInput {
  mountainId: string;
  mountainName: string;
  goalName: string;
  estimatedDurationMinutes: number;
  verificationType: VerificationType;
  memo: string;
}

export interface Photo {
  id: string;
  climbRecordId: string;
  uri: string;
  createdAt: string;
}

export type AchievementCondition = 'count' | 'mountain';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  conditionType: AchievementCondition;
  target: number | string;
  unlockedAt?: string;
}

export interface UserStats {
  totalClimbedMountains: number;
  totalRecords: number;
  totalAltitudeMeters: number;
  thisMonthCount: number;
  thisYearCount: number;
  completionRate: number;
}

export interface BackupPayload {
  version: 1;
  exportedAt: string;
  records: ClimbRecord[];
  sessions: HikingSession[];
}

export interface MountainWithProgress extends Mountain {
  climbed: boolean;
  recordCount: number;
  lastClimbedAt?: string;
  distanceKm?: number;
}
