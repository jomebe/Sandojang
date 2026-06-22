import type { Achievement, ClimbRecord, Mountain } from '@/types/models';
import { evaluateAchievements } from '@/utils/achievementUtils';

export const achievementService = {
  evaluate(records: ClimbRecord[], mountains: Mountain[]): Achievement[] {
    return evaluateAchievements(records, new Map(mountains.map((mountain) => [mountain.id, mountain.nameKo])));
  },
};
