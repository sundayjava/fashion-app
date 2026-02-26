import { BorderRadius, Palette, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import React, { useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  onComplete?: (otp: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
}) => {
  const { colors } = useAppTheme();
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const digits = value.split('');
  const {isDark} = useAppTheme();

  const handleChange = (text: string, index: number) => {
    // Only allow digits
    const sanitizedText = text.replace(/[^0-9]/g, '');
    
    if (sanitizedText.length === 0) {
      // Handle backspace
      const newDigits = [...digits];
      newDigits[index] = '';
      const newValue = newDigits.join('');
      onChange(newValue);
      
      // Move to previous input
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      return;
    }

    // Handle single digit input
    if (sanitizedText.length === 1) {
      const newDigits = [...digits];
      newDigits[index] = sanitizedText;
      const newValue = newDigits.join('');
      onChange(newValue);

      // Move to next input
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      } else {
        // Last input - trigger completion
        inputRefs.current[index]?.blur();
        if (newValue.length === length) {
          onComplete?.(newValue);
        }
      }
      return;
    }

    // Handle paste of multiple digits
    if (sanitizedText.length > 1) {
      const pastedDigits = sanitizedText.slice(0, length).split('');
      const newValue = pastedDigits.join('');
      onChange(newValue);

      // Focus the last input or next empty input
      const nextIndex = Math.min(pastedDigits.length, length - 1);
      inputRefs.current[nextIndex]?.focus();

      if (newValue.length === length) {
        inputRefs.current[nextIndex]?.blur();
        onComplete?.(newValue);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      // If current input is empty and backspace is pressed, move to previous
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleBoxPress = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => {
        const isFilled = !!digits[index];
        const isFocused = focusedIndex === index;

        return (
          <Pressable
            key={index}
            onPress={() => handleBoxPress(index)}
            style={[
              styles.box,
              {
                backgroundColor: colors.glass,
                borderColor: error
                  ? colors.error
                  : isFocused
                  ? colors.primary
                  : isDark ? Palette.glassBorder: Palette.glassDark,
                borderWidth: isFocused ? 2 : 1,
              },
              isFilled && { borderColor: colors.primary },
              disabled && { opacity: 0.5 },
            ]}
          >
            <TextInput
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[
                styles.input,
                { color: colors.text },
                isFilled && { color: colors.primary },
              ]}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              selectionColor={colors.primary}
              value={digits[index] || ''}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(-1)}
              editable={!disabled}
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
            />
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  box: {
    width: 50,
    height: 56,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  input: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
    height: '100%',
    padding: 0,
  },
});
