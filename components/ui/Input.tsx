import React, { forwardRef, useState } from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  StyleSheet,
  Pressable,
  ViewStyle,
} from 'react-native';
import { BorderRadius, Shadow, Spacing } from '@/constants/spacing';
import { FontFamily, FontSize } from '@/constants/typography';
import { useAppTheme } from '@/context/ThemeContext';
import { Typography } from './Typography';

interface AppInputProps extends TextInputProps {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export const AppInput = forwardRef<TextInput, AppInputProps>(
  (
    {
      label,
      hint,
      error,
      leftIcon,
      rightIcon,
      onRightIconPress,
      containerStyle,
      style,
      ...rest
    },
    ref
  ) => {
    const { colors } = useAppTheme();
    const [focused, setFocused] = useState(false);

    const borderColor = error
      ? colors.error
      : focused
      ? colors.borderFocused
      : colors.border;

    return (
      <View style={[styles.wrapper, containerStyle]}>
        {label && (
          <Typography variant="label" color={colors.textSecondary} style={styles.label}>
            {label}
          </Typography>
        )}

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.surface,
              borderColor,
              borderWidth: 1,
            },
            focused && Shadow.sm,
          ]}
        >
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <TextInput
            ref={ref}
            style={[
              styles.input,
              {
                color: colors.text,
                fontFamily: FontFamily.regular,
                fontSize: FontSize.base,
                flex: 1,
              },
              style,
            ]}
            placeholderTextColor={colors.textTertiary}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            {...rest}
          />
          {rightIcon && (
            <Pressable onPress={onRightIconPress} style={styles.rightIcon}>
              {rightIcon}
            </Pressable>
          )}
        </View>

        {(error || hint) && (
          <Typography
            variant="caption"
            color={error ? colors.error : colors.textTertiary}
            style={styles.hint}
          >
            {error ?? hint}
          </Typography>
        )}
      </View>
    );
  }
);

AppInput.displayName = 'AppInput';

const styles = StyleSheet.create({
  wrapper: {
    gap: 4,
  },
  label: {
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  input: {
    paddingVertical: Spacing.sm,
  },
  leftIcon: {
    marginRight: Spacing.sm,
  },
  rightIcon: {
    marginLeft: Spacing.sm,
    padding: 4,
  },
  hint: {
    marginTop: 4,
  },
});
