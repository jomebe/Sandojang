import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import type { Achievement } from '@/types/models';

export function AchievementBadge({ achievement }: { achievement: Achievement }) {
  const unlocked = Boolean(achievement.unlockedAt);
  return (
    <View style={[styles.card, !unlocked && styles.locked]}>
      <View style={[styles.icon, unlocked && styles.iconUnlocked]}>
        <Ionicons name={unlocked ? 'ribbon' : 'lock-closed'} size={25} color={unlocked ? colors.yellow : colors.muted} />
      </View>
      <Text style={styles.title}>{achievement.title}</Text>
      <Text style={styles.description}>{achievement.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: 142, minHeight: 150, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' },
  locked: { backgroundColor: '#E6E5DF' },
  icon: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#D5D6D0', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  iconUnlocked: { backgroundColor: colors.forestSoft },
  title: { color: colors.ink, fontWeight: '900', textAlign: 'center' },
  description: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: spacing.xs, textAlign: 'center' },
});
