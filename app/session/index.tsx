import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { LiveHikingWidget } from '@/components/live/LiveHikingWidget';
import { Screen } from '@/components/ui/Screen';
import { useApp } from '@/context/AppContext';
import { colors, radius, spacing } from '@/theme';
import { calculateDistanceKm, isNearSummit } from '@/utils/distanceUtils';

export default function ActiveSessionScreen() {
  const { activeSession, mountains } = useApp();
  if (!activeSession) return <Screen><EmptyState title="진행 중인 등산이 없어요" description="산 상세 화면에서 등산 시작을 눌러 라이브 타이머를 시작하세요." actionLabel="산 목록 보기" onAction={() => { router.dismissAll(); router.replace('/mountains'); }} /></Screen>;
  const mountain = mountains.find((item) => item.id === activeSession.mountainId);
  const distance = mountain && activeSession.lastKnownLatitude !== undefined && activeSession.lastKnownLongitude !== undefined ? calculateDistanceKm(activeSession.lastKnownLatitude, activeSession.lastKnownLongitude, mountain.latitude, mountain.longitude) : undefined;
  return <Screen title="진행 중인 등산" subtitle="앱을 닫아도 시작 시각을 기준으로 시간이 이어져요"><LiveHikingWidget session={activeSession} /><View style={styles.safety}><Text style={styles.safetyTitle}>{distance !== undefined && isNearSummit(distance) ? '정상 근처에 도착했어요. 도장을 찍을까요?' : '안전 산행 확인'}</Text><Text style={styles.safetyText}>{distance !== undefined ? `정상까지 약 ${distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`} 남았어요.` : '위치 권한 없이 수동으로 기록 중이에요.'} 휴식과 수분 섭취를 잊지 마세요.</Text></View><View style={styles.info}><Text style={styles.infoTitle}>다시 열어도 정확한 이유</Text><Text style={styles.infoText}>산도장은 세션 시작, 일시정지, 재시작 시각을 SQLite에 저장합니다. 화면 타이머가 멈춰도 저장된 시각으로 경과 시간을 다시 계산해요.</Text></View></Screen>;
}

const styles = StyleSheet.create({ safety: { backgroundColor: colors.beige, padding: spacing.xl, borderRadius: radius.lg }, safetyTitle: { color: colors.forest, fontSize: 17, fontWeight: '900' }, safetyText: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: spacing.xs }, info: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: spacing.lg }, infoTitle: { color: colors.ink, fontWeight: '900' }, infoText: { color: colors.muted, fontSize: 12, lineHeight: 19, marginTop: spacing.xs } });
