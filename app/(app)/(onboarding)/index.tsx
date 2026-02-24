import { GlassButton } from '@/components/ui/GlassButton';
import { Typography } from '@/components/ui/Typography';
import { Palette } from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ONBOARDING_KEY } from '../../index';

const { width } = Dimensions.get('window');

// ─── Slide data ───────────────────────────────────────────────────────────────

const SLIDES = [
  {
    key: '1',
    emoji: '✨',
    title: 'Discover Your Style',
    subtitle:
      'Explore thousands of curated outfits, trends, and looks tailored just for you.',
    accentColor: Palette.primary,
  },
  {
    key: '2',
    emoji: '🛍️',
    title: 'Shop the Look',
    subtitle:
      'Find exactly what you love and shop from top brands — all in one beautiful place.',
    accentColor: Palette.accent,
  },
  {
    key: '3',
    emoji: '🌟',
    title: 'Be a Fashionistar',
    subtitle:
      'Build your wardrobe, share your style, and inspire the world. Your spotlight awaits.',
    accentColor: Palette.primary,
  },
] as const;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);

  const finishOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/(auth)/login');
  };

  const goNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
    } else {
      finishOnboarding();
    }
  };

  const isLast = activeIndex === SLIDES.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Skip button */}
      {!isLast && (
        <Pressable
          style={[styles.skip, { top: insets.top + 16 }]}
          onPress={finishOnboarding}
          hitSlop={16}
        >
          <Typography variant="label" color={colors.textSecondary}>
            Skip
          </Typography>
        </Pressable>
      )}

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(index);
        }}
        renderItem={({ item }) => (
          <SlideItem item={item} isDark={isDark} colors={colors} />
        )}
        style={styles.list}
      />

      {/* Bottom controls */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <DotIndicator total={SLIDES.length} scrollX={scrollX} />

        <GlassButton
          variant={isLast ? 'primary' : 'outline'}
          size="lg"
          label={isLast ? "Let's Get Started" : 'Continue'}
          onPress={goNext}
          fullWidth
        />
      </View>
    </View>
  );
}

// ─── Slide item ───────────────────────────────────────────────────────────────

function SlideItem({
  item,
  isDark,
  colors,
}: {
  item: (typeof SLIDES)[number];
  isDark: boolean;
  colors: ReturnType<typeof useAppTheme>['colors'];
}) {
  return (
    <View style={styles.slide}>
      {/* Illustration area */}
      <View
        style={[
          styles.illustrationWrap,
          { backgroundColor: item.accentColor + (isDark ? '22' : '15') },
        ]}
      >
        <View
          style={[
            styles.emojiCircle,
            {
              backgroundColor: item.accentColor + '33',
              borderColor: item.accentColor + '55',
            },
          ]}
        >
          <Typography size={72} style={styles.emoji}>
            {item.emoji}
          </Typography>
        </View>
      </View>

      {/* Text */}
      <View style={styles.textBlock}>
        <Typography
          variant="h2"
          weight="bold"
          color={colors.text}
          align="center"
          lineHeight={38}
          style={styles.title}
        >
          {item.title}
        </Typography>
        <Typography
          variant="body"
          color={colors.textSecondary}
          align="center"
          lineHeight={24}
          style={styles.subtitle}
        >
          {item.subtitle}
        </Typography>
      </View>
    </View>
  );
}

// ─── Dot indicator ────────────────────────────────────────────────────────────

function DotIndicator({ total, scrollX }: { total: number; scrollX: Animated.Value }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: total }).map((_, i) => {
        const dotWidth = scrollX.interpolate({
          inputRange: [(i - 1) * width, i * width, (i + 1) * width],
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });
        const dotOpacity = scrollX.interpolate({
          inputRange: [(i - 1) * width, i * width, (i + 1) * width],
          outputRange: [0.35, 1, 0.35],
          extrapolate: 'clamp',
        });
        return (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              { width: dotWidth, opacity: dotOpacity, backgroundColor: Palette.primary },
            ]}
          />
        );
      })}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skip: {
    position: 'absolute',
    right: Spacing.lg,
    zIndex: 10,
    padding: Spacing.xs,
  },
  list: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  illustrationWrap: {
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: BorderRadius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  emojiCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    lineHeight: 86,
  },
  textBlock: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    maxWidth: 300,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
