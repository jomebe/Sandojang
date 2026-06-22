import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'dark' | 'ghost';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  compact?: boolean;
  style?: ViewStyle;
}

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  compact,
  style,
}: AppButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        styles[variant],
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={variant === 'secondary' || variant === 'ghost' ? colors.forest : colors.white} /> : (
        <Text style={[styles.label, (variant === 'secondary' || variant === 'ghost') && styles.darkLabel]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  compact: { minHeight: 38, paddingHorizontal: spacing.md, borderRadius: radius.sm },
  primary: { backgroundColor: colors.forest },
  secondary: { backgroundColor: colors.sand, borderColor: colors.line, borderWidth: 1 },
  danger: { backgroundColor: colors.danger },
  dark: { backgroundColor: colors.black },
  ghost: { backgroundColor: 'transparent' },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.45 },
  label: { color: colors.white, fontWeight: '800', fontSize: 15 },
  darkLabel: { color: colors.forest },
});
