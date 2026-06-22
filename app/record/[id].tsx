import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { RecordForm } from '@/components/forms/RecordForm';
import { Screen } from '@/components/ui/Screen';
import { useApp } from '@/context/AppContext';
import { climbRecordService } from '@/services/climbRecordService';

export default function EditRecordScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { mountains, records, refresh } = useApp();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const record = records.find((item) => item.id === id);
  if (!record) return <Screen><EmptyState title="기록을 찾을 수 없어요" actionLabel="뒤로 가기" onAction={() => router.back()} /></Screen>;
  const remove = async () => { await climbRecordService.remove(record.id); await refresh(); setConfirmDelete(false); router.back(); };
  return <Screen title="기록 수정" subtitle="변경한 내용은 바로 통계와 도장판에 반영돼요"><RecordForm mountains={mountains} initial={record} onSave={async (input) => { await climbRecordService.update(record.id, input); await refresh(); router.back(); }} onDelete={() => setConfirmDelete(true)} /><ConfirmDialog visible={confirmDelete} title="이 기록을 삭제할까요?" message="이 산의 마지막 기록이라면 완등 도장도 함께 사라져요." confirmLabel="기록 삭제" destructive onConfirm={() => void remove()} onCancel={() => setConfirmDelete(false)} /></Screen>;
}
