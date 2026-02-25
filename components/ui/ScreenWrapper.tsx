/**
 * ScreenWrapper
 *
 * A drop-in safe-area container for every screen.  It automatically applies
 * the current theme's background colour and guards all four device edges
 * (notch, home indicator, punch-hole camera, etc.).
 *
 * Usage:
 *   // Basic — protects all edges, fills with theme bg
 *   <ScreenWrapper>
 *     <YourContent />
 *   </ScreenWrapper>
 *
 *   // Scrollable screen
 *   <ScreenWrapper scrollable>
 *     <YourContent />
 *   </ScreenWrapper>
 *
 *   // Only guard top + bottom (e.g. screen with a custom tab bar)
 *   <ScreenWrapper edges={['top', 'bottom']}>
 *     <YourContent />
 *   </ScreenWrapper>
 *
 *   // Transparent bg (e.g. modal)
 *   <ScreenWrapper backgroundColor="transparent">
 *     <YourContent />
 *   </ScreenWrapper>
 */

import { Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { ORBT } from './ORBT';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScreenWrapperProps {
  children: React.ReactNode;

  /** Edges that should be inset-protected; defaults to all four. */
  edges?: Edge[];

  /** Override the background colour; defaults to theme `colors.background`. */
  backgroundColor?: string;

  /** Wrap children in a ScrollView. */
  scrollable?: boolean;

  /** Extra ScrollView props (only used when `scrollable` is true). */
  scrollViewProps?: Omit<ScrollViewProps, 'children'>;

  /** Wrap in a KeyboardAvoidingView (useful for forms). */
  keyboardAvoiding?: boolean;

  /** Keyboard vertical offset for KeyboardAvoidingView. */
  keyboardVerticalOffset?: number;

  /** Additional style applied to the outer SafeAreaView. */
  style?: StyleProp<ViewStyle>;

  /** Padding applied inside the safe area. Default: Spacing.lg (horizontal). */
  padded?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ScreenWrapper({
  children,
  edges = ['top', 'bottom', 'left', 'right'],
  backgroundColor,
  scrollable = false,
  scrollViewProps,
  keyboardAvoiding = false,
  keyboardVerticalOffset = 0,
  style,
  padded = false,
}: ScreenWrapperProps) {
  const { colors } = useAppTheme();
  const bg = backgroundColor ?? colors.background;

  const inner = scrollable ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[padded && styles.paddedContent]}
      {...scrollViewProps}
    >
      {children}
    </ScrollView>
  ) : (
    children
  );

  const wrapped = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {inner}
    </KeyboardAvoidingView>
  ) : (
    inner
  );

  return (
    <SafeAreaView
      edges={edges}
      style={[styles.flex, { backgroundColor: bg }, padded && styles.padded, style]}
    >
      <ORBT />
      {wrapped}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: Spacing.lg,
  },
  paddedContent: {
    paddingHorizontal: Spacing.lg,
  },
});
