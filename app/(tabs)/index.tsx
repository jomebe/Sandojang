import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilterChips } from '@/components/FilterChips';
import { SearchBar } from '@/components/SearchBar';
import { LiveHikingWidget } from '@/components/live/LiveHikingWidget';
import { KoreaMountainMap } from '@/components/map/KoreaMountainMap';
import { MountainBottomSheet } from '@/components/map/MountainBottomSheet';
import { useApp } from '@/context/AppContext';
import { locationService } from '@/services/locationService';
import { colors, shadow, spacing } from '@/theme';
import type { MountainWithProgress } from '@/types/models';

type MapFilter = 'all' | 'climbed' | 'unclimbed' | 'nearby' | 'region';

const filters = [
  { label: '전체', value: 'all' },
  { label: '오른 산', value: 'climbed' },
  { label: '안 오른 산', value: 'unclimbed' },
  { label: '가까운 산', value: 'nearby' },
  { label: '지역별', value: 'region' },
] satisfies { label: string; value: MapFilter }[];

export default function MapScreen() {
  const { mountains, activeSession } = useApp();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<MapFilter>('all');
  const [selected, setSelected] = useState<MountainWithProgress>();
  const [region, setRegion] = useState('전체');
  const [location, setLocation] = useState<{ latitude: number; longitude: number }>();
  const regions = useMemo(() => ['전체', ...new Set(mountains.map((mountain) => mountain.region))].slice(0, 12), [mountains]);
  const filtered = useMemo(() => {
    let result = mountains.filter((mountain) => mountain.nameKo.includes(query.trim()));
    if (filter === 'climbed') result = result.filter((mountain) => mountain.climbed);
    if (filter === 'unclimbed') result = result.filter((mountain) => !mountain.climbed);
    if (filter === 'region' && region !== '전체') result = result.filter((mountain) => mountain.region === region);
    if (filter === 'nearby' && location) {
      result = result
        .map((mountain) => ({ ...mountain, distanceKm: locationService.distanceTo(location.latitude, location.longitude, mountain.latitude, mountain.longitude) }))
        .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0))
        .slice(0, 30);
    }
    return result;
  }, [mountains, query, filter, region, location]);
  const selectFilter = async (value: MapFilter) => {
    setFilter(value);
    if (value === 'nearby' && !location) {
      const result = await locationService.getCurrentLocation();
      if (result.granted && result.latitude !== undefined && result.longitude !== undefined) {
        setLocation({ latitude: result.latitude, longitude: result.longitude });
      } else setFilter('all');
    }
  };
  return (
    <View style={styles.root}>
      <KoreaMountainMap mountains={filtered} onSelect={setSelected} />
      <SafeAreaView edges={['top']} style={styles.overlay} pointerEvents="box-none">
        <View style={styles.top} pointerEvents="auto">
          <View style={styles.brandRow}><View><Text style={styles.brand}>산도장</Text><Text style={styles.slogan}>오른 산을 지도에 찍다</Text></View><Text style={styles.count}>{mountains.filter((item) => item.climbed).length}개 완등</Text></View>
          <SearchBar value={query} onChangeText={setQuery} />
          <FilterChips options={filters} selected={filter} onSelect={(value) => void selectFilter(value)} />
          {filter === 'region' && <FilterChips options={regions.map((value) => ({ label: value, value }))} selected={region} onSelect={setRegion} />}
          {activeSession && <LiveHikingWidget session={activeSession} compact />}
        </View>
      </SafeAreaView>
      {selected && <MountainBottomSheet mountain={selected} onClose={() => setSelected(undefined)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  top: { padding: spacing.md, gap: spacing.sm },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(252,250,244,0.94)', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 16, ...shadow },
  brand: { color: colors.forest, fontSize: 20, fontWeight: '900' },
  slogan: { color: colors.muted, fontSize: 10 },
  count: { color: colors.danger, fontSize: 12, fontWeight: '900' },
});
