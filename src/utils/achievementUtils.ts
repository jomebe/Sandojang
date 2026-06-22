import type { Achievement, ClimbRecord } from '@/types/models';

export const achievementDefinitions: Achievement[] = [
  { id: 'first', title: '첫 도장', description: '첫 산에 도장을 찍었어요', conditionType: 'count', target: 1 },
  { id: 'five', title: '5산 달성', description: '다섯 산을 완등했어요', conditionType: 'count', target: 5 },
  { id: 'ten', title: '10산 달성', description: '열 산을 완등했어요', conditionType: 'count', target: 10 },
  { id: 'thirty', title: '30산 달성', description: '서른 산을 완등했어요', conditionType: 'count', target: 30 },
  { id: 'hundred', title: '100산 도전', description: '백 산을 완등했어요', conditionType: 'count', target: 100 },
  { id: 'hallasan', title: '한라산 도장', description: '한라산을 완등했어요', conditionType: 'mountain', target: '한라산' },
  { id: 'jirisan', title: '지리산 도장', description: '지리산을 완등했어요', conditionType: 'mountain', target: '지리산' },
  { id: 'seoraksan', title: '설악산 도장', description: '설악산을 완등했어요', conditionType: 'mountain', target: '설악산' },
];

export function evaluateAchievements(
  records: ClimbRecord[],
  mountainNames: Map<string, string>,
  unlockedAt = new Date().toISOString(),
): Achievement[] {
  const climbedNames = new Set(records.map((record) => mountainNames.get(record.mountainId)));
  const distinctCount = new Set(records.map((record) => record.mountainId)).size;
  return achievementDefinitions.map((achievement) => {
    const unlocked =
      achievement.conditionType === 'count'
        ? distinctCount >= Number(achievement.target)
        : climbedNames.has(String(achievement.target));
    return { ...achievement, unlockedAt: unlocked ? unlockedAt : undefined };
  });
}
