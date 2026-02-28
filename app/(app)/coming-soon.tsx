import { BackButton, Typography } from '@/components/ui'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { ScreenWrapper } from '@/components/ui/ScreenWrapper'
import { Spacing } from '@/constants/theme'
import { useAppTheme } from '@/context/ThemeContext'
import { useRouter } from 'expo-router'
import React from 'react'
import { Platform, StyleSheet, View } from 'react-native'

const ComingSoon = () => {
  const router = useRouter();
  const { colors } = useAppTheme();
  return (
    <ScreenWrapper
      padded
      keyboardAvoiding
      keyboardVerticalOffset={Platform.OS === 'android' ? 20 : 0}
      style={{ paddingVertical: Spacing.md }}
    >
      <View style={{ flex: 1 }}>
        <View style={{ marginBottom: Spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <BackButton onPress={() => router.back()} />
        </View>

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm }}>
          <View style={[styles.warningIconBg, { backgroundColor: colors.text + '18' }]}>
            <IconSymbol size={40} name={'info' as any} color={colors.text} />
          </View>
          <Typography variant='h3'>Coming soon.</Typography>
          <Typography variant='body'>We’re building something great here.</Typography>
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default ComingSoon

const styles = StyleSheet.create({
  warningIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  }
})