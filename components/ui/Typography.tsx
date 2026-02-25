import { FontFamily, FontWeight, TextVariant, TextVariants } from '@/constants/typography';
import { useAppTheme } from '@/context/ThemeContext';
import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';

type FontWeightKey = keyof typeof FontWeight; // 'regular' | 'medium' | 'semiBold' | 'bold'

interface TypographyProps extends TextProps {
  /** Preset text variant from the design system */
  variant?: TextVariant;
  /** Override text color */
  color?: string;
  /** Text alignment shorthand */
  align?: 'left' | 'center' | 'right' | 'justify';
  /** Weight shorthand — overrides the variant's default weight */
  weight?: FontWeightKey;
  /** Font size override in dp */
  size?: number;
  /** Make text italic */
  italic?: boolean;
  /** Underline */
  underline?: boolean;
  /** Strike through */
  strikethrough?: boolean;
  /** Letter spacing override */
  tracking?: number;
  /** Line height override */
  lineHeight?: number;
  /** Full access to any extra TextStyle — merged last so it always wins */
  style?: TextStyle | TextStyle[];
  children?: React.ReactNode;
}

export function Typography({
  variant = 'body',
  color,
  align = 'left',
  weight,
  size,
  italic,
  underline,
  strikethrough,
  tracking,
  lineHeight,
  style,
  children,
  ...rest
}: TypographyProps) {
  const { colors } = useAppTheme();

  // Build incremental overrides on top of the variant
  const overrides: TextStyle = {};

  if (weight) {
    overrides.fontFamily = FontFamily[weight];
    overrides.fontWeight = FontWeight[weight];
  }
  if (size !== undefined) overrides.fontSize = size;
  if (italic) overrides.fontStyle = 'italic';
  if (tracking !== undefined) overrides.letterSpacing = tracking;
  if (lineHeight !== undefined) overrides.lineHeight = lineHeight;

  const decorations: TextStyle['textDecorationLine'][] = [];
  if (underline) decorations.push('underline');
  if (strikethrough) decorations.push('line-through');
  if (decorations.length) {
    overrides.textDecorationLine = decorations.join(' ') as TextStyle['textDecorationLine'];
  }

  return (
    <Text
      style={[
        TextVariants[variant],
        { color: color ?? colors.text, textAlign: align },
        overrides,
        // User style always wins — supports both object and array
        ...(Array.isArray(style) ? style : style ? [style] : []),
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}
