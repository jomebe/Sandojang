import { ScrollView, Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing } from '@/theme';

export interface FilterOption<T extends string> { label: string; value: T }

interface FilterChipsProps<T extends string> {
  options: FilterOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
}

export function FilterChips<T extends string>({ options, selected, onSelect }: FilterChipsProps<T>) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {options.map((option) => {
        const active = selected === option.value;
        return (
          <Pressable key={option.value} onPress={() => onSelect(option.value)} style={[styles.chip, active && styles.active]}>
            <Text style={[styles.label, active && styles.activeLabel]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingVertical: spacing.xs },
  chip: { paddingHorizontal: spacing.lg, paddingVertical: 10, borderRadius: radius.pill, backgroundColor: colors.sand },
  active: { backgroundColor: colors.forest },
  label: { color: colors.muted, fontSize: 14, fontWeight: '700' },
  activeLabel: { color: colors.white },
});
