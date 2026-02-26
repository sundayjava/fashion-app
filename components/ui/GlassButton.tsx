import { Palette } from '@/constants/colors';
import { BorderRadius, Shadow, Spacing } from '@/constants/spacing';
import { TextVariants } from '@/constants/typography';
import { useAppTheme } from '@/context/ThemeContext';
import { BlurView } from 'expo-blur';
import React from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  PressableProps,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { Typography } from './Typography';

type ButtonVariant = 'glass' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent';
type ButtonSize = 'sm' | 'md' | 'lg';

interface GlassButtonProps extends PressableProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const sizeStyles: Record<ButtonSize, ViewStyle> = {
  sm: { paddingVertical: 8, paddingHorizontal: Spacing.md, minHeight: 36 },
  md: { paddingVertical: 12, paddingHorizontal: Spacing.lg, minHeight: 48 },
  lg: { paddingVertical: 16, paddingHorizontal: 28, minHeight: 56 },
};

export function GlassButton({
  variant = 'glass',
  size = 'md',
  label,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  disabled,
  ...rest
}: GlassButtonProps) {
  const { isDark, colors } = useAppTheme();

  const tintConfig: Record<ButtonVariant, string> = {
    glass: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.12)',
    primary: Palette.primary,
    secondary: colors.surface,
    outline: 'transparent',
    ghost: 'transparent',
    accent: Palette.accent,
  };

  const isGlass = variant === 'glass';
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';
  const bgColor = tintConfig[variant];

  const labelColor: Record<ButtonVariant, string> = {
    glass: isDark ? 'rgba(255,255,255,0.92)' : '#1a1a2e',
    primary: Palette.white,
    secondary: colors.text,
    outline: colors.primary,
    ghost: colors.primary,
    accent: Palette.white,
  };

  const borderColor: Record<ButtonVariant, string> = {
    glass: colors.glassBorder,
    primary: 'transparent',
    secondary: colors.border,
    outline: colors.primary,
    ghost: 'transparent',
    accent: 'transparent',
  };

  const inner = (
    <View
      style={[
        styles.inner,
        sizeStyles[size],
        fullWidth && styles.fullWidth,
        { borderColor: borderColor[variant], borderWidth: isOutline ? 1 : 0 },
        (disabled || loading) && styles.disabled,
      ]}
    >
      {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
      {loading ? (
        <ActivityIndicator size="small" color={labelColor[variant]} />
      ) : (
        <Typography
          variant="button"
          color={labelColor[variant]}
          style={size === 'sm' ? TextVariants.buttonSm : undefined}
        >
          {label}
        </Typography>
      )}
      {rightIcon && !loading && <View style={styles.iconRight}>{rightIcon}</View>}
    </View>
  );

  const glassShadow: ViewStyle = isGlass
    ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.4 : 0.12,
        shadowRadius: 8,
        elevation: 4,
      }
    : Shadow.glass;

  const container: ViewStyle[] = [
    isGlass ? {} : styles.pillRadius,
    fullWidth ? styles.fullWidth : {},
    glassShadow,
    style as ViewStyle,
  ];

  // White edge highlight — key to the raised-glass look
  const glassBorderColor = isDark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.85)';

  if (isGlass) {
    // iOS: native UIVisualEffectView via BlurView
    if (Platform.OS === 'ios') {
      return (
        <Pressable
          {...rest}
          disabled={disabled || loading}
          style={({ pressed }) => [container, pressed && styles.pressed]}
        >
          <BlurView
            intensity={40}
            style={[
              styles.blurContainer,
              styles.pillRadius,
              {
                borderWidth: 1,
                borderColor: glassBorderColor,
              },
            ]}
          >
            {inner}
          </BlurView>
        </Pressable>
      );
    }

    // Android: no backdrop-blur API.
    // Pressable must NOT have overflow/borderRadius — it causes a rectangular clip artifact.
    // All visual styling lives on the inner View only.
    return (
      <Pressable
        {...rest}
        disabled={disabled || loading}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        <View
          style={[
            styles.glassAndroid,
            fullWidth && styles.fullWidth,
            {
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(248, 248, 248, 0.85)',
              borderColor: glassBorderColor,
            },
          ]}
        >
          {inner}
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      {...rest}
      disabled={disabled || loading}
      style={({ pressed }) => [
        container,
        { backgroundColor: bgColor, borderRadius: BorderRadius.lg, overflow: 'hidden' },
        isGhost && { shadowOpacity: 0 },
        pressed && styles.pressed,
      ]}
    >
      {inner}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pillRadius: {
    borderRadius: BorderRadius.full,
  },
  blurContainer: {
    overflow: 'hidden',
  },
  // Android glass inner view — all visual styling here, Pressable stays transparent
  glassAndroid: {
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    overflow: 'hidden',
    elevation: 3,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  iconLeft: {
    marginRight: Spacing.sm,
  },
  iconRight: {
    marginLeft: Spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.6,
    transform: [{ scale: 0.98 }],
  },
});
