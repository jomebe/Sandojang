import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

interface StatsCardProps { label: string; value: string; accent?: boolean }

export function StatsCard({ label, value, accent }: StatsCardProps) {
  return (
    <View style={[styles.card, accent && styles.accent]}>
      <Text style={[styles.label, accent && styles.accentLabel]}>{label}</Text>
      <Text style={[styles.value, accent && styles.accentValue]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 140, backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.line },
  accent: { backgroundColor: colors.forest, borderColor: colors.forest },
  label: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  value: { color: colors.ink, fontSize: 24, fontWeight: '900', marginTop: spacing.xs },
  accentLabel: { color: colors.beige },
  accentValue: { color: colors.white },
});
