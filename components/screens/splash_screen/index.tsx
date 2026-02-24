import { Typography } from '@/components/ui/Typography';
import { Palette } from '@/constants/colors';
import { useAppTheme } from '@/context/ThemeContext';
import { BlurView } from 'expo-blur';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    StyleSheet,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

/**
 * Full-screen in-app splash screen.
 * Shown by app/index.tsx while bootstrap checks run in the background.
 * Features a pulsing logo, animated tagline fade-in, and brand gradient bg.
 */
export function AppSplash() {
  const { isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  // Animations
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const glowRadius = useRef(new Animated.Value(80)).current;

  useEffect(() => {
    // 1. Logo entrance
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Tagline fades in after logo settles
    setTimeout(() => {
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, 500);

    // 3. Continuous glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowRadius, {
          toValue: 120,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(glowRadius, {
          toValue: 80,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    ).start();

    // 4. Shimmer sweep on glow orb
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 2400,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();
  }, [glowRadius, logoOpacity, logoScale, shimmer, taglineOpacity]);

  const bg = isDark ? Palette.black : '#f8f0ff';
  const orbColor = isDark
    ? 'rgba(144, 86, 185, 0.35)'
    : 'rgba(144, 86, 185, 0.2)';

  return (
    <View style={[styles.container, { backgroundColor: bg, paddingBottom: insets.bottom + 32 }]}>
      {/* Background glow orbs */}
      <Animated.View
        style={[
          styles.orb,
          styles.orbTop,
          {
            width: glowRadius.interpolate({ inputRange: [80, 120], outputRange: [220, 300] }),
            height: glowRadius.interpolate({ inputRange: [80, 120], outputRange: [220, 300] }),
            backgroundColor: orbColor,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          styles.orbBottom,
          {
            width: glowRadius.interpolate({ inputRange: [80, 120], outputRange: [180, 240] }),
            height: glowRadius.interpolate({ inputRange: [80, 120], outputRange: [180, 240] }),
            backgroundColor: isDark
              ? 'rgba(233, 153, 44, 0.2)'
              : 'rgba(233, 153, 44, 0.15)',
          },
        ]}
      />

      {/* Center content */}
      <View style={styles.center}>
        {/* Logo mark */}
        <Animated.View
          style={[
            styles.logoWrap,
            { opacity: logoOpacity, transform: [{ scale: logoScale }] },
          ]}
        >
          <BlurView
            intensity={isDark ? 30 : 20}
            tint={isDark ? 'dark' : 'light'}
            style={styles.logoBlur}
          >
            <View style={[styles.logoInner, { borderColor: Palette.primary + '55' }]}>
              {/* F monogram */}
              <Typography
                variant="display"
                color={Palette.primary}
                weight="bold"
                size={52}
                style={styles.monogram}
              >
                F
              </Typography>
            </View>
          </BlurView>
        </Animated.View>

        {/* App name */}
        <Animated.View style={{ opacity: logoOpacity, marginTop: 20 }}>
          <Typography
            variant="h2"
            weight="bold"
            color={isDark ? Palette.white : Palette.black}
            align="center"
            tracking={3}
            style={styles.appName}
          >
            FASHIONISTAR
          </Typography>
        </Animated.View>

        {/* Tagline */}
        <Animated.View style={{ opacity: taglineOpacity, marginTop: 8 }}>
          <Typography
            variant="body"
            color={Palette.primary}
            align="center"
            weight="medium"
            tracking={1}
          >
            Style your world
          </Typography>
        </Animated.View>
      </View>

      {/* Bottom loader dots */}
      <Animated.View style={[styles.dots, { opacity: taglineOpacity }]}>
        <LoadingDots isDark={isDark} />
      </Animated.View>
    </View>
  );
}

// ─── Animated dots loader ─────────────────────────────────────────────────────

function LoadingDots({ isDark }: { isDark: boolean }) {
  const dots = [
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
  ];

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      )
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.dotsRow}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {
              opacity: dot,
              backgroundColor: isDark ? Palette.primary : Palette.primaryDark,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orb: {
    position: 'absolute',
    borderRadius: 9999,
  },
  orbTop: {
    top: -height * 0.1,
    right: -width * 0.2,
  },
  orbBottom: {
    bottom: -height * 0.05,
    left: -width * 0.15,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
  },
  logoBlur: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  logoInner: {
    width: 100,
    height: 100,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(144, 86, 185, 0.12)',
  },
  monogram: {
    lineHeight: 60,
  },
  appName: {
    letterSpacing: 4,
  },
  dots: {
    position: 'absolute',
    bottom: 60,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
