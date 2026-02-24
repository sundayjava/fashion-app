import React from 'react';
import {
  Modal,
  ModalProps,
  View,
  Pressable,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { BorderRadius, Shadow, Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import { Typography } from './Typography';
import { GlassButton } from './GlassButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ModalSize = 'sm' | 'md' | 'lg' | 'full';

interface AppModalProps extends Omit<ModalProps, 'children'> {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ModalSize;
  showCloseButton?: boolean;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

const sizeWidths: Record<ModalSize, number | string> = {
  sm: SCREEN_WIDTH * 0.75,
  md: SCREEN_WIDTH * 0.88,
  lg: SCREEN_WIDTH * 0.95,
  full: SCREEN_WIDTH,
};

export function AppModal({
  visible,
  onClose,
  title,
  description,
  size = 'md',
  showCloseButton = true,
  footer,
  children,
  ...rest
}: AppModalProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
      {...rest}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={onClose}>
          <BlurView
            intensity={20}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.backdropOverlay} />
        </Pressable>

        {/* Card */}
        <View
          style={[
            styles.card,
            Shadow.lg,
            {
              width: sizeWidths[size] as number,
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.glassBorder,
            },
          ]}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                {title && (
                  <Typography variant="h4">{title}</Typography>
                )}
                {description && (
                  <Typography variant="body" color={colors.textSecondary} style={styles.desc}>
                    {description}
                  </Typography>
                )}
              </View>
              {showCloseButton && (
                <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
                  <Typography variant="body" color={colors.textTertiary}>✕</Typography>
                </Pressable>
              )}
            </View>
          )}

          {/* Body */}
          {children && (
            <View style={styles.body}>{children}</View>
          )}

          {/* Footer */}
          {footer && <View style={styles.footer}>{footer}</View>}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/** Confirmation dialog built on AppModal */
interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

export function ConfirmModal({
  visible,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
}: ConfirmModalProps) {
  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <View style={styles.confirmFooter}>
          <GlassButton
            variant="outline"
            label={cancelLabel}
            size="md"
            onPress={onClose}
            style={{ flex: 1 }}
          />
          <GlassButton
            variant={destructive ? 'accent' : 'primary'}
            label={confirmLabel}
            size="md"
            onPress={() => {
              onConfirm();
              onClose();
            }}
            style={{ flex: 1 }}
          />
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    paddingBottom: 0,
  },
  headerLeft: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  desc: {
    marginTop: 4,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    padding: Spacing.lg,
  },
  footer: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
  confirmFooter: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
