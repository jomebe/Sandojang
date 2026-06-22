import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StampBadge } from '@/components/stamps/StampBadge';
import { colors, radius, spacing } from '@/theme';
import type { MountainWithProgress } from '@/types/models';

export function MountainCard({ mountain, onPress }: { mountain: MountainWithProgress; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.icon}>
        {mountain.climbed ? <StampBadge compact /> : <Ionicons name="trail-sign-outline" size={28} color={colors.forest} />}
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{mountain.nameKo}</Text>
          {mountain.climbed && <Text style={styles.done}>완등</Text>}
        </View>
        <Text style={styles.meta}>{mountain.region} · 해발 {mountain.altitudeMeters.toLocaleString('ko-KR')}m</Text>
        <Text style={styles.records}>등산 기록 {mountain.recordCount}개{mountain.distanceKm !== undefined ? ` · ${mountain.distanceKm.toFixed(1)}km` : ''}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.locked} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  pressed: { opacity: 0.72 },
  icon: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sand },
  body: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  done: { color: colors.danger, fontSize: 11, fontWeight: '900', backgroundColor: '#FFF1E8', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20 },
  meta: { color: colors.muted, fontSize: 13, marginTop: spacing.xs },
  records: { color: colors.forestSoft, fontSize: 12, fontWeight: '700', marginTop: spacing.xs },
});
