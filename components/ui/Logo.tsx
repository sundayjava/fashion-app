import { BorderRadius, Palette, Spacing } from '@/constants'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Typography } from './Typography'

export const Logo = () => {
    return (
        <View
            style={[
                styles.logoMark,
                {
                    backgroundColor: Palette.primary + '22',
                    borderColor: Palette.primary + '55',
                },
            ]}
        >
            <Typography
                variant="h3"
                weight="bold"
                color={Palette.primary}
                align="center"
            >
                F
            </Typography>
        </View>
    )
}

const styles = StyleSheet.create({
    logoMark: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },
})