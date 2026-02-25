import { BackButton, ScreenWrapper, Typography } from '@/components/ui'
import { Spacing } from '@/constants'
import { useRouter } from 'expo-router'
import React from 'react'
import { Keyboard, Platform, TouchableWithoutFeedback, View } from 'react-native'

export const BusinessDetails = () => {
    const router = useRouter();
    return (
        <ScreenWrapper
            padded
            keyboardAvoiding
            keyboardVerticalOffset={Platform.OS === 'android' ? 20 : 0}
            style={{ paddingVertical: Spacing.md }}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ flex: 1 }}>
                    <View style={{ marginBottom: Spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <BackButton onPress={() => router.back()} />
                        <Typography variant='h2'>Business Details</Typography>
                        <View />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </ScreenWrapper>
    )
}