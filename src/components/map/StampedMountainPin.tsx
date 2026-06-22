import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { colors, shadow } from '@/theme';

export function StampedMountainPin() {
  return <View style={styles.pin}><Ionicons name="checkmark" size={21} color={colors.white} /></View>;
}

const styles = StyleSheet.create({
  pin: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.danger, borderWidth: 3, borderColor: '#FFE7D5', alignItems: 'center', justifyContent: 'center', ...shadow },
});
