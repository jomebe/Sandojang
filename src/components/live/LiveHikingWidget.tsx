import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { useApp } from '@/context/AppContext';
import { useLiveClock } from '@/hooks/useLiveClock';
import { hikingSessionService } from '@/services/hikingSessionService';
import { colors, radius, shadow, spacing } from '@/theme';
import type { HikingSession } from '@/types/models';
import { formatDuration, formatKoreanTime } from '@/utils/dateFormatUtils';
import { calculateDistanceKm } from '@/utils/distanceUtils';
import { getElapsedMinutes, getProgress, getRemainingMinutes } from '@/utils/timeProgressUtils';
import { ProgressSegmentBar } from './ProgressSegmentBar';

export function LiveHikingWidget({ session, compact = false }: { session: HikingSession; compact?: boolean }) {
  const { mountains, refresh } = useApp();
  const now = useLiveClock(compact ? 10_000 : 1_000);
  const progress = getProgress(session, now);
  const remaining = getRemainingMinutes(session, now);
  const elapsed = getElapsedMinutes(session, now);
  const mountain = mountains.find((item) => item.id === session.mountainId);
  const distance =
    mountain && session.lastKnownLatitude !== undefined && session.lastKnownLongitude !== undefined
      ? calculateDistanceKm(session.lastKnownLatitude, session.lastKnownLongitude, mountain.latitude, mountain.longitude)
      : undefined;
  const togglePause = async () => {
    if (session.status === 'paused') await hikingSessionService.resume(session);
    else await hikingSessionService.pause(session);
    await refresh();
  };
  return (
    <Pressable onPress={() => router.push('/session')} style={[styles.card, compact && styles.compact, shadow]}>
      <View style={styles.brandRow}>
        <View style={styles.brand}><Ionicons name="triangle" size={15} color={colors.yellow} /><Text style={styles.brandText}>산도장 라이브</Text></View>
        <View style={styles.liveDot} /><Text style={styles.liveText}>{session.status === 'paused' ? '휴식 중' : '등산 중'}</Text>
      </View>
      <View style={styles.mainRow}>
        <View style={styles.mainText}>
          <Text style={styles.eyebrow}>현재</Text>
          <Text style={styles.title} numberOfLines={1}>{session.mountainName} {session.status === 'paused' ? '휴식 중' : '등산 중'}</Text>
        </View>
        <View style={styles.timeBlock}>
          <Text style={styles.eyebrow}>남은 시간</Text>
          <Text style={styles.time}>{remaining}분</Text>
        </View>
      </View>
      {!compact && (
        <>
          <View style={styles.detailRow}>
            <View><Text style={styles.eyebrow}>다음</Text><Text style={styles.detail}>{session.goalName}</Text></View>
            <View><Text style={styles.eyebrow}>도착 예상</Text><Text style={styles.detail}>{formatKoreanTime(session.estimatedArrivalAt)}</Text></View>
            <View><Text style={styles.eyebrow}>경과</Text><Text style={styles.detail}>{formatDuration(elapsed)}</Text></View>
          </View>
          {distance !== undefined ? <Text style={styles.distance}>정상까지 약 {distance.toFixed(distance < 1 ? 2 : 1)}km</Text> : <Text style={styles.manual}>위치 권한 없이 수동으로 기록 중이에요.</Text>}
        </>
      )}
      <ProgressSegmentBar progress={progress} />
      {!compact && (
        <View style={styles.actions}>
          <AppButton compact variant="secondary" label={session.status === 'paused' ? '다시 시작' : '일시정지'} onPress={() => void togglePause()} style={styles.action} />
          <AppButton compact variant="danger" label="종료" onPress={() => router.push('/session/complete')} style={styles.action} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.black, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  compact: { padding: spacing.md, gap: spacing.sm },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  brand: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandText: { color: colors.beige, fontSize: 11, fontWeight: '800' },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.yellow, marginRight: 5 },
  liveText: { color: colors.yellow, fontSize: 11, fontWeight: '800' },
  mainRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  mainText: { flex: 1 },
  timeBlock: { alignItems: 'flex-end' },
  eyebrow: { color: '#9BA49D', fontSize: 10, fontWeight: '700', marginBottom: 2 },
  title: { color: colors.white, fontSize: 20, fontWeight: '900' },
  time: { color: colors.yellow, fontSize: 22, fontWeight: '900' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  detail: { color: colors.white, fontSize: 13, fontWeight: '800' },
  distance: { color: '#A8D3BC', fontSize: 12, fontWeight: '700' },
  manual: { color: '#ADB2AE', fontSize: 11 },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1 },
});
