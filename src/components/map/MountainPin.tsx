import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { colors, shadow } from '@/theme';

export function MountainPin() {
  return <View style={styles.pin}><Ionicons name="triangle" size={18} color={colors.white} /></View>;
}

const styles = StyleSheet.create({
  pin: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.forest, borderWidth: 3, borderColor: colors.white, alignItems: 'center', justifyContent: 'center', ...shadow },
});
