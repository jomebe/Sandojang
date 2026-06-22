import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

export function BarChart({ values, labels }: { values: number[]; labels: string[] }) {
  const max = Math.max(1, ...values);
  return (
    <View style={styles.chart} accessibilityLabel="월별 등산 횟수 차트">
      {values.map((value, index) => (
        <View key={`${labels[index]}-${index}`} style={styles.column}>
          <Text style={styles.value}>{value || ''}</Text>
          <View style={styles.track}><View style={[styles.bar, { height: `${Math.max(value ? 12 : 3, (value / max) * 100)}%` }]} /></View>
          <Text style={styles.label}>{labels[index]}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: { height: 190, flexDirection: 'row', alignItems: 'flex-end', gap: 3, paddingTop: spacing.lg },
  column: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end' },
  value: { height: 17, color: colors.forest, fontSize: 9, fontWeight: '800' },
  track: { flex: 1, width: '70%', borderRadius: radius.sm, justifyContent: 'flex-end', overflow: 'hidden', backgroundColor: colors.sand },
  bar: { width: '100%', borderRadius: radius.sm, backgroundColor: colors.forestSoft },
  label: { color: colors.muted, fontSize: 8, marginTop: 5 },
});
