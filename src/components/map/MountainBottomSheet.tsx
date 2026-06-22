import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { useApp } from '@/context/AppContext';
import { climbRecordService } from '@/services/climbRecordService';
import { colors, radius, shadow, spacing } from '@/theme';
import type { MountainWithProgress } from '@/types/models';
import { formatKoreanDate } from '@/utils/dateFormatUtils';

export function MountainBottomSheet({ mountain, onClose }: { mountain: MountainWithProgress; onClose: () => void }) {
  const { refresh } = useApp();
  const stamp = () => {
    Alert.alert('도장을 찍을까요?', `${mountain.nameKo} 완등 기록이 오늘 날짜로 저장돼요.`, [
      { text: '취소', style: 'cancel' },
      {
        text: '도장 찍기',
        onPress: () => void climbRecordService.create({
          mountainId: mountain.id,
          climbedAt: new Date().toISOString(),
          memo: '',
          weather: '',
          difficulty: 'normal',
          companions: '',
          durationMinutes: 0,
          photoUris: [],
          verificationType: 'manual',
        }).then(refresh),
      },
    ]);
  };
  return (
    <View style={[styles.card, shadow]}>
      <View style={styles.handle} />
      <Pressable accessibilityLabel="산 정보 닫기" onPress={onClose} style={styles.close}>
        <Ionicons name="close" size={21} color={colors.muted} />
      </Pressable>
      <View style={styles.titleRow}>
        <View style={styles.titleBody}>
          <Text style={styles.region}>{mountain.region}</Text>
          <Text style={styles.title}>{mountain.nameKo}</Text>
          <Text style={styles.altitude}>해발 {mountain.altitudeMeters.toLocaleString('ko-KR')}m</Text>
        </View>
        <View style={[styles.status, mountain.climbed && styles.statusDone]}>
          <Text style={[styles.statusText, mountain.climbed && styles.statusDoneText]}>{mountain.climbed ? '완등' : '미완등'}</Text>
        </View>
      </View>
      <Text style={styles.summary}>
        등산 기록 {mountain.recordCount}개 · 최근 완등 {mountain.lastClimbedAt ? formatKoreanDate(mountain.lastClimbedAt) : '없음'}
      </Text>
      <View style={styles.actions}>
        <AppButton compact label="기록 보기" variant="secondary" onPress={() => router.push(`/mountain/${mountain.id}`)} style={styles.button} />
        <AppButton compact label="등산 기록 추가" variant="secondary" onPress={() => router.push({ pathname: '/record/new', params: { mountainId: mountain.id } })} style={styles.button} />
      </View>
      <View style={styles.actions}>
        <AppButton compact label="도장 찍기" onPress={stamp} style={styles.button} />
        <AppButton compact label="등산 시작" variant="dark" onPress={() => router.push(`/session/start/${mountain.id}`)} style={styles.button} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { position: 'absolute', left: spacing.md, right: spacing.md, bottom: spacing.md, backgroundColor: colors.paper, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  handle: { alignSelf: 'center', width: 38, height: 4, borderRadius: 2, backgroundColor: colors.line, marginTop: -4 },
  close: { position: 'absolute', top: spacing.md, right: spacing.md, padding: spacing.xs },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingRight: spacing.xl },
  titleBody: { flex: 1 },
  region: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  title: { color: colors.ink, fontSize: 25, fontWeight: '900', marginTop: 2 },
  altitude: { color: colors.forestSoft, fontSize: 13, fontWeight: '800', marginTop: 3 },
  status: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.sand },
  statusDone: { backgroundColor: '#FFEAE0' },
  statusText: { color: colors.muted, fontWeight: '800', fontSize: 12 },
  statusDoneText: { color: colors.danger },
  summary: { color: colors.muted, fontSize: 12 },
  actions: { flexDirection: 'row', gap: spacing.sm },
  button: { flex: 1 },
});
