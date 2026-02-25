import { ArrowDown } from '@/assets/icons';
import { BorderRadius, Shadow, Spacing } from '@/constants/spacing';
import { FontFamily, FontSize } from '@/constants/typography';
import { useAppTheme } from '@/context/ThemeContext';
import { COUNTRIES, Country } from '@/data/countries';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { Typography } from './Typography';

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
    const { colors } = useAppTheme();
    const sheetRef = useRef<BottomSheetModal>(null);

    const initialCountry =
      (defaultCountryCode && COUNTRIES.find((c) => c.code === defaultCountryCode)) ||
      DEFAULT_COUNTRY;

    const [country, setCountry] = useState<Country>(value?.country ?? initialCountry);
    const [number, setNumber] = useState(value?.number ?? '');
    const [focused, setFocused] = useState(false);
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
        sheetRef.current?.close();
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

    const snapPoints = useMemo(() => ['70%', '90%'], []);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
          pressBehavior="close"
        />
      ),
      []
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
            onPress={() => sheetRef.current?.present()}
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
            <ArrowDown width={18} height={18} color={colors.textTertiary}/>
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

        {/* Country Picker Bottom Sheet Modal */}
        <BottomSheetModal
          ref={sheetRef}
          snapPoints={snapPoints}
          enablePanDownToClose
          backdropComponent={renderBackdrop}
          backgroundStyle={{
            backgroundColor: colors.surfaceElevated,
          }}
          handleIndicatorStyle={{ backgroundColor: colors.border }}
          onDismiss={() => setSearch('')}
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
          android_keyboardInputMode="adjustResize"
        >
          <View style={styles.sheetContent}>
            <Typography variant="h4" style={styles.sheetTitle}>
              Select Country
            </Typography>

            {/* Search - use BottomSheetTextInput for proper keyboard handling */}
            <BottomSheetTextInput
              placeholder="Search country or code…"
              placeholderTextColor={colors.textTertiary}
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
              style={[
                styles.searchInput,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
            />

            <BottomSheetFlatList<Country>
              data={filtered}
              keyExtractor={(item: Country) => item.code}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 8 }}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Typography variant="body" color={colors.textSecondary} align="center">
                    No countries found
                  </Typography>
                  <Typography variant="caption" color={colors.textTertiary} align="center" style={{ marginTop: 4 }}>
                    Try a different search term
                  </Typography>
                </View>
              }
              ItemSeparatorComponent={() => (
                <View style={[styles.sep, { backgroundColor: colors.border }]} />
              )}
              renderItem={({ item }: { item: Country }) => {
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
        </BottomSheetModal>
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
  // Bottom Sheet
  sheetContent: {
    flex: 1,
    paddingTop: Spacing.sm,
  },
  sheetTitle: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  searchInput: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: FontSize.base,
    fontFamily: FontFamily.regular,
    minHeight: 48,
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
  emptyState: {
    paddingVertical: Spacing.xl * 2,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
