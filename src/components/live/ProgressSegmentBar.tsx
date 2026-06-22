import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

export function ProgressSegmentBar({ progress, segments = 8 }: { progress: number; segments?: number }) {
  const filled = Math.round(Math.max(0, Math.min(1, progress)) * segments);
  return (
    <View accessibilityLabel={`진행률 ${Math.round(progress * 100)}퍼센트`} style={styles.row}>
      {Array.from({ length: segments }, (_, index) => (
        <View key={index} style={[styles.segment, index < filled && styles.filled, index === filled && styles.current]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.xs },
  segment: { flex: 1, height: 6, borderRadius: radius.pill, backgroundColor: '#3C4540' },
  filled: { backgroundColor: colors.forestSoft },
  current: { backgroundColor: colors.yellow },
});
