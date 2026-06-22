import { FlatList, StyleSheet, Text, View } from 'react-native';

import { AchievementBadge } from '@/components/stamps/AchievementBadge';
import { StampBadge } from '@/components/stamps/StampBadge';
import { Screen } from '@/components/ui/Screen';
import { useApp } from '@/context/AppContext';
import { colors, radius, spacing } from '@/theme';

export default function StampsScreen() {
  const { mountains, stats, achievements } = useApp();
  return (
    <Screen title="나의 도장판" subtitle="오른 산마다 하나씩, 나만의 지도를 채워가세요" scroll={false}>
      <View style={styles.hero}>
        <View><Text style={styles.heroLabel}>총 오른 산</Text><Text style={styles.heroValue}>{stats.totalClimbedMountains}<Text style={styles.heroUnit}>개</Text></Text></View>
        <View style={styles.progressCircle}><Text style={styles.percent}>{stats.completionRate.toFixed(1)}%</Text><Text style={styles.percentLabel}>완료율</Text></View>
      </View>
      <View style={styles.miniRow}>
        <View style={styles.mini}><Text style={styles.miniLabel}>이번 달</Text><Text style={styles.miniValue}>{stats.thisMonthCount}산</Text></View>
        <View style={styles.mini}><Text style={styles.miniLabel}>올해</Text><Text style={styles.miniValue}>{stats.thisYearCount}산</Text></View>
        <View style={styles.mini}><Text style={styles.miniLabel}>남은 산</Text><Text style={styles.miniValue}>{Math.max(0, mountains.length - stats.totalClimbedMountains)}산</Text></View>
      </View>
      <Text style={styles.sectionTitle}>도전 배지</Text>
      <FlatList horizontal data={achievements} keyExtractor={(item) => item.id} renderItem={({ item }) => <AchievementBadge achievement={item} />} ItemSeparatorComponent={() => <View style={styles.horizontalSeparator} />} showsHorizontalScrollIndicator={false} />
      <View style={styles.sectionRow}><Text style={styles.sectionTitle}>산 도장</Text><Text style={styles.sectionMeta}>{stats.totalClimbedMountains}/{mountains.length}</Text></View>
      <FlatList data={mountains} keyExtractor={(item) => item.id} numColumns={3} columnWrapperStyle={styles.gridRow} contentContainerStyle={styles.grid} renderItem={({ item }) => (
        <View style={[styles.stampCard, !item.climbed && styles.stampLocked]}>
          <StampBadge completed={item.climbed} />
          <Text numberOfLines={1} style={styles.mountainName}>{item.nameKo}</Text>
          <Text style={styles.altitude}>{item.altitudeMeters}m</Text>
        </View>
      )} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.forest, borderRadius: radius.lg, padding: spacing.xl },
  heroLabel: { color: colors.beige, fontWeight: '700' },
  heroValue: { color: colors.white, fontSize: 44, fontWeight: '900', marginTop: spacing.xs },
  heroUnit: { fontSize: 18, color: colors.yellow },
  progressCircle: { width: 86, height: 86, borderRadius: 43, borderWidth: 7, borderColor: colors.yellow, alignItems: 'center', justifyContent: 'center' },
  percent: { color: colors.white, fontSize: 17, fontWeight: '900' },
  percentLabel: { color: colors.beige, fontSize: 10, marginTop: 2 },
  miniRow: { flexDirection: 'row', gap: spacing.sm },
  mini: { flex: 1, padding: spacing.md, backgroundColor: colors.sand, borderRadius: radius.md },
  miniLabel: { color: colors.muted, fontSize: 11 },
  miniValue: { color: colors.ink, fontWeight: '900', fontSize: 17, marginTop: 3 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  sectionMeta: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  horizontalSeparator: { width: spacing.sm },
  grid: { paddingBottom: spacing.xl },
  gridRow: { gap: spacing.sm, marginBottom: spacing.sm },
  stampCard: { flex: 1, minWidth: 0, paddingVertical: spacing.lg, paddingHorizontal: spacing.xs, borderRadius: radius.md, backgroundColor: '#FFF6EB', alignItems: 'center', borderWidth: 1, borderColor: '#ECDAC5' },
  stampLocked: { backgroundColor: '#ECECE7', borderColor: '#DDDED8' },
  mountainName: { color: colors.ink, fontWeight: '900', fontSize: 13, marginTop: spacing.sm, maxWidth: '100%' },
  altitude: { color: colors.muted, fontSize: 10, marginTop: 2 },
});
