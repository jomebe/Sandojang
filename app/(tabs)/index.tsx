import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { MountainCard } from '@/components/cards/MountainCard';
import { LiveHikingWidget } from '@/components/live/LiveHikingWidget';
import { AppButton } from '@/components/ui/AppButton';
import { Screen } from '@/components/ui/Screen';
import { useApp } from '@/context/AppContext';
import { colors, radius, spacing } from '@/theme';

export default function HomeScreen() {
  const { mountains, stats, activeSession } = useApp();
  const climbed = mountains
    .filter((mountain) => mountain.climbed)
    .sort((a, b) => Date.parse(b.lastClimbedAt ?? '1970-01-01') - Date.parse(a.lastClimbedAt ?? '1970-01-01'));
  const hasClimbed = stats.totalClimbedMountains > 0;

  return (
    <Screen
      title="산도장"
      subtitle="오른 산을 지도에 찍다"
      right={<View style={styles.brandIcon}><Ionicons name="triangle" size={22} color={colors.yellow} /></View>}
    >
      {activeSession && <LiveHikingWidget session={activeSession} compact />}

      {!hasClimbed ? (
        <View style={styles.emptyHero}>
          <View style={styles.emptyIllustration}>
            <View style={styles.sun} />
            <Ionicons name="triangle" size={106} color={colors.forest} style={styles.mountainBack} />
            <Ionicons name="triangle" size={78} color={colors.forestSoft} style={styles.mountainFront} />
            <View style={styles.emptyStamp}><Ionicons name="footsteps" size={28} color={colors.danger} /></View>
          </View>
          <Text style={styles.emptyTitle}>산을 아직 등반을 안하셨군요!</Text>
          <Text style={styles.emptyDescription}>첫 산을 골라 등산을 시작하면{`\n`}나만의 지도에 첫 도장이 생겨요.</Text>
          <AppButton
            label="첫 산 등산하기!"
            onPress={() => router.push('/discover')}
            style={styles.primaryAction}
          />
        </View>
      ) : (
        <>
          <View style={styles.progressHero}>
            <View style={styles.progressCopy}>
              <Text style={styles.progressEyebrow}>나의 산도장</Text>
              <Text style={styles.progressTitle}>{stats.totalClimbedMountains}개의 산에{`\n`}도장을 찍었어요</Text>
              <Text style={styles.progressMeta}>전체 산의 {stats.completionRate.toFixed(1)}% 완등</Text>
            </View>
            <View style={styles.progressStamp}>
              <Text style={styles.progressNumber}>{stats.totalClimbedMountains}</Text>
              <Text style={styles.progressUnit}>완등</Text>
            </View>
          </View>
          <AppButton label="다음 산 찾기" onPress={() => router.push('/discover')} />
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>최근 오른 산</Text>
            <Text style={styles.sectionMeta}>{stats.totalRecords}개 기록</Text>
          </View>
          <View style={styles.recentList}>
            {climbed.slice(0, 3).map((mountain) => (
              <MountainCard
                key={mountain.id}
                mountain={mountain}
                onPress={() => router.push(`/map/${mountain.id}`)}
              />
            ))}
          </View>
        </>
      )}

      <View style={styles.guideCard}>
        <Ionicons name="shield-checkmark-outline" size={23} color={colors.forest} />
        <View style={styles.guideCopy}>
          <Text style={styles.guideTitle}>기록은 기기 안에 안전하게</Text>
          <Text style={styles.guideText}>로그인 없이 바로 시작하고 필요할 때 JSON으로 백업해요.</Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forest,
  },
  emptyHero: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.beige,
  },
  emptyIllustration: { width: 210, height: 150, marginBottom: spacing.xl },
  sun: {
    position: 'absolute',
    top: 5,
    right: 22,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.yellow,
  },
  mountainBack: { position: 'absolute', left: 7, bottom: -11 },
  mountainFront: { position: 'absolute', right: 11, bottom: -7 },
  emptyStamp: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.danger,
    backgroundColor: colors.paper,
    transform: [{ rotate: '-9deg' }],
  },
  emptyTitle: { color: colors.ink, fontSize: 23, fontWeight: '900', textAlign: 'center', letterSpacing: -0.7 },
  emptyDescription: { color: colors.muted, fontSize: 14, lineHeight: 22, textAlign: 'center', marginTop: spacing.sm },
  primaryAction: { alignSelf: 'stretch', marginTop: spacing.xl },
  progressHero: { flexDirection: 'row', alignItems: 'center', padding: spacing.xl, borderRadius: radius.lg, backgroundColor: colors.forest },
  progressCopy: { flex: 1 },
  progressEyebrow: { color: colors.yellow, fontSize: 12, fontWeight: '800' },
  progressTitle: { color: colors.white, fontSize: 25, lineHeight: 33, fontWeight: '900', marginTop: spacing.xs },
  progressMeta: { color: colors.beige, fontSize: 12, marginTop: spacing.sm },
  progressStamp: { width: 82, height: 82, borderRadius: 41, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: colors.yellow, transform: [{ rotate: '-7deg' }] },
  progressNumber: { color: colors.white, fontSize: 26, fontWeight: '900' },
  progressUnit: { color: colors.yellow, fontSize: 11, fontWeight: '900' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.ink, fontSize: 19, fontWeight: '900' },
  sectionMeta: { color: colors.muted, fontSize: 12 },
  recentList: { gap: spacing.sm },
  guideCard: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg, borderRadius: radius.md, backgroundColor: colors.sand },
  guideCopy: { flex: 1 },
  guideTitle: { color: colors.ink, fontSize: 13, fontWeight: '900' },
  guideText: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 3 },
});
