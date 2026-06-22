import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { achievementService } from '@/services/achievementService';
import { climbRecordService } from '@/services/climbRecordService';
import { hikingSessionService } from '@/services/hikingSessionService';
import { locationService } from '@/services/locationService';
import { mountainService } from '@/services/mountainService';
import { statsService } from '@/services/statsService';
import { getDatabase } from '@/storage/database';
import type {
  Achievement,
  ClimbRecord,
  HikingSession,
  MountainWithProgress,
  UserStats,
} from '@/types/models';
import { isNearSummit } from '@/utils/distanceUtils';

interface AppContextValue {
  initialized: boolean;
  loading: boolean;
  error?: string;
  mountains: MountainWithProgress[];
  records: ClimbRecord[];
  sessions: HikingSession[];
  activeSession?: HikingSession;
  stats: UserStats;
  achievements: Achievement[];
  refresh: () => Promise<void>;
}

const emptyStats: UserStats = {
  totalClimbedMountains: 0,
  totalRecords: 0,
  totalAltitudeMeters: 0,
  thisMonthCount: 0,
  thisYearCount: 0,
  completionRate: 0,
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: PropsWithChildren) {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [mountains, setMountains] = useState<MountainWithProgress[]>([]);
  const [records, setRecords] = useState<ClimbRecord[]>([]);
  const [sessions, setSessions] = useState<HikingSession[]>([]);
  const [activeSession, setActiveSession] = useState<HikingSession>();

  const refresh = useCallback(async () => {
    try {
      setError(undefined);
      const [nextMountains, nextRecords, nextSessions, nextActive] = await Promise.all([
        mountainService.getAllWithProgress(),
        climbRecordService.getAll(),
        hikingSessionService.getAll(),
        hikingSessionService.getActive(),
      ]);
      setMountains(nextMountains);
      setRecords(nextRecords);
      setSessions(nextSessions);
      setActiveSession(nextActive);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '데이터를 불러오지 못했어요.');
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    void getDatabase().then(refresh);
  }, [refresh]);

  useEffect(() => {
    if (!activeSession) return;
    let cancelled = false;
    const update = async () => {
      const current = await locationService.getCurrentLocation(false);
      if (cancelled || !current.granted || current.latitude === undefined || current.longitude === undefined) return;
      const mountain = mountains.find((item) => item.id === activeSession.mountainId);
      if (!mountain) return;
      const distance = locationService.distanceTo(
        current.latitude,
        current.longitude,
        mountain.latitude,
        mountain.longitude,
      );
      await hikingSessionService.updateLocation(
        activeSession.id,
        current.latitude,
        current.longitude,
        isNearSummit(distance),
      );
    };
    void update();
    const timer = setInterval(() => void update(), 120_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [activeSession, mountains]);

  const stats = useMemo(() => statsService.calculate(mountains, records), [mountains, records]);
  const achievements = useMemo(
    () => achievementService.evaluate(records, mountains),
    [records, mountains],
  );
  const value = useMemo<AppContextValue>(
    () => ({
      initialized,
      loading,
      error,
      mountains,
      records,
      sessions,
      activeSession,
      stats: initialized ? stats : emptyStats,
      achievements,
      refresh,
    }),
    [initialized, loading, error, mountains, records, sessions, activeSession, stats, achievements, refresh],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('AppProvider 안에서 useApp을 사용해야 합니다.');
  return context;
}
