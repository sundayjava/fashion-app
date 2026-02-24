import React from 'react';
import { View, ViewProps, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { BorderRadius, Shadow, Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';

interface GlassCardProps extends ViewProps {
  blur?: boolean;
  intensity?: number;
  padding?: number;
  style?: ViewStyle;
  children: React.ReactNode;
}

export function GlassCard({
  blur = true,
  intensity = 25,
  padding = Spacing.md,
  style,
  children,
  ...rest
}: GlassCardProps) {
  const { isDark, colors } = useAppTheme();

  const containerStyle: ViewStyle[] = [
    styles.card,
    Shadow.glass,
    { borderColor: colors.glassBorder, borderWidth: 1 },
    style as ViewStyle,
  ];

  if (blur) {
    return (
      <View {...rest} style={[containerStyle, styles.blurWrapper]}>
        <BlurView
          intensity={intensity}
          tint={isDark ? 'dark' : 'light'}
          style={[StyleSheet.absoluteFillObject, { borderRadius: BorderRadius.lg }]}
        />
        <View style={[styles.content, { padding }]}>{children}</View>
      </View>
    );
  }

  return (
    <View
      {...rest}
      style={[
        containerStyle,
        { backgroundColor: colors.glass, padding },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  blurWrapper: {
    backgroundColor: 'transparent',
  },
  content: {
    zIndex: 1,
  },
});
