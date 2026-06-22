import type { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

interface ScreenProps extends PropsWithChildren {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
}

export function Screen({ title, subtitle, right, scroll = true, style, children }: ScreenProps) {
  const content = (
    <View style={[styles.content, style]}>
      {(title || right) && (
        <View style={styles.header}>
          <View style={styles.headerText}>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          {right}
        </View>
      )}
      {children}
    </View>
  );
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      {scroll ? <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">{content}</ScrollView> : content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { flexGrow: 1 },
  content: { flex: 1, padding: spacing.lg, gap: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  headerText: { flex: 1 },
  title: { color: colors.ink, fontSize: 29, lineHeight: 36, fontWeight: '900', letterSpacing: -1.1 },
  subtitle: { color: colors.muted, marginTop: spacing.xs, fontSize: 14, lineHeight: 20 },
});
