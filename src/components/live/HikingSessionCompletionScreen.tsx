import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { colors, radius, spacing } from '@/theme';
import type { HikingSession } from '@/types/models';
import { formatDuration, formatKoreanTime } from '@/utils/dateFormatUtils';
import { getElapsedMinutes } from '@/utils/timeProgressUtils';

export function HikingSessionCompletionScreen({ session, onSave, onDiscard, loading }: { session: HikingSession; onSave: () => void; onDiscard: () => void; loading?: boolean }) {
  const elapsed = getElapsedMinutes(session);
  return <View style={styles.root}>
    <View style={styles.stamp}><Text style={styles.stampTop}>산도장</Text><Text style={styles.stampMain}>수고했어요</Text></View>
    <Text style={styles.title}>{session.mountainName} 등산을{`\n`}마칠까요?</Text>
    <Text style={styles.subtitle}>등산 기록으로 저장하면 지도와 도장판에 바로 반영돼요.</Text>
    <View style={styles.summary}><Summary label="시작" value={formatKoreanTime(session.startedAt)} /><Summary label="종료" value={formatKoreanTime(new Date().toISOString())} /><Summary label="소요" value={formatDuration(elapsed)} /><Summary label="인증" value={session.verificationType === 'gps' ? 'GPS' : '수동'} /></View>
    <View style={styles.prefill}><Text style={styles.prefillTitle}>기록에 미리 채워져요</Text><Text style={styles.prefillText}>산 · 시작/종료 시각 · {elapsed}분 · {session.verificationType === 'gps' ? 'GPS 인증' : '수동 기록'}</Text></View>
    <AppButton label="기록 저장" loading={loading} onPress={onSave} />
    <AppButton label="기록 없이 종료" disabled={loading} variant="secondary" onPress={onDiscard} />
  </View>;
}

function Summary({ label, value }: { label: string; value: string }) { return <View style={styles.summaryItem}><Text style={styles.summaryLabel}>{label}</Text><Text style={styles.summaryValue}>{value}</Text></View>; }

const styles = StyleSheet.create({
  root: { gap: spacing.lg, alignItems: 'stretch' }, stamp: { alignSelf: 'center', width: 112, height: 112, borderRadius: 56, borderWidth: 4, borderColor: colors.danger, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-6deg' }], backgroundColor: '#FFF4E9' }, stampTop: { color: colors.danger, fontSize: 12, fontWeight: '800' }, stampMain: { color: colors.danger, fontSize: 20, fontWeight: '900' }, title: { color: colors.ink, fontSize: 28, lineHeight: 37, fontWeight: '900', textAlign: 'center' }, subtitle: { color: colors.muted, lineHeight: 21, textAlign: 'center' }, summary: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm }, summaryItem: { width: '48%', flexGrow: 1, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: spacing.lg }, summaryLabel: { color: colors.muted, fontSize: 11 }, summaryValue: { color: colors.ink, fontSize: 17, fontWeight: '900', marginTop: 3 }, prefill: { backgroundColor: colors.beige, borderRadius: radius.md, padding: spacing.lg }, prefillTitle: { color: colors.forest, fontWeight: '900' }, prefillText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
});
