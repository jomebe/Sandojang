import type { ClimbRecord, Mountain, UserStats } from '@/types/models';

export function calculateStats(
  mountains: Mountain[],
  records: ClimbRecord[],
  now = new Date(),
): UserStats {
  const climbedIds = new Set(records.map((record) => record.mountainId));
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const inYear = (record: ClimbRecord) => new Date(record.climbedAt).getFullYear() === currentYear;
  const inMonth = (record: ClimbRecord) => {
    const date = new Date(record.climbedAt);
    return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
  };
  return {
    totalClimbedMountains: climbedIds.size,
    totalRecords: records.length,
    totalAltitudeMeters: mountains
      .filter((mountain) => climbedIds.has(mountain.id))
      .reduce((sum, mountain) => sum + mountain.altitudeMeters, 0),
    thisMonthCount: records.filter(inMonth).length,
    thisYearCount: records.filter(inYear).length,
    completionRate: mountains.length === 0 ? 0 : (climbedIds.size / mountains.length) * 100,
  };
}

export function getMonthlyCounts(records: ClimbRecord[], now = new Date()): number[] {
  const year = now.getFullYear();
  return Array.from({ length: 12 }, (_, month) =>
    records.filter((record) => {
      const date = new Date(record.climbedAt);
      return date.getFullYear() === year && date.getMonth() === month;
    }).length,
  );
}
