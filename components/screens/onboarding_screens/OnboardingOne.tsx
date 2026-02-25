import { GlassButton, Typography } from '@/components/ui';
import { FontFamily, Spacing } from '@/constants/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedCardStack } from './AnimatedCardStack';

interface OnboardingOneProps {
    insets: ReturnType<typeof useSafeAreaInsets>;
    onReady: () => void,
}

export const OnboardingOne = ({ insets, onReady }: OnboardingOneProps) => {
    return (
        <View style={styles.stepContainer}>
              <Typography variant="h2" style={{marginTop: Spacing.lg}} align='center'>{'Before we dive in, I\u2019d\nlove to know you better!'}</Typography>
        
              {/* Stacked rotated cards — animated */}
              <AnimatedCardStack />
        
              {/* CTA */}
              <View style={[styles.ctaWrap, { paddingBottom: insets.bottom + 24 }]}>
                <GlassButton onPress={onReady} variant="glass" label={`I'm ready`} fullWidth size='md'/>
              </View>
            </View>
    )
}

const styles = StyleSheet.create({
      stepContainer: { flex: 1, alignItems: 'center' },
      step1Title: {
        fontSize: 26,
        fontFamily: FontFamily.bold,
        textAlign: 'center',
        lineHeight: 34,
        marginTop: Spacing.lg,
        marginHorizontal: Spacing.xl,
      },

        ctaWrap: { width: '100%', paddingHorizontal: Spacing.lg },
})