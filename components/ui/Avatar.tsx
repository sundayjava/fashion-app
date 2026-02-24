import React from 'react';
import { View, Image, ViewStyle, ImageSourcePropType } from 'react-native';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useAppTheme } from '@/context/ThemeContext';
import { Typography } from './Typography';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  source?: ImageSourcePropType;
  initials?: string;
  size?: AvatarSize;
  style?: ViewStyle;
}

const sizeMap: Record<AvatarSize, number> = {
  xs: 28,
  sm: 36,
  md: 48,
  lg: 64,
  xl: 80,
};

const fontSizeMap: Record<AvatarSize, number> = {
  xs: 11,
  sm: 14,
  md: 18,
  lg: 24,
  xl: 30,
};

export function Avatar({ source, initials, size = 'md', style }: AvatarProps) {
  const { colors } = useAppTheme();
  const dimension = sizeMap[size];

  const containerStyle: ViewStyle = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
    backgroundColor: colors.primary,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.glassBorder,
  };

  if (source) {
    return (
      <Image
        source={source}
        style={[containerStyle, style as any]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={[containerStyle, style]}>
      <Typography
        variant="body"
        color={Palette.white}
        style={{
          fontFamily: FontFamily.bold,
          fontSize: fontSizeMap[size],
          lineHeight: undefined,
        }}
      >
        {(initials ?? '?').toUpperCase().slice(0, 2)}
      </Typography>
    </View>
  );
}
