import { BorderRadius, isIOS, Shadow, Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';

interface GlassCardProps extends ViewProps {
  blur?: boolean;
  intensity?: number;
  padding?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  style?: ViewStyle;
  children: React.ReactNode;
}

export function GlassCard({
  blur = true,
  intensity = 25,
  padding = Spacing.md,
  paddingHorizontal,
  paddingVertical,
  style,
  children,
  ...rest
}: GlassCardProps) {
  const { isDark, colors } = useAppTheme();

  const pH = paddingHorizontal ?? padding;
  const pV = paddingVertical ?? padding;

  const containerStyle: ViewStyle[] = [
    styles.card,
    isIOS ? Shadow.glass : {},
    { borderColor: isDark ? colors.border : colors.shadow, borderWidth: 1 },
    style as ViewStyle,
  ];

  if (blur) {
    return (
      <View {...rest} style={[containerStyle, {backgroundColor: isDark ? 'rgba(0,0,0,0.90)' : 'rgba(240,240,248,0.22)'}]}>
        <BlurView
          intensity={intensity}
          tint={isDark ? 'dark' : 'light'}
          style={[StyleSheet.absoluteFillObject, { borderRadius: BorderRadius.lg }]}
        />
        <View style={[styles.content, { paddingHorizontal: pH, paddingVertical: pV }]}>{children}</View>
      </View>
    );
  }

  return (
    <View
      {...rest}
      style={[
        containerStyle,
        { backgroundColor: colors.glass, paddingHorizontal: pH, paddingVertical: pV },
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
  content: {
    zIndex: 1,
  },
});
