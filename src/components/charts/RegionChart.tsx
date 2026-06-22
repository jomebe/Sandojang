import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

export function RegionChart({ rows }: { rows: { region: string; climbed: number; total: number }[] }) {
  return (
    <View style={styles.list}>
      {rows.map((row) => {
        const percent = row.total ? (row.climbed / row.total) * 100 : 0;
        return <View key={row.region} style={styles.row}>
          <View style={styles.labelRow}><Text style={styles.region}>{row.region}</Text><Text style={styles.count}>{row.climbed}/{row.total}</Text></View>
          <View style={styles.track}><View style={[styles.bar, { width: `${percent}%` }]} /></View>
        </View>;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  row: { gap: 6 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  region: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  count: { color: colors.muted, fontSize: 12 },
  track: { height: 8, borderRadius: radius.pill, backgroundColor: colors.sand, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.forestSoft },
});
