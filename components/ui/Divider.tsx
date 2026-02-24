import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '@/context/ThemeContext';
import { Spacing } from '@/constants/spacing';
import { Typography } from './Typography';

interface DividerProps {
  label?: string;
  orientation?: 'horizontal' | 'vertical';
  style?: ViewStyle;
}

export function Divider({ label, orientation = 'horizontal', style }: DividerProps) {
  const { colors } = useAppTheme();

  if (orientation === 'vertical') {
    return (
      <View
        style={[
          styles.vertical,
          { backgroundColor: colors.border },
          style,
        ]}
      />
    );
  }

  if (label) {
    return (
      <View style={[styles.labelRow, style]}>
        <View style={[styles.line, { backgroundColor: colors.border }]} />
        <Typography variant="caption" color={colors.textTertiary} style={styles.labelText}>
          {label}
        </Typography>
        <View style={[styles.line, { backgroundColor: colors.border }]} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.horizontal,
        { backgroundColor: colors.border },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
    marginVertical: Spacing.sm,
  },
  vertical: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginHorizontal: Spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  labelText: {
    paddingHorizontal: Spacing.xs,
  },
});
