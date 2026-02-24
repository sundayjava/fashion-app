import React, { forwardRef, useState, useMemo, useCallback } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  Pressable,
  Modal,
  FlatList,
  StyleSheet,
  ViewStyle,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { COUNTRIES, Country } from '@/data/countries';
import { BorderRadius, Shadow, Spacing } from '@/constants/spacing';
import { FontFamily, FontSize } from '@/constants/typography';
import { useAppTheme } from '@/context/ThemeContext';
import { Typography } from './Typography';
import { AppInput } from './Input';

export interface PhoneValue {
  country: Country;
  number: string;
  /** Full E.164-ish value e.g. "+2348012345678" */
  full: string;
}

interface PhoneInputProps extends Omit<TextInputProps, 'value' | 'onChangeText' | 'onChange'> {
  label?: string;
  hint?: string;
  error?: string;
  value?: PhoneValue;
  onChange?: (val: PhoneValue) => void;
  defaultCountryCode?: string; // ISO-2, e.g. 'NG'
  containerStyle?: ViewStyle;
}

const DEFAULT_COUNTRY = COUNTRIES.find((c) => c.code === 'NG') ?? COUNTRIES[0];

export const PhoneInput = forwardRef<TextInput, PhoneInputProps>(
  (
    {
      label,
      hint,
      error,
      value,
      onChange,
      defaultCountryCode,
      containerStyle,
      ...rest
    },
    ref
  ) => {
    const { colors, isDark } = useAppTheme();
    const insets = useSafeAreaInsets();

    const initialCountry =
      (defaultCountryCode && COUNTRIES.find((c) => c.code === defaultCountryCode)) ||
      DEFAULT_COUNTRY;

    const [country, setCountry] = useState<Country>(value?.country ?? initialCountry);
    const [number, setNumber] = useState(value?.number ?? '');
    const [focused, setFocused] = useState(false);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = useMemo(
      () =>
        search.trim() === ''
          ? COUNTRIES
          : COUNTRIES.filter(
              (c) =>
                c.name.toLowerCase().includes(search.toLowerCase()) ||
                c.dial.includes(search) ||
                c.code.toLowerCase().includes(search.toLowerCase())
            ),
      [search]
    );

    const handleSelect = useCallback(
      (c: Country) => {
        setCountry(c);
        setPickerOpen(false);
        setSearch('');
        const next: PhoneValue = { country: c, number, full: `${c.dial}${number}` };
        onChange?.(next);
      },
      [number, onChange]
    );

    const handleNumberChange = useCallback(
      (text: string) => {
        // Only digits
        const clean = text.replace(/[^\d]/g, '');
        setNumber(clean);
        onChange?.({ country, number: clean, full: `${country.dial}${clean}` });
      },
      [country, onChange]
    );

    const borderColor = error ? colors.error : focused ? colors.borderFocused : colors.border;

    return (
      <View style={[containerStyle]}>
        {label && (
          <Typography variant="label" color={colors.textSecondary} style={styles.label}>
            {label}
          </Typography>
        )}

        <View
          style={[
            styles.row,
            {
              borderColor,
              borderWidth: 1,
              backgroundColor: colors.surface,
              borderRadius: BorderRadius.md,
            },
            focused && Shadow.sm,
          ]}
        >
          {/* Country Trigger */}
          <Pressable
            onPress={() => setPickerOpen(true)}
            style={[
              styles.dialButton,
              { borderRightColor: colors.border, borderRightWidth: StyleSheet.hairlineWidth },
            ]}
            android_ripple={{ color: colors.border, borderless: false }}
          >
            <Typography variant="body" style={styles.flag}>
              {country.flag}
            </Typography>
            <Typography variant="bodyMedium" color={colors.text}>
              {country.dial}
            </Typography>
            <Typography variant="caption" color={colors.textTertiary} style={styles.chevron}>
              ▾
            </Typography>
          </Pressable>

          {/* Number input */}
          <TextInput
            ref={ref}
            keyboardType="phone-pad"
            placeholder="Phone number"
            placeholderTextColor={colors.textTertiary}
            value={number}
            onChangeText={handleNumberChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={[
              styles.input,
              {
                color: colors.text,
                fontFamily: FontFamily.regular,
                fontSize: FontSize.base,
              },
            ]}
            {...rest}
          />
        </View>

        {(error || hint) && (
          <Typography
            variant="caption"
            color={error ? colors.error : colors.textTertiary}
            style={{ marginTop: 4 }}
          >
            {error ?? hint}
          </Typography>
        )}

        {/* Country Picker Modal */}
        <Modal
          visible={pickerOpen}
          transparent
          animationType="slide"
          statusBarTranslucent
          onRequestClose={() => {
            setPickerOpen(false);
            setSearch('');
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalWrapper}
          >
            {/* Backdrop */}
            <Pressable
              style={styles.backdrop}
              onPress={() => {
                setPickerOpen(false);
                setSearch('');
              }}
            >
              <BlurView
                intensity={15}
                tint={isDark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFillObject}
              />
            </Pressable>

            {/* Sheet */}
            <View
              style={[
                styles.sheet,
                {
                  backgroundColor: colors.surfaceElevated,
                  paddingBottom: insets.bottom + Spacing.md,
                  borderColor: colors.glassBorder,
                },
              ]}
            >
              {/* Handle */}
              <View style={[styles.handle, { backgroundColor: colors.border }]} />

              <Typography variant="h4" style={styles.sheetTitle}>
                Select Country
              </Typography>

              {/* Search */}
              <AppInput
                placeholder="Search country or code…"
                value={search}
                onChangeText={setSearch}
                containerStyle={styles.search}
                autoCorrect={false}
              />

              <FlatList
                data={filtered}
                keyExtractor={(item) => item.code}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 8 }}
                ItemSeparatorComponent={() => (
                  <View style={[styles.sep, { backgroundColor: colors.border }]} />
                )}
                renderItem={({ item }) => {
                  const selected = item.code === country.code;
                  return (
                    <Pressable
                      onPress={() => handleSelect(item)}
                      style={({ pressed }) => [
                        styles.countryItem,
                        pressed && { backgroundColor: colors.surface },
                        selected && { backgroundColor: colors.primary + '18' },
                      ]}
                    >
                      <Typography variant="body" style={styles.itemFlag}>
                        {item.flag}
                      </Typography>
                      <Typography
                        variant="body"
                        weight={selected ? 'semiBold' : 'regular'}
                        style={{ flex: 1 }}
                      >
                        {item.name}
                      </Typography>
                      <Typography
                        variant="bodyMedium"
                        color={selected ? colors.primary : colors.textTertiary}
                      >
                        {item.dial}
                      </Typography>
                      {selected && (
                        <Typography
                          variant="body"
                          color={colors.primary}
                          style={styles.checkmark}
                        >
                          ✓
                        </Typography>
                      )}
                    </Pressable>
                  );
                }}
              />
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

const styles = StyleSheet.create({
  label: {
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    overflow: 'hidden',
  },
  dialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 4,
    minWidth: 84,
  },
  flag: {
    fontSize: 20,
    lineHeight: 24,
  },
  chevron: {
    fontSize: 10,
    marginTop: 1,
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 48,
  },
  // Modal
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    borderTopLeftRadius: BorderRadius['3xl'],
    borderTopRightRadius: BorderRadius['3xl'],
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '80%',
    paddingTop: Spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: BorderRadius.full,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  sheetTitle: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  search: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  itemFlag: {
    fontSize: 22,
    lineHeight: 26,
    width: 32,
  },
  checkmark: {
    marginLeft: Spacing.sm,
    fontFamily: FontFamily.bold,
  },
  sep: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.lg + 32 + Spacing.md,
  },
});
