import { router, useLocalSearchParams } from 'expo-router';

import { RecordForm } from '@/components/forms/RecordForm';
import { Screen } from '@/components/ui/Screen';
import { useApp } from '@/context/AppContext';
import { climbRecordService } from '@/services/climbRecordService';
import { getElapsedMinutes } from '@/utils/timeProgressUtils';

export default function NewRecordScreen() {
  const params = useLocalSearchParams<{ mountainId?: string; sessionId?: string }>();
  const { mountains, sessions, refresh } = useApp();
  const session = sessions.find((item) => item.id === params.sessionId);
  return <Screen title="등산 기록" subtitle="오늘의 산행과 도장을 기기에 안전하게 남겨요"><RecordForm mountains={mountains} initialMountainId={params.mountainId ?? session?.mountainId} initialDurationMinutes={session ? getElapsedMinutes(session, Date.parse(session.finishedAt ?? new Date().toISOString())) : undefined} initialVerification={session?.verificationType} onSave={async (input) => { await climbRecordService.create(input); await refresh(); router.dismissAll(); router.replace(`/mountain/${input.mountainId}`); }} /></Screen>;
}
