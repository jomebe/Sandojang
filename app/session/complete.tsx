import { router } from 'expo-router';
import { Alert } from 'react-native';
import { useState } from 'react';

import { EmptyState } from '@/components/EmptyState';
import { HikingSessionCompletionScreen } from '@/components/live/HikingSessionCompletionScreen';
import { Screen } from '@/components/ui/Screen';
import { useApp } from '@/context/AppContext';
import { hikingSessionService } from '@/services/hikingSessionService';
import { notificationService } from '@/services/notificationService';

export default function CompleteSessionScreen() {
  const { activeSession, refresh } = useApp();
  const [loading, setLoading] = useState(false);
  if (!activeSession) return <Screen><EmptyState title="종료할 등산이 없어요" actionLabel="닫기" onAction={() => router.back()} /></Screen>;
  const finish = async (save: boolean) => {
    setLoading(true);
    try {
      await hikingSessionService.finish(activeSession.id, !save);
      await notificationService.cancelSessionNotifications(activeSession.id);
      await refresh();
      if (save) router.replace({ pathname: '/record/new', params: { mountainId: activeSession.mountainId, sessionId: activeSession.id } });
      else { router.dismissAll(); router.replace('/'); }
    } catch (error) { Alert.alert('등산을 종료하지 못했어요', error instanceof Error ? error.message : '잠시 후 다시 시도해 주세요.'); }
    finally { setLoading(false); }
  };
  return <Screen><HikingSessionCompletionScreen session={activeSession} loading={loading} onSave={() => void finish(true)} onDiscard={() => Alert.alert('기록 없이 종료할까요?', '라이브 세션은 종료되며 완등 기록과 도장은 남지 않아요.', [{ text: '취소', style: 'cancel' }, { text: '종료', style: 'destructive', onPress: () => void finish(false) }])} /></Screen>;
}
