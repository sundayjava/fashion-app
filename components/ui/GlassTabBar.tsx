import { BorderRadius, Shadow, Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { isDark, colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom + 8 }]}>
      <BlurView
        intensity={Platform.OS === 'ios' ? 50 : 20}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.container,
          Platform.OS === 'ios' && Shadow.glass,
          Platform.OS === 'android' && styles.androidElevation,
          { borderColor: colors.glassBorder }
        ]}
      >
        <View style={[styles.overlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.90)' : 'rgba(240,240,248,0.92)' }]} />
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
                style={[
                  styles.tab,
                  isFocused && [
                    styles.tabFocused,
                    { backgroundColor: colors.primary + '20' }
                  ]
                ]}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
              >
                {options.tabBarIcon?.({
                  focused: isFocused,
                  color: isFocused ? colors.primary : colors.text,
                  size: 22,
                })}
                {Platform.OS === 'android' && (
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.label,
                      { color: isFocused ? colors.primary : colors.text },
                      isFocused && styles.labelFocused,
                    ]}
                  >
                    {label as string}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </BlurView>
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
    zIndex: 100,
  },
  container: {
    borderRadius: 30,
    borderWidth: 1,
    overflow: 'hidden',
  },
  androidElevation: {
    ...Platform.select({
      android: {
        elevation: 16,
        shadowColor: '#000',
      },
    }),
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 12,
    gap: 4,
    backgroundColor: 'transparent',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Platform.OS === 'android' ? 8 : 12,
    paddingHorizontal: 8,
    borderRadius: 20,
    minHeight: Platform.OS === 'android' ? 56 : 52,
    backgroundColor: 'transparent',
  },
  tabFocused: {
    transform: [{ scale: 1.05 }],
  },
  iconWrapper: {
    width: 44,
    height: 32,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.3,
    marginTop: 3,
    backgroundColor: 'transparent',
  },
  labelFocused: {
    fontWeight: '700',
  },
});
