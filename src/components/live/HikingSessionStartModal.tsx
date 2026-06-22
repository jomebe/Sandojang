import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { FilterChips } from '@/components/FilterChips';
import { AppButton } from '@/components/ui/AppButton';
import { locationService } from '@/services/locationService';
import { colors, radius, spacing } from '@/theme';
import type { HikingSessionInput, MountainWithProgress, VerificationType } from '@/types/models';

type Goal = '정상' | '하산' | '직접 입력';

export function HikingSessionStartModal({ mountain, onStart, loading }: { mountain: MountainWithProgress; onStart: (input: HikingSessionInput) => void; loading?: boolean }) {
  const [goal, setGoal] = useState<Goal>('정상');
  const [customGoal, setCustomGoal] = useState('');
  const [duration, setDuration] = useState('180');
  const [memo, setMemo] = useState('');
  const [verification, setVerification] = useState<VerificationType>('manual');
  const [startText, setStartText] = useState('시작 위치를 확인하지 않았어요');
  const checkLocation = async () => {
    const result = await locationService.getCurrentLocation();
    if (!result.granted || result.latitude === undefined || result.longitude === undefined) { setVerification('manual'); setStartText('위치 권한 없이 수동으로 기록해요'); return; }
    setVerification('gps');
    setStartText(`현재 위치 ${result.latitude.toFixed(4)}, ${result.longitude.toFixed(4)}`);
  };
  const submit = () => {
    const minutes = Number.parseInt(duration, 10);
    const goalName = goal === '직접 입력' ? customGoal.trim() : goal;
    if (!goalName) { Alert.alert('목표를 입력해 주세요.'); return; }
    if (!Number.isFinite(minutes) || minutes < 10 || minutes > 1440) { Alert.alert('예상 시간을 확인해 주세요', '10분부터 24시간 사이로 입력해 주세요.'); return; }
    onStart({ mountainId: mountain.id, mountainName: mountain.nameKo, goalName, estimatedDurationMinutes: minutes, verificationType: verification, memo: memo.trim() });
  };
  return <View style={styles.form}>
    <View style={styles.mountain}><View><Text style={styles.region}>{mountain.region}</Text><Text style={styles.name}>{mountain.nameKo}</Text><Text style={styles.altitude}>정상 {mountain.altitudeMeters.toLocaleString('ko-KR')}m</Text></View><Text style={styles.pin}>▲</Text></View>
    <Field label="목표"><FilterChips options={[{ label: '정상', value: '정상' }, { label: '하산', value: '하산' }, { label: '직접 입력', value: '직접 입력' }]} selected={goal} onSelect={setGoal} />{goal === '직접 입력' && <TextInput value={customGoal} onChangeText={setCustomGoal} placeholder="예: 백운대 쉼터" placeholderTextColor={colors.locked} style={styles.input} />}</Field>
    <Field label="예상 소요 시간 (분)"><TextInput value={duration} onChangeText={setDuration} keyboardType="number-pad" style={styles.input} /><Text style={styles.hint}>도착 예상 시간과 알림 계산에 사용해요.</Text></Field>
    <Field label="시작 위치 (선택)"><View style={styles.location}><Text style={styles.locationText}>{startText}</Text><AppButton compact label="현재 위치 확인" variant="secondary" onPress={() => void checkLocation()} /></View><Text style={styles.hint}>정상 위치: {mountain.latitude.toFixed(5)}, {mountain.longitude.toFixed(5)}</Text></Field>
    <Field label="메모 (선택)"><TextInput value={memo} onChangeText={setMemo} multiline textAlignVertical="top" placeholder="코스나 오늘의 목표를 적어보세요" placeholderTextColor={colors.locked} style={[styles.input, styles.memo]} /></Field>
    <View style={styles.notice}><Text style={styles.noticeTitle}>시간은 앱을 닫아도 이어져요</Text><Text style={styles.noticeText}>시작 시각을 기기에 저장해 다시 열었을 때 경과 시간을 정확히 계산합니다.</Text></View>
    <AppButton label={`${mountain.nameKo} 등산 시작`} variant="dark" loading={loading} onPress={submit} />
  </View>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <View style={styles.field}><Text style={styles.label}>{label}</Text>{children}</View>; }

const styles = StyleSheet.create({
  form: { gap: spacing.xl }, mountain: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.beige, padding: spacing.xl, borderRadius: radius.lg }, region: { color: colors.muted, fontSize: 12, fontWeight: '700' }, name: { color: colors.ink, fontSize: 27, fontWeight: '900', marginTop: 2 }, altitude: { color: colors.forestSoft, fontSize: 12, fontWeight: '800', marginTop: 4 }, pin: { color: colors.forest, fontSize: 42 }, field: { gap: spacing.sm }, label: { color: colors.ink, fontSize: 14, fontWeight: '900' }, input: { minHeight: 52, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, paddingHorizontal: spacing.lg, color: colors.ink, fontSize: 15 }, memo: { height: 100, paddingTop: spacing.lg }, hint: { color: colors.muted, fontSize: 11, lineHeight: 16 }, location: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.sand }, locationText: { flex: 1, color: colors.muted, fontSize: 12 }, notice: { padding: spacing.lg, borderRadius: radius.md, backgroundColor: '#E5F0E8' }, noticeTitle: { color: colors.forest, fontWeight: '900' }, noticeText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
});
