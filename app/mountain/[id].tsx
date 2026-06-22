import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { StampBadge } from '@/components/stamps/StampBadge';
import { AppButton } from '@/components/ui/AppButton';
import { Screen } from '@/components/ui/Screen';
import { useApp } from '@/context/AppContext';
import { climbRecordService } from '@/services/climbRecordService';
import { colors, radius, spacing } from '@/theme';
import { formatDuration, formatKoreanDate } from '@/utils/dateFormatUtils';

const difficultyLabel = { easy: '쉬움', normal: '보통', hard: '어려움' } as const;

export default function MountainDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { mountains, records, refresh } = useApp();
  const mountain = mountains.find((item) => item.id === id);
  const history = records.filter((record) => record.mountainId === id);
  if (!mountain) return <Screen><EmptyState title="산 정보를 찾을 수 없어요" actionLabel="산 목록으로" onAction={() => router.back()} /></Screen>;
  const stamp = () => Alert.alert('도장을 찍을까요?', '오늘 날짜로 수동 완등 기록을 저장해요.', [{ text: '취소', style: 'cancel' }, { text: '도장 찍기', onPress: () => void climbRecordService.create({ mountainId: mountain.id, climbedAt: new Date().toISOString(), memo: '', weather: '', difficulty: 'normal', companions: '', durationMinutes: 0, photoUris: [], verificationType: 'manual' }).then(refresh) }]);
  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.heroText}><Text style={styles.region}>{mountain.region}</Text><Text style={styles.name}>{mountain.nameKo}</Text><Text style={styles.altitude}>해발 {mountain.altitudeMeters.toLocaleString('ko-KR')}m</Text></View>
        <StampBadge completed={mountain.climbed} />
      </View>
      <View style={styles.info}><Info label="위도" value={mountain.latitude.toFixed(5)} /><Info label="경도" value={mountain.longitude.toFixed(5)} /><Info label="상태" value={mountain.climbed ? '완등' : '미완등'} /></View>
      <Text style={styles.description}>{mountain.description ?? `${mountain.region}에 위치한 ${mountain.nameKo}의 완등 기록을 남겨보세요.`}</Text>
      <View style={styles.actions}><AppButton label="등산 시작" variant="dark" onPress={() => router.push(`/session/start/${mountain.id}`)} style={styles.action} /><AppButton label="등산 기록 추가" onPress={() => router.push({ pathname: '/record/new', params: { mountainId: mountain.id } })} style={styles.action} /></View>
      <View style={styles.actions}><AppButton label="도장 찍기" variant="secondary" onPress={stamp} style={styles.action} /><AppButton label="기록 수정" variant="secondary" disabled={!history[0]} onPress={() => history[0] && router.push(`/record/${history[0].id}`)} style={styles.action} /></View>
      <View style={styles.sectionRow}><Text style={styles.sectionTitle}>등산 기록</Text><Text style={styles.count}>{history.length}개</Text></View>
      {history.length === 0 ? <EmptyState title="아직 도장이 없어요. 이 산을 올랐다면 첫 도장을 찍어보세요." actionLabel="첫 기록 남기기" onAction={() => router.push({ pathname: '/record/new', params: { mountainId: mountain.id } })} /> : (
        <View style={styles.timeline}>{history.map((record, index) => <Pressable key={record.id} onPress={() => router.push(`/record/${record.id}`)} style={styles.record}><View style={styles.lineColumn}><View style={styles.dot}>{index === 0 && <Ionicons name="checkmark" size={12} color={colors.white} />}</View>{index < history.length - 1 && <View style={styles.line} />}</View><View style={styles.recordBody}><View style={styles.recordTop}><Text style={styles.recordDate}>{formatKoreanDate(record.climbedAt)}</Text><Text style={styles.verification}>{record.verificationType === 'gps' ? 'GPS 인증' : '수동 기록'}</Text></View><Text style={styles.recordMeta}>{record.weather || '날씨 미기록'} · {difficultyLabel[record.difficulty]} · {formatDuration(record.durationMinutes)}</Text>{record.memo && <Text style={styles.memo}>{record.memo}</Text>}{record.photoUris.length > 0 && <View style={styles.photos}>{record.photoUris.map((uri) => <Image key={uri} source={{ uri }} style={styles.photo} />)}</View>}<Text style={styles.edit}>눌러서 수정</Text></View></Pressable>)}</View>
      )}
    </Screen>
  );
}

function Info({ label, value }: { label: string; value: string }) { return <View style={styles.infoItem}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>; }

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.beige, borderRadius: radius.lg, padding: spacing.xl },
  heroText: { flex: 1 }, region: { color: colors.muted, fontSize: 13, fontWeight: '700' }, name: { color: colors.ink, fontSize: 34, fontWeight: '900', marginTop: spacing.xs }, altitude: { color: colors.forestSoft, fontWeight: '800', marginTop: spacing.xs },
  info: { flexDirection: 'row', gap: spacing.sm }, infoItem: { flex: 1, backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: spacing.md }, infoLabel: { color: colors.muted, fontSize: 10 }, infoValue: { color: colors.ink, fontWeight: '800', fontSize: 13, marginTop: 3 },
  description: { color: colors.muted, fontSize: 14, lineHeight: 22 }, actions: { flexDirection: 'row', gap: spacing.sm }, action: { flex: 1 }, sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sectionTitle: { color: colors.ink, fontSize: 20, fontWeight: '900' }, count: { color: colors.muted, fontWeight: '700' }, timeline: { gap: 0 }, record: { flexDirection: 'row', gap: spacing.md }, lineColumn: { width: 24, alignItems: 'center' }, dot: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.forestSoft, alignItems: 'center', justifyContent: 'center' }, line: { width: 2, flex: 1, backgroundColor: colors.line }, recordBody: { flex: 1, backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.line }, recordTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, recordDate: { color: colors.ink, fontWeight: '900' }, verification: { color: colors.forestSoft, fontSize: 10, fontWeight: '800' }, recordMeta: { color: colors.muted, fontSize: 12, marginTop: spacing.xs }, memo: { color: colors.ink, fontSize: 13, lineHeight: 20, marginTop: spacing.md }, photos: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md }, photo: { width: 82, height: 82, borderRadius: radius.sm, backgroundColor: colors.sand }, edit: { color: colors.locked, fontSize: 10, marginTop: spacing.sm },
});
