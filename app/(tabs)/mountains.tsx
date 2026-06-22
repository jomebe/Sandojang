import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { FilterChips } from '@/components/FilterChips';
import { SearchBar } from '@/components/SearchBar';
import { MountainCard } from '@/components/cards/MountainCard';
import { LiveHikingWidget } from '@/components/live/LiveHikingWidget';
import { Screen } from '@/components/ui/Screen';
import { useApp } from '@/context/AppContext';
import { locationService } from '@/services/locationService';
import { colors, spacing } from '@/theme';

type StatusFilter = 'all' | 'climbed' | 'unclimbed';
type Sort = 'name' | 'altitude' | 'recent' | 'nearby';

export default function MountainsScreen() {
  const { mountains, activeSession } = useApp();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [region, setRegion] = useState('전체');
  const [sort, setSort] = useState<Sort>('name');
  const [location, setLocation] = useState<{ latitude: number; longitude: number }>();
  const regions = useMemo(() => ['전체', ...new Set(mountains.map((item) => item.region))], [mountains]);
  const data = useMemo(() => {
    let result = mountains.filter((mountain) => mountain.nameKo.includes(query.trim()));
    if (status !== 'all') result = result.filter((mountain) => mountain.climbed === (status === 'climbed'));
    if (region !== '전체') result = result.filter((mountain) => mountain.region === region);
    result = result.map((mountain) => location ? ({ ...mountain, distanceKm: locationService.distanceTo(location.latitude, location.longitude, mountain.latitude, mountain.longitude) }) : mountain);
    return [...result].sort((a, b) => {
      if (sort === 'altitude') return b.altitudeMeters - a.altitudeMeters;
      if (sort === 'recent') return Date.parse(b.lastClimbedAt ?? '1970-01-01') - Date.parse(a.lastClimbedAt ?? '1970-01-01');
      if (sort === 'nearby') return (a.distanceKm ?? Number.MAX_VALUE) - (b.distanceKm ?? Number.MAX_VALUE);
      return a.nameKo.localeCompare(b.nameKo, 'ko');
    });
  }, [mountains, query, status, region, sort, location]);
  const setSortWithPermission = async (value: Sort) => {
    if (value === 'nearby' && !location) {
      const result = await locationService.getCurrentLocation();
      if (!result.granted || result.latitude === undefined || result.longitude === undefined) return;
      setLocation({ latitude: result.latitude, longitude: result.longitude });
    }
    setSort(value);
  };
  return (
    <Screen title="산 목록" subtitle={`${mountains.length}개 산에서 다음 도장을 찾아보세요`} scroll={false}>
      {activeSession && <LiveHikingWidget session={activeSession} compact />}
      <SearchBar value={query} onChangeText={setQuery} />
      <FilterChips options={[{ label: '전체', value: 'all' }, { label: '오른 산', value: 'climbed' }, { label: '안 오른 산', value: 'unclimbed' }]} selected={status} onSelect={setStatus} />
      <View><Text style={styles.label}>지역</Text><FilterChips options={regions.map((value) => ({ label: value, value }))} selected={region} onSelect={setRegion} /></View>
      <View><Text style={styles.label}>정렬</Text><FilterChips options={[{ label: '이름순', value: 'name' }, { label: '높이순', value: 'altitude' }, { label: '최근 오른 순', value: 'recent' }, { label: '가까운 순', value: 'nearby' }]} selected={sort} onSelect={(value) => void setSortWithPermission(value)} /></View>
      <Text style={styles.result}>검색 결과 {data.length}개</Text>
      <FlatList data={data} keyExtractor={(item) => item.id} renderItem={({ item }) => <MountainCard mountain={item} onPress={() => router.push(`/mountain/${item.id}`)} />} ItemSeparatorComponent={() => <View style={styles.separator} />} contentContainerStyle={data.length === 0 ? styles.emptyList : styles.list} ListEmptyComponent={<EmptyState title="조건에 맞는 산이 없어요" description="검색어나 필터를 바꿔보세요." icon="search-outline" />} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.muted, fontSize: 11, fontWeight: '800', marginBottom: 2 },
  result: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  list: { paddingBottom: spacing.xl },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
  separator: { height: spacing.sm },
});
