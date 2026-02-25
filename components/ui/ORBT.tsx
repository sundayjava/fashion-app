import { Palette } from '@/constants';
import { useAppTheme } from '@/context/ThemeContext';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export const ORBT = () => {
    const { isDark } = useAppTheme();
    return (
        <View
            pointerEvents="none"
            style={[
                styles.orb,
                {
                    backgroundColor: Palette.primary + (isDark ? '12' : '18'),
                    top: -80,
                    right: -80,
                },
            ]}
        />
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    orb: {
        position: 'absolute',
        width: 280,
        height: 280,
        borderRadius: 140,
        zIndex: 0,
    },
})