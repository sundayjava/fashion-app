import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { BorderRadius, Shadow, Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import { Typography } from '@/components/ui/Typography';
import { Palette } from '@/constants/colors';

export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { isDark, colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom > 0 ? insets.bottom : 12 }]}>
      <View style={[styles.container, Shadow.glass, { borderColor: colors.glassBorder }]}>
        <BlurView
          intensity={35}
          tint={isDark ? 'dark' : 'light'}
          style={[StyleSheet.absoluteFillObject, { borderRadius: BorderRadius['2xl'] }]}
        />
        <View style={styles.tabsRow}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
              typeof options.tabBarLabel === 'string'
                ? options.tabBarLabel
                : options.title ?? route.name;
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({ type: 'tabLongPress', target: route.key });
            };

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tab}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
              >
                {/* Icon */}
                <View
                  style={[
                    styles.iconWrapper,
                    isFocused && {
                      backgroundColor: Palette.primary + '22',
                    },
                  ]}
                >
                  {options.tabBarIcon?.({
                    focused: isFocused,
                    color: isFocused ? colors.primary : colors.tabIconDefault,
                    size: 24,
                  })}
                </View>
                {/* Label */}
                <Typography
                  variant="overline"
                  color={isFocused ? colors.primary : colors.tabIconDefault}
                  style={[styles.label, isFocused && styles.labelFocused]}
                >
                  {label as string}
                </Typography>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
  },
  container: {
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 2,
  },
  iconWrapper: {
    width: 44,
    height: 32,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    letterSpacing: 0.3,
  },
  labelFocused: {},
});
