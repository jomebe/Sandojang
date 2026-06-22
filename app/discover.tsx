import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { SearchBar } from '@/components/SearchBar';
import { MountainCard } from '@/components/cards/MountainCard';
import { Screen } from '@/components/ui/Screen';
import { useApp } from '@/context/AppContext';
import { colors, spacing } from '@/theme';

export default function DiscoverScreen() {
  const { mountains } = useApp();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const keyword = query.trim();
    if (!keyword) return mountains;
    return mountains.filter((mountain) =>
      mountain.nameKo.includes(keyword) || mountain.region.includes(keyword),
    );
  }, [mountains, query]);

  return (
    <Screen
      title="어느 산에 오를까요?"
      subtitle="산을 고르면 지도에서 위치를 바로 보여드려요"
      scroll={false}
    >
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="산 이름이나 지역 검색"
        autoFocus
      />
      <View style={styles.resultRow}>
        <Text style={styles.resultTitle}>{query.trim() ? '검색 결과' : '전체 산'}</Text>
        <Text style={styles.resultCount}>{results.length}개</Text>
      </View>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MountainCard mountain={item} onPress={() => router.push(`/map/${item.id}`)} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Math.max(insets.bottom, spacing.lg) },
          results.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={(
          <EmptyState
            title="찾는 산이 없어요"
            description="산 이름이나 지역을 다시 확인해 주세요."
            icon="search-outline"
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  resultRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  resultTitle: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  resultCount: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  list: { paddingBottom: spacing.lg },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
  separator: { height: spacing.sm },
});
