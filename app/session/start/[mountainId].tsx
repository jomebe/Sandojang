import { router, useLocalSearchParams } from 'expo-router';
import { Alert } from 'react-native';
import { useState } from 'react';

import { EmptyState } from '@/components/EmptyState';
import { HikingSessionStartModal } from '@/components/live/HikingSessionStartModal';
import { Screen } from '@/components/ui/Screen';
import { useApp } from '@/context/AppContext';
import { hikingSessionService } from '@/services/hikingSessionService';
import { notificationService } from '@/services/notificationService';
import type { HikingSessionInput } from '@/types/models';

export default function StartSessionScreen() {
  const { mountainId } = useLocalSearchParams<{ mountainId: string }>();
  const { mountains, activeSession, refresh } = useApp();
  const [loading, setLoading] = useState(false);
  const mountain = mountains.find((item) => item.id === mountainId);
  if (!mountain) return <Screen><EmptyState title="산 정보를 찾을 수 없어요" onAction={() => router.back()} actionLabel="뒤로 가기" /></Screen>;
  const endExisting = async () => { if (!activeSession) return; await hikingSessionService.finish(activeSession.id, true); await notificationService.cancelSessionNotifications(activeSession.id); await refresh(); };
  const start = async (input: HikingSessionInput) => {
    if (activeSession) {
      Alert.alert('이미 진행 중인 등산이 있어요.', `${activeSession.mountainName} 등산을 먼저 마쳐야 해요.`, [{ text: '닫기' }, { text: '진행 중인 등산 보기', onPress: () => router.replace('/session') }, { text: '기존 등산 종료', style: 'destructive', onPress: () => void endExisting() }]);
      return;
    }
    setLoading(true);
    try {
      const session = await hikingSessionService.start(input);
      await refresh();
      const notifications = await notificationService.scheduleForSession(session);
      if (notifications) await notificationService.sendStarted(session);
      router.replace('/session');
    } catch (error) { Alert.alert('등산을 시작하지 못했어요', error instanceof Error ? error.message : '잠시 후 다시 시도해 주세요.'); }
    finally { setLoading(false); }
  };
  return <Screen title="등산 라이브 타이머" subtitle="목표와 예상 시간을 정하면 산행 진행을 기록해요"><HikingSessionStartModal mountain={mountain} loading={loading} onStart={(input) => void start(input)} /></Screen>;
}
