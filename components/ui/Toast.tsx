import React from 'react';
import Toast, {
  BaseToast,
  ErrorToast,
  ToastConfig,
  ToastShowParams,
} from 'react-native-toast-message';
import { BorderRadius, Shadow, Spacing } from '@/constants/spacing';
import { Palette, ThemeColors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';

/** Re-export the hook-like helper for convenience */
export function showToast(params: ToastShowParams) {
  Toast.show(params);
}

export function hideToast() {
  Toast.hide();
}

/** Custom toast config — call buildToastConfig(isDark) in your root layout */
export function buildToastConfig(isDark: boolean): ToastConfig {
  const colors = isDark ? ThemeColors.dark : ThemeColors.light;

  const base = {
    style: {
      ...Shadow.md,
      backgroundColor: colors.surfaceElevated,
      borderLeftWidth: 0,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      minHeight: 56,
      width: '92%',
    } as any,
    text1Style: {
      fontFamily: FontFamily.semiBold,
      fontSize: FontSize.base,
      color: colors.text,
    },
    text2Style: {
      fontFamily: FontFamily.regular,
      fontSize: FontSize.sm,
      color: colors.textSecondary,
    },
  };

  return {
    success: (props) => (
      <BaseToast
        {...props}
        {...base}
        style={[base.style, { borderLeftWidth: 4, borderLeftColor: Palette.success }]}
        text1Style={base.text1Style}
        text2Style={base.text2Style}
      />
    ),
    error: (props) => (
      <ErrorToast
        {...props}
        {...base}
        style={[base.style, { borderLeftWidth: 4, borderLeftColor: Palette.error }]}
        text1Style={base.text1Style}
        text2Style={base.text2Style}
      />
    ),
    info: (props) => (
      <BaseToast
        {...props}
        {...base}
        style={[base.style, { borderLeftWidth: 4, borderLeftColor: Palette.info }]}
        text1Style={base.text1Style}
        text2Style={base.text2Style}
      />
    ),
    warning: (props) => (
      <BaseToast
        {...props}
        {...base}
        style={[base.style, { borderLeftWidth: 4, borderLeftColor: Palette.warning }]}
        text1Style={base.text1Style}
        text2Style={base.text2Style}
      />
    ),
  };
}

/** Drop-in component: place once at the root, above everything else */
export { Toast as AppToastHost };
