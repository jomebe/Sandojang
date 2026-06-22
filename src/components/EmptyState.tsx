import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import { AppButton } from '@/components/ui/AppButton';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function EmptyState({ title, description, actionLabel, onAction, icon = 'trail-sign-outline' }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.icon}><Ionicons name={icon} size={31} color={colors.forest} /></View>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionLabel && onAction && <AppButton label={actionLabel} onPress={onAction} compact style={styles.button} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, alignItems: 'center', backgroundColor: colors.sand, borderRadius: radius.lg, gap: spacing.sm },
  icon: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.beige, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  title: { color: colors.ink, fontWeight: '900', fontSize: 17, textAlign: 'center' },
  description: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  button: { marginTop: spacing.sm },
});
