import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { StatsCard } from '@/components/cards/StatsCard';
import { BarChart } from '@/components/charts/BarChart';
import { RegionChart } from '@/components/charts/RegionChart';
import { Screen } from '@/components/ui/Screen';
import { useApp } from '@/context/AppContext';
import { statsService } from '@/services/statsService';
import { colors, radius, spacing } from '@/theme';
import { formatKoreanDate } from '@/utils/dateFormatUtils';

export default function StatsScreen() {
  const { stats, records, mountains } = useApp();
  const monthly = useMemo(() => statsService.monthly(records), [records]);
  const regions = useMemo(() => [...new Set(mountains.map((item) => item.region))].map((region) => ({ region, total: mountains.filter((item) => item.region === region).length, climbed: mountains.filter((item) => item.region === region && item.climbed).length })).sort((a, b) => b.climbed - a.climbed || b.total - a.total).slice(0, 8), [mountains]);
  const mostVisited = useMemo(() => {
    const counts = new Map<string, number>();
    records.forEach((record) => counts.set(record.mountainId, (counts.get(record.mountainId) ?? 0) + 1));
    const id = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    return id ? { mountain: mountains.find((item) => item.id === id), count: counts.get(id) } : undefined;
  }, [records, mountains]);
  return (
    <Screen title="등산 통계" subtitle="기록이 쌓일수록 산행 습관이 선명해져요">
      {records.length === 0 ? <EmptyState title="아직 기록이 없어요. 첫 산에 도장을 찍어보세요." actionLabel="산 찾아보기" onAction={() => router.push('/mountains')} /> : (
        <>
          <View style={styles.cards}><StatsCard label="오른 산" value={`${stats.totalClimbedMountains}개`} accent /><StatsCard label="전체 기록" value={`${stats.totalRecords}회`} /></View>
          <View style={styles.cards}><StatsCard label="누적 고도" value={`${stats.totalAltitudeMeters.toLocaleString('ko-KR')}m`} /><StatsCard label="이번 달" value={`${stats.thisMonthCount}회`} /></View>
          <View style={styles.section}><Text style={styles.title}>올해 월별 산행</Text><BarChart values={monthly} labels={Array.from({ length: 12 }, (_, index) => `${index + 1}`)} /></View>
          <View style={styles.section}><Text style={styles.title}>지역별 완등</Text><RegionChart rows={regions} /></View>
          <View style={styles.highlight}><Text style={styles.highlightLabel}>가장 자주 오른 산</Text><Text style={styles.highlightValue}>{mostVisited?.mountain?.nameKo ?? '-'} <Text style={styles.highlightCount}>{mostVisited?.count ?? 0}회</Text></Text></View>
          <View style={styles.section}><Text style={styles.title}>최근 등산 기록</Text>{records.slice(0, 5).map((record) => { const mountain = mountains.find((item) => item.id === record.mountainId); return <View key={record.id} style={styles.history}><View style={styles.dot} /><View style={styles.historyBody}><Text style={styles.historyTitle}>{mountain?.nameKo ?? '알 수 없는 산'}</Text><Text style={styles.historyDate}>{formatKoreanDate(record.climbedAt)}</Text></View><Text style={styles.verify}>{record.verificationType === 'gps' ? 'GPS 인증' : '수동 기록'}</Text></View>; })}</View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  cards: { flexDirection: 'row', gap: spacing.sm },
  section: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.line },
  title: { color: colors.ink, fontSize: 17, fontWeight: '900', marginBottom: spacing.md },
  highlight: { backgroundColor: colors.beige, borderRadius: radius.lg, padding: spacing.xl },
  highlightLabel: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  highlightValue: { color: colors.forest, fontSize: 25, fontWeight: '900', marginTop: spacing.xs },
  highlightCount: { color: colors.danger, fontSize: 15 },
  history: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.line },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.forestSoft },
  historyBody: { flex: 1 },
  historyTitle: { color: colors.ink, fontWeight: '800' },
  historyDate: { color: colors.muted, fontSize: 11, marginTop: 2 },
  verify: { color: colors.forestSoft, fontSize: 11, fontWeight: '800' },
});
