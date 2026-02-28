import { Palette } from '@/constants/colors';
import { Shadow } from '@/constants/spacing';
import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { IconSymbol } from './icon-symbol';

export interface FABProps {
    /** SF Symbol / mapped Material icon name */
    icon: string;
    onPress: () => void;
    /** Background color. Defaults to Palette.primary */
    color?: string;
    /** Diameter of the button. Defaults to 52 */
    size?: number;
    style?: ViewStyle;
    disabled?: boolean;
}

/**
 * Floating Action Button — circular, shadow-lifted icon button.
 */
export function FAB({
    icon,
    onPress,
    color = Palette.primary,
    size = 52,
    style,
    disabled = false,
}: FABProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.82}
            disabled={disabled}
            style={[
                styles.base,
                Shadow.md,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: disabled ? Palette.midGray : color,
                },
                style,
            ]}
        >
            <IconSymbol size={Math.round(size * 0.42)} name={icon as any} color="#fff" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
