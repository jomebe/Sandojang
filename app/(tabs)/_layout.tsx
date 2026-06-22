import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme';

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: 'home',
  mountains: 'list',
  stamps: 'ribbon',
  stats: 'bar-chart',
  settings: 'settings',
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8);
  return (
    <Tabs screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.forest,
      tabBarInactiveTintColor: colors.muted,
      tabBarStyle: {
        backgroundColor: colors.paper,
        borderTopColor: colors.line,
        height: 58 + bottomPadding,
        paddingTop: 7,
        paddingBottom: bottomPadding,
      },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '800' },
      tabBarHideOnKeyboard: true,
      tabBarIcon: ({ color, size }) => <Ionicons name={icons[route.name] ?? 'ellipse'} color={color} size={size} />,
    })}>
      <Tabs.Screen name="index" options={{ title: '홈' }} />
      <Tabs.Screen name="mountains" options={{ title: '산 목록' }} />
      <Tabs.Screen name="stamps" options={{ title: '도장판' }} />
      <Tabs.Screen name="stats" options={{ title: '통계' }} />
      <Tabs.Screen name="settings" options={{ title: '설정' }} />
    </Tabs>
  );
}
