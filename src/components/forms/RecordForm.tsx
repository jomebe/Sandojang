import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Image, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { FilterChips } from '@/components/FilterChips';
import { SearchBar } from '@/components/SearchBar';
import { AppButton } from '@/components/ui/AppButton';
import { locationService } from '@/services/locationService';
import { colors, radius, spacing } from '@/theme';
import type { ClimbRecord, ClimbRecordInput, Difficulty, MountainWithProgress, VerificationType } from '@/types/models';
import { toDateInput } from '@/utils/dateFormatUtils';

interface RecordFormProps {
  mountains: MountainWithProgress[];
  initial?: ClimbRecord;
  initialMountainId?: string;
  initialDurationMinutes?: number;
  initialVerification?: VerificationType;
  onSave: (input: ClimbRecordInput) => Promise<void>;
  onDelete?: () => void;
}

const weatherOptions = ['맑음', '흐림', '비', '눈', '안개'];

export function RecordForm({ mountains, initial, initialMountainId, initialDurationMinutes, initialVerification, onSave, onDelete }: RecordFormProps) {
  const [mountainId, setMountainId] = useState(initial?.mountainId ?? initialMountainId ?? mountains[0]?.id ?? '');
  const [date, setDate] = useState(() => new Date(initial?.climbedAt ?? Date.now()));
  const [showDate, setShowDate] = useState(false);
  const [memo, setMemo] = useState(initial?.memo ?? '');
  const [weather, setWeather] = useState(initial?.weather ?? '맑음');
  const [difficulty, setDifficulty] = useState<Difficulty>(initial?.difficulty ?? 'normal');
  const [companions, setCompanions] = useState(initial?.companions ?? '');
  const [duration, setDuration] = useState(String(initial?.durationMinutes ?? initialDurationMinutes ?? 0));
  const [photos, setPhotos] = useState(initial?.photoUris ?? []);
  const [verification, setVerification] = useState<VerificationType>(initial?.verificationType ?? initialVerification ?? 'manual');
  const [distance, setDistance] = useState<number>();
  const [mountainPicker, setMountainPicker] = useState(false);
  const [mountainQuery, setMountainQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const mountain = mountains.find((item) => item.id === mountainId);
  const pickerData = useMemo(() => mountains.filter((item) => item.nameKo.includes(mountainQuery.trim())), [mountains, mountainQuery]);
  const addPhotos = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert('사진 권한이 필요해요', '등산 사진을 추가하려면 사진 접근을 허용해 주세요.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, quality: 0.85, selectionLimit: 8 });
    if (!result.canceled) setPhotos((current) => [...new Set([...current, ...result.assets.map((asset) => asset.uri)])].slice(0, 12));
  };
  const verifyGps = async () => {
    if (!mountain) return;
    const result = await locationService.getCurrentLocation();
    if (!result.granted || result.latitude === undefined || result.longitude === undefined) { Alert.alert('수동 기록으로 저장돼요', '위치 권한이 없어 GPS 정상 인증을 할 수 없어요.'); return; }
    const nextDistance = locationService.distanceTo(result.latitude, result.longitude, mountain.latitude, mountain.longitude);
    setDistance(nextDistance);
    if (locationService.isSummitVerified(nextDistance)) { setVerification('gps'); Alert.alert('정상 근처 인증 완료', `${mountain.nameKo} 정상에서 약 ${Math.round(nextDistance * 1000)}m 떨어져 있어요.`); }
    else { setVerification('manual'); Alert.alert('정상과 거리가 있어요', `현재 정상에서 약 ${nextDistance.toFixed(1)}km 떨어져 있어요. 수동 기록으로 저장할 수 있어요.`); }
  };
  const submit = async () => {
    const durationMinutes = Number.parseInt(duration, 10);
    if (!mountainId) { Alert.alert('산을 선택해 주세요.'); return; }
    if (!Number.isFinite(durationMinutes) || durationMinutes < 0) { Alert.alert('소요 시간을 확인해 주세요.'); return; }
    setSaving(true);
    try { await onSave({ mountainId, climbedAt: date.toISOString(), memo: memo.trim(), weather, difficulty, companions: companions.trim(), durationMinutes, photoUris: photos, verificationType: verification }); }
    catch (error) { Alert.alert('저장하지 못했어요', error instanceof Error ? error.message : '잠시 후 다시 시도해 주세요.'); }
    finally { setSaving(false); }
  };
  return (
    <View style={styles.form}>
      <Field label="산 선택"><Pressable onPress={() => setMountainPicker(true)} style={styles.select}><Text style={styles.selectText}>{mountain?.nameKo ?? '산을 선택해 주세요'}</Text><Ionicons name="chevron-down" size={18} color={colors.muted} /></Pressable></Field>
      <Field label="오른 날짜"><Pressable onPress={() => setShowDate(true)} style={styles.select}><Text style={styles.selectText}>{toDateInput(date)}</Text><Ionicons name="calendar-outline" size={18} color={colors.muted} /></Pressable>{showDate && <DateTimePicker value={date} mode="date" maximumDate={new Date()} onChange={(_, selected) => { if (Platform.OS !== 'ios') setShowDate(false); if (selected) setDate(selected); }} />}</Field>
      <Field label="날씨"><FilterChips options={weatherOptions.map((value) => ({ label: value, value }))} selected={weather} onSelect={setWeather} /></Field>
      <Field label="난이도"><FilterChips options={[{ label: '쉬움', value: 'easy' }, { label: '보통', value: 'normal' }, { label: '어려움', value: 'hard' }]} selected={difficulty} onSelect={setDifficulty} /></Field>
      <Field label="소요 시간 (분)"><TextInput value={duration} onChangeText={setDuration} keyboardType="number-pad" placeholder="예: 180" placeholderTextColor={colors.locked} style={styles.input} /></Field>
      <Field label="동행자"><TextInput value={companions} onChangeText={setCompanions} placeholder="함께 오른 사람 (선택)" placeholderTextColor={colors.locked} style={styles.input} /></Field>
      <Field label="메모"><TextInput value={memo} onChangeText={setMemo} placeholder="오늘 산행을 기록해 보세요" placeholderTextColor={colors.locked} multiline textAlignVertical="top" style={[styles.input, styles.memo]} /></Field>
      <Field label="사진"><View style={styles.photos}>{photos.map((uri) => <Pressable key={uri} onPress={() => setPhotos((current) => current.filter((item) => item !== uri))}><Image source={{ uri }} style={styles.photo} /><View style={styles.remove}><Ionicons name="close" size={12} color={colors.white} /></View></Pressable>)}<Pressable onPress={() => void addPhotos()} style={styles.addPhoto}><Ionicons name="camera-outline" size={25} color={colors.forest} /><Text style={styles.addPhotoText}>사진 추가</Text></Pressable></View><Text style={styles.hint}>사진을 누르면 목록에서 제거돼요.</Text></Field>
      <View style={[styles.verification, verification === 'gps' && styles.verified]}><Ionicons name={verification === 'gps' ? 'shield-checkmark' : 'location-outline'} size={26} color={verification === 'gps' ? colors.forest : colors.muted} /><View style={styles.verificationBody}><Text style={styles.verificationTitle}>{verification === 'gps' ? '정상 근처 인증 완료' : '수동 기록'}</Text><Text style={styles.hint}>{distance !== undefined ? `정상과 거리 ${distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}` : '정상 300m 안에서 GPS 인증할 수 있어요.'}</Text></View><AppButton compact label="GPS 확인" variant="secondary" onPress={() => void verifyGps()} /></View>
      <AppButton label={initial ? '변경사항 저장' : '등산 기록 저장'} loading={saving} onPress={() => void submit()} />
      {onDelete && <AppButton label="기록 삭제" variant="danger" onPress={onDelete} />}
      <MountainPicker visible={mountainPicker} data={pickerData} query={mountainQuery} onQuery={setMountainQuery} onClose={() => setMountainPicker(false)} onSelect={(id) => { setMountainId(id); setVerification('manual'); setDistance(undefined); setMountainPicker(false); }} />
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <View style={styles.field}><Text style={styles.label}>{label}</Text>{children}</View>; }

function MountainPicker({ visible, data, query, onQuery, onClose, onSelect }: { visible: boolean; data: MountainWithProgress[]; query: string; onQuery: (value: string) => void; onClose: () => void; onSelect: (id: string) => void }) {
  return <Modal visible={visible} animationType="slide" onRequestClose={onClose}><View style={styles.modal}><View style={styles.modalHeader}><Text style={styles.modalTitle}>산 선택</Text><Pressable onPress={onClose}><Text style={styles.closeText}>닫기</Text></Pressable></View><SearchBar value={query} onChangeText={onQuery} /><FlatList data={data} keyExtractor={(item) => item.id} renderItem={({ item }) => <Pressable onPress={() => onSelect(item.id)} style={styles.mountainRow}><View><Text style={styles.mountainName}>{item.nameKo}</Text><Text style={styles.mountainMeta}>{item.region} · {item.altitudeMeters}m</Text></View>{item.climbed && <Text style={styles.done}>완등</Text>}</Pressable>} /></View></Modal>;
}

const styles = StyleSheet.create({
  form: { gap: spacing.xl }, field: { gap: spacing.sm }, label: { color: colors.ink, fontSize: 14, fontWeight: '900' }, select: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white }, selectText: { color: colors.ink, fontSize: 15, fontWeight: '700' }, input: { minHeight: 52, paddingHorizontal: spacing.lg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, color: colors.ink, fontSize: 15 }, memo: { height: 120, paddingTop: spacing.lg }, photos: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, photo: { width: 88, height: 88, borderRadius: radius.sm, backgroundColor: colors.sand }, remove: { position: 'absolute', right: -4, top: -4, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.danger }, addPhoto: { width: 88, height: 88, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line, borderStyle: 'dashed', backgroundColor: colors.sand }, addPhotoText: { color: colors.forest, fontSize: 11, fontWeight: '800', marginTop: 4 }, hint: { color: colors.muted, fontSize: 11, lineHeight: 16 }, verification: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.sand }, verified: { backgroundColor: '#E4F1E9', borderWidth: 1, borderColor: '#B6D5C2' }, verificationBody: { flex: 1 }, verificationTitle: { color: colors.ink, fontWeight: '900', fontSize: 13 }, modal: { flex: 1, paddingTop: 62, paddingHorizontal: spacing.lg, backgroundColor: colors.paper, gap: spacing.lg }, modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, modalTitle: { color: colors.ink, fontSize: 24, fontWeight: '900' }, closeText: { color: colors.forest, fontWeight: '800' }, mountainRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.line }, mountainName: { color: colors.ink, fontWeight: '900' }, mountainMeta: { color: colors.muted, fontSize: 11, marginTop: 3 }, done: { color: colors.danger, fontSize: 11, fontWeight: '900' },
});
