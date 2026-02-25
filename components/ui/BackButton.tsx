import { ArrowBack } from '@/assets/icons';
import { FontFamily } from '@/constants/typography';
import { useAppTheme } from '@/context/ThemeContext';
import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

interface BackButtonProps {
  onPress?: () => void;
  label?: string;
  style?: ViewStyle;
  hitSlop?: number;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  label,
  style,
  hitSlop = 16,
}) => {
  const { isDark } = useAppTheme();
  const colors = useAppTheme().colors;

  // No onPress → invisible placeholder that preserves header layout
  if (!onPress) {
    return <View style={[styles.btn, style]} />;
  }

  return (
    <Pressable
      onPress={onPress}
      hitSlop={hitSlop}
      style={({ pressed }) => [styles.btn, pressed && styles.pressed, style]}
    >
      <View
        style={[
          styles.circle,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)' },
        ]}
      >
        <ArrowBack width={24} height={24} color={colors.icon} />
      </View>
      {label ? (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    fontSize: 24,
    lineHeight: 28,
    fontFamily: FontFamily.medium,
    marginTop: -2,
  },
  label: {
    fontSize: 15,
    fontFamily: FontFamily.medium,
    marginLeft: 6,
  },
  pressed: {
    opacity: 0.6,
  },
});