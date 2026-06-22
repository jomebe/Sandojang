import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Screen } from '@/components/ui/Screen';
import { useApp } from '@/context/AppContext';
import { backupService } from '@/services/backupService';
import { locationService } from '@/services/locationService';
import { notificationService } from '@/services/notificationService';
import { resetDatabase } from '@/storage/database';
import { colors, radius, spacing } from '@/theme';

type PermissionText = '허용됨' | '허용 안 됨' | '확인 전';

function SettingsRow({ icon, title, description, value, onPress, danger }: { icon: keyof typeof Ionicons.glyphMap; title: string; description?: string; value?: string; onPress?: () => void; danger?: boolean }) {
  return <Pressable disabled={!onPress} onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}><View style={[styles.icon, danger && styles.dangerIcon]}><Ionicons name={icon} size={21} color={danger ? colors.danger : colors.forest} /></View><View style={styles.rowBody}><Text style={[styles.rowTitle, danger && styles.danger]}>{title}</Text>{description && <Text style={styles.description}>{description}</Text>}</View>{value && <Text style={styles.value}>{value}</Text>}{onPress && <Ionicons name="chevron-forward" size={18} color={colors.locked} />}</Pressable>;
}

export default function SettingsScreen() {
  const { records, sessions, refresh } = useApp();
  const [locationPermission, setLocationPermission] = useState<PermissionText>('확인 전');
  const [notificationPermission, setNotificationPermission] = useState<PermissionText>('확인 전');
  const [working, setWorking] = useState<'export' | 'import'>();
  const [confirmReset, setConfirmReset] = useState(false);
  const refreshPermissions = async () => {
    const [location, notification] = await Promise.all([locationService.getPermissionStatus(), notificationService.getPermissionStatus()]);
    setLocationPermission(location === Location.PermissionStatus.GRANTED ? '허용됨' : '허용 안 됨');
    setNotificationPermission(notification === Notifications.PermissionStatus.GRANTED ? '허용됨' : '허용 안 됨');
  };
  useEffect(() => {
    let mounted = true;
    void Promise.all([locationService.getPermissionStatus(), notificationService.getPermissionStatus()]).then(([location, notification]) => {
      if (!mounted) return;
      setLocationPermission(location === Location.PermissionStatus.GRANTED ? '허용됨' : '허용 안 됨');
      setNotificationPermission(notification === Notifications.PermissionStatus.GRANTED ? '허용됨' : '허용 안 됨');
    });
    return () => { mounted = false; };
  }, []);
  const exportData = async () => {
    setWorking('export');
    try { await backupService.exportToFile(records, sessions); }
    catch (error) { Alert.alert('내보내기 실패', error instanceof Error ? error.message : '파일을 만들지 못했어요.'); }
    finally { setWorking(undefined); }
  };
  const importData = async () => {
    setWorking('import');
    try {
      const result = await backupService.pickAndImport();
      await refresh();
      Alert.alert('가져오기 완료', `${result.records}개 기록을 가져왔어요.${result.missingPhotos ? `\n찾을 수 없는 사진 ${result.missingPhotos}개는 메타데이터만 유지돼요.` : ''}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : '파일을 읽지 못했어요.';
      if (message !== '가져오기를 취소했어요.') Alert.alert('가져오기 실패', message);
    } finally { setWorking(undefined); }
  };
  const requestLocation = async () => {
    const result = await locationService.getCurrentLocation();
    await refreshPermissions();
    if (!result.granted) Alert.alert('위치 권한이 꺼져 있어요', '설정에서 위치 권한을 허용하면 가까운 산과 GPS 인증을 사용할 수 있어요.', [{ text: '닫기' }, { text: '설정 열기', onPress: () => void Linking.openSettings() }]);
  };
  const requestNotification = async () => {
    const granted = await notificationService.requestPermission();
    await refreshPermissions();
    if (!granted) Alert.alert('알림 권한이 꺼져 있어요', '등산 중 시간 알림을 받으려면 설정에서 알림을 허용해 주세요.', [{ text: '닫기' }, { text: '설정 열기', onPress: () => void Linking.openSettings() }]);
  };
  const clearAll = async () => {
    await Promise.all(sessions.map((session) => notificationService.cancelSessionNotifications(session.id)));
    await resetDatabase();
    await refresh();
    setConfirmReset(false);
    Alert.alert('초기화 완료', '모든 등산 기록을 삭제했어요.');
  };
  return (
    <Screen title="설정" subtitle="데이터와 권한을 기기에서 직접 관리해요">
      <View style={styles.privacy}><Ionicons name="shield-checkmark" size={26} color={colors.forest} /><View style={styles.privacyBody}><Text style={styles.privacyTitle}>내 기록은 내 기기에</Text><Text style={styles.privacyText}>산도장은 기본적으로 기기 안에 기록을 저장합니다. 로그인이나 서버 전송이 필요하지 않아요.</Text></View></View>
      <View><Text style={styles.sectionTitle}>데이터 관리</Text><View style={styles.group}><SettingsRow icon="download-outline" title={working === 'export' ? '내보내는 중…' : '데이터 백업 / 내보내기'} description="등산 기록과 세션을 JSON으로 저장" onPress={working ? undefined : () => void exportData()} /><SettingsRow icon="cloud-upload-outline" title={working === 'import' ? '가져오는 중…' : '데이터 가져오기'} description="산도장 JSON 백업으로 현재 기록 교체" onPress={working ? undefined : () => void importData()} /><SettingsRow icon="trash-outline" title="모든 기록 초기화" description="등산 기록과 세션을 모두 삭제" onPress={() => setConfirmReset(true)} danger /></View></View>
      <View><Text style={styles.sectionTitle}>권한</Text><View style={styles.group}><SettingsRow icon="location-outline" title="위치 권한" description="가까운 산, 정상 거리, GPS 인증" value={locationPermission} onPress={() => void requestLocation()} /><SettingsRow icon="notifications-outline" title="알림 권한" description="등산 중 도착 예정 시간 안내" value={notificationPermission} onPress={() => void requestNotification()} /></View></View>
      <View><Text style={styles.sectionTitle}>앱 정보</Text><View style={styles.group}><SettingsRow icon="information-circle-outline" title="산도장" description="오른 산을 지도에 찍다" value="1.0.0" /><SettingsRow icon="map-outline" title="지도 데이터" description="OpenStreetMap과 기여자 데이터 사용" /></View></View>
      <Text style={styles.footer}>로그인 없음 · 백엔드 없음 · 유료 지도 키 없음</Text>
      <ConfirmDialog visible={confirmReset} title="모든 기록을 지울까요?" message="등산 기록, 사진 메타데이터, 진행했던 세션이 모두 삭제돼요. 내보내지 않은 데이터는 복구할 수 없어요." confirmLabel="모두 삭제" destructive onConfirm={() => void clearAll()} onCancel={() => setConfirmReset(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  privacy: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.beige },
  privacyBody: { flex: 1 },
  privacyTitle: { color: colors.ink, fontWeight: '900', fontSize: 16 },
  privacyText: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: spacing.xs },
  sectionTitle: { color: colors.muted, fontSize: 12, fontWeight: '800', marginBottom: spacing.sm, marginLeft: spacing.xs },
  group: { borderRadius: radius.lg, backgroundColor: colors.white, overflow: 'hidden', borderWidth: 1, borderColor: colors.line },
  row: { minHeight: 72, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  pressed: { backgroundColor: colors.sand },
  icon: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.sand, alignItems: 'center', justifyContent: 'center' },
  dangerIcon: { backgroundColor: '#FBE9E7' },
  rowBody: { flex: 1 },
  rowTitle: { color: colors.ink, fontWeight: '800', fontSize: 15 },
  description: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  value: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  danger: { color: colors.danger },
  footer: { color: colors.locked, fontSize: 11, textAlign: 'center', marginVertical: spacing.lg },
});
