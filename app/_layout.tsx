import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider, useApp } from '@/context/AppContext';
import { colors, spacing } from '@/theme';

function RootNavigator() {
  const { initialized, error } = useApp();
  if (!initialized) {
    return <View style={styles.loading}><View style={styles.logo}><Text style={styles.logoText}>山</Text></View><Text style={styles.name}>산도장</Text><Text style={styles.slogan}>오른 산을 지도에 찍다</Text><ActivityIndicator color={colors.forest} style={styles.spinner} /></View>;
  }
  if (error) return <View style={styles.loading}><Text style={styles.errorTitle}>앱을 열지 못했어요</Text><Text style={styles.error}>{error}</Text></View>;
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerStyle: { backgroundColor: colors.paper }, headerTintColor: colors.ink, headerTitleStyle: { fontWeight: '900' }, headerShadowVisible: false, contentStyle: { backgroundColor: colors.paper } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="discover" options={{ title: '산 찾기' }} />
        <Stack.Screen name="map/[id]" options={{ title: '산 위치' }} />
        <Stack.Screen name="mountain/[id]" options={{ title: '산 상세' }} />
        <Stack.Screen name="record/new" options={{ title: '등산 기록 추가', presentation: 'modal' }} />
        <Stack.Screen name="record/[id]" options={{ title: '등산 기록 수정', presentation: 'modal' }} />
        <Stack.Screen name="session/index" options={{ title: '진행 중인 등산', presentation: 'modal' }} />
        <Stack.Screen name="session/start/[mountainId]" options={{ title: '등산 시작', presentation: 'modal' }} />
        <Stack.Screen name="session/complete" options={{ title: '등산 마치기', presentation: 'modal', gestureEnabled: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return <SafeAreaProvider><AppProvider><RootNavigator /></AppProvider></SafeAreaProvider>;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper, padding: spacing.xl },
  logo: { width: 78, height: 78, borderRadius: 39, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.forest },
  logoText: { color: colors.yellow, fontSize: 37, fontWeight: '900' },
  name: { color: colors.ink, fontSize: 28, fontWeight: '900', marginTop: spacing.lg },
  slogan: { color: colors.muted, marginTop: spacing.xs },
  spinner: { marginTop: spacing.xl },
  errorTitle: { color: colors.ink, fontSize: 20, fontWeight: '900' },
  error: { color: colors.danger, textAlign: 'center', marginTop: spacing.sm },
});
