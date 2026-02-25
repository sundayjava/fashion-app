import { GlassButton, ORBT, Typography } from '@/components/ui';
import { BorderRadius, FontFamily, Palette, Spacing } from '@/constants/theme';
import React from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface OnboardingTwoProps {
  isDark: boolean;
  insets: ReturnType<typeof useSafeAreaInsets>;
  onFinish: (method: 'email' | 'phone') => void;
  skip: () => void;
  login: () => void;
}

export const OnboardingTwo = ({ isDark, insets, onFinish, skip, login }: OnboardingTwoProps) => {
  return (
    <View style={styles.step2Container}>
      <ORBT />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View />
        <Pressable onPress={() => skip()} hitSlop={16}>
          <Typography color={Palette.primary} weight='bold'>Skip</Typography>
        </Pressable>
      </View>
      {/* Image card area */}
      <View style={styles.step2CardWrap}>
        <View
          style={[
            styles.step2Card,
          ]}
        >
          <Image
            source={isDark ? require('@/assets/locals/onboading_images/fift.webp') : require('@/assets/locals/onboading_images/third.webp')}
            style={styles.step2CardImage}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Title + actions */}
      <View style={[styles.step2Bottom, { paddingBottom: insets.bottom + 16 }]}>
        <Text style={[styles.step2Title, { color: isDark ? '#fff' : '#111' }]}>
          {'Join AI Fashion\nAssistant'}
        </Text>

        <View style={styles.socialRow}>
          <GlassButton onPress={() => onFinish('email')} variant="glass" label={`Continue with Email`} fullWidth size='md' style={{ borderRadius: Spacing[2] }} />
          <GlassButton onPress={() => onFinish('phone')} variant="glass" label={`Continue with Phone`} fullWidth size='md' style={{ borderRadius: Spacing[2] }} />
        </View>

        {/* Login link */}
        <View style={styles.loginRow}>
          <Text
            style={[
              styles.loginText,
              { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' },
            ]}
          >
            {'Already have an account? '}
          </Text>
          <Pressable onPress={() => login()} hitSlop={8}>
            <Text style={[styles.loginLink, { color: isDark ? '#fff' : '#111' }]}>
              Login
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm },
  loginText: { fontSize: 14, fontFamily: FontFamily.regular },
  loginLink: { fontSize: 14, fontFamily: FontFamily.bold },

  step2CardImage: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius['2xl'],
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    zIndex: 10,
  },

  step2Bottom: { flex: 1, paddingHorizontal: Spacing.lg, justifyContent: 'flex-end' },
  step2Title: {
    fontSize: 30,
    fontFamily: FontFamily.bold,
    lineHeight: 38,
    marginBottom: Spacing.xl,
  },

  step2Container: { flex: 1 },
  step2CardWrap: {
    height: height * 0.43,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.lg,
  },
  step2Card: {
    width: width * 0.65,
    height: height * 0.38,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    transform: [{ rotate: '-8deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 14,
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
  },
  socialRow: { flexDirection: 'column', gap: Spacing.md, marginBottom: Spacing.md },
})