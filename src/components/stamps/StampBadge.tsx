import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme';

interface StampBadgeProps { completed?: boolean; compact?: boolean }

export function StampBadge({ completed = true, compact }: StampBadgeProps) {
  return (
    <View style={[styles.stamp, !completed && styles.locked, compact && styles.compact]}>
      <Text style={[styles.top, compact && styles.compactTop]}>{completed ? '산도장' : '미완등'}</Text>
      <Text style={[styles.main, compact && styles.compactMain]}>{completed ? '완등' : '잠김'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stamp: { width: 76, height: 76, borderRadius: 38, borderWidth: 3, borderColor: colors.danger, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-8deg' }], backgroundColor: '#FFF8F0' },
  locked: { borderColor: colors.locked, backgroundColor: '#EEEEEA' },
  compact: { width: 44, height: 44, borderRadius: 22, borderWidth: 2 },
  top: { color: colors.danger, fontSize: 10, fontWeight: '800' },
  main: { color: colors.danger, fontSize: 20, fontWeight: '900', lineHeight: 22 },
  compactTop: { fontSize: 7 },
  compactMain: { fontSize: 12, lineHeight: 13 },
});
