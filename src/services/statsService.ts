import type { ClimbRecord, Mountain, UserStats } from '@/types/models';
import { calculateStats, getMonthlyCounts } from '@/utils/statsUtils';

export const statsService = {
  calculate(mountains: Mountain[], records: ClimbRecord[]): UserStats {
    return calculateStats(mountains, records);
  },
  monthly(records: ClimbRecord[]): number[] {
    return getMonthlyCounts(records);
  },
};
