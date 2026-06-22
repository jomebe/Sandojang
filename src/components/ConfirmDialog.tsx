import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadow, spacing } from '@/theme';
import { AppButton } from '@/components/ui/AppButton';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ visible, title, message, confirmLabel = '확인', destructive, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <AppButton label="취소" onPress={onCancel} variant="secondary" style={styles.button} />
            <AppButton label={confirmLabel} onPress={onConfirm} variant={destructive ? 'danger' : 'primary'} style={styles.button} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(14, 22, 17, 0.45)', padding: spacing.xl, alignItems: 'center', justifyContent: 'center' },
  card: { width: '100%', maxWidth: 420, padding: spacing.xl, borderRadius: radius.lg, backgroundColor: colors.paper, ...shadow },
  title: { fontSize: 20, fontWeight: '900', color: colors.ink },
  message: { color: colors.muted, lineHeight: 22, marginTop: spacing.sm, marginBottom: spacing.xl },
  actions: { flexDirection: 'row', gap: spacing.sm },
  button: { flex: 1 },
});
