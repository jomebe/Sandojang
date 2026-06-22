import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { EmptyState } from '@/components/EmptyState';
import { KoreaMountainMap } from '@/components/map/KoreaMountainMap';
import { MountainBottomSheet } from '@/components/map/MountainBottomSheet';
import { Screen } from '@/components/ui/Screen';
import { useApp } from '@/context/AppContext';
import type { MountainWithProgress } from '@/types/models';

export default function FocusedMountainMapScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { mountains } = useApp();
  const focused = mountains.find((mountain) => mountain.id === id);
  const [selected, setSelected] = useState<MountainWithProgress | undefined>(focused);

  if (!focused) {
    return (
      <Screen>
        <EmptyState title="산 위치를 찾을 수 없어요" actionLabel="산 다시 찾기" onAction={() => router.replace('/discover')} />
      </Screen>
    );
  }

  return (
    <KoreaMountainMap
      mountains={mountains}
      focusMountain={focused}
      onSelect={setSelected}
    >
      {selected && <MountainBottomSheet mountain={selected} onClose={() => setSelected(undefined)} />}
    </KoreaMountainMap>
  );
}
