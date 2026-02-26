import { Calendar } from '@/assets/icons/Calendar';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { GlassButton } from './GlassButton';
import { Typography } from './Typography';

interface DOBInputProps {
  label?: string;
  hint?: string;
  error?: string;
  value?: Date;
  onChange?: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  containerStyle?: ViewStyle;
  placeholder?: string;
}

const MAX_DATE = new Date(); // today — can't be born in the future
const MIN_DATE = new Date(1900, 0, 1);

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function DOBInput({
  label,
  hint,
  error,
  value,
  onChange,
  minimumDate = MIN_DATE,
  maximumDate = MAX_DATE,
  containerStyle,
  placeholder = 'Select date of birth',
}: DOBInputProps) {
  const { colors, isDark } = useAppTheme();

  // Internal date used while picker is open (not yet confirmed on Android)
  const [temp, setTemp] = useState<Date>(value ?? new Date(2000, 0, 1));

  // Android: we show/hide the native picker inline
  const [androidOpen, setAndroidOpen] = useState(false);
  // iOS: we use a modal with confirm button
  const [iosOpen, setIOSOpen] = useState(false);

  const borderColor = error ? colors.error : colors.border;

  // Handler for both platforms
  const handleChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setAndroidOpen(false);
      if (selected) {
        setTemp(selected);
        onChange?.(selected);
      }
    } else {
      // iOS: update temp but don't commit until "Done"
      if (selected) setTemp(selected);
    }
  };

  const handleIOSConfirm = () => {
    setIOSOpen(false);
    onChange?.(temp);
  };

  const handleIOSCancel = () => {
    // Reset temp to current value
    setTemp(value ?? new Date(2000, 0, 1));
    setIOSOpen(false);
  };

  const openPicker = () => {
    if (Platform.OS === 'android') {
      setAndroidOpen(true);
    } else {
      setIOSOpen(true);
    }
  };

  return (
    <View style={containerStyle}>
      {label && (
        <Typography variant="label" color={colors.textSecondary} style={styles.label}>
          {label}
        </Typography>
      )}

      <Pressable
        onPress={openPicker}
        style={({ pressed }) => [
          styles.trigger,
          {
            backgroundColor: colors.surface,
            borderColor,
            borderWidth: 1,
            borderRadius: BorderRadius.md,
          },
          pressed && { opacity: 0.8 },
        ]}
      >
        <Typography
          variant="body"
          color={value ? colors.text : colors.textTertiary}
        >
          {value ? formatDate(value) : placeholder}
        </Typography>
        <Calendar color='transparent' stroke={colors.text}/>
      </Pressable>

      {(error || hint) && (
        <Typography
          variant="caption"
          color={error ? colors.error : colors.textTertiary}
          style={{ marginTop: 4 }}
        >
          {error ?? hint}
        </Typography>
      )}

      {/* Android — renders native picker inline when open */}
      {Platform.OS === 'android' && androidOpen && (
        <DateTimePicker
          mode="date"
          display="default"
          value={temp}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={handleChange}
        />
      )}

      {/* iOS — modal with spinner + confirm */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={iosOpen}
          transparent
          animationType="slide"
          statusBarTranslucent
          onRequestClose={handleIOSCancel}
        >
          <Pressable style={styles.iosBackdrop} onPress={handleIOSCancel} />
          <View
            style={[
              styles.iosSheet,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.glassBorder,
              },
            ]}
          >
            <View style={[styles.iosHandle, { backgroundColor: colors.border }]} />
            <Typography variant="h4" style={styles.iosTitle}>
              Date of Birth
            </Typography>

            <DateTimePicker
              mode="date"
              display="spinner"
              value={temp}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              onChange={handleChange}
              themeVariant={isDark ? 'dark' : 'light'}
              style={styles.iosPicker}
            />

            <View style={styles.iosButtons}>
              <GlassButton
                variant="outline"
                label="Cancel"
                size="md"
                onPress={handleIOSCancel}
                style={{ flex: 1 }}
              />
              <GlassButton
                variant="primary"
                label="Confirm"
                size="md"
                onPress={handleIOSConfirm}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 4,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
    minHeight: 48,
  },
  calIcon: {
    fontSize: 16,
  },
  // iOS Modal
  iosBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  iosSheet: {
    borderTopLeftRadius: BorderRadius['3xl'],
    borderTopRightRadius: BorderRadius['3xl'],
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
  },
  iosHandle: {
    width: 40,
    height: 4,
    borderRadius: BorderRadius.full,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  iosTitle: {
    marginBottom: Spacing.md,
  },
  iosPicker: {
    width: '100%',
    height: 200,
  },
  iosButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
});
