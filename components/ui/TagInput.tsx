import { BorderRadius, Spacing } from '@/constants/spacing';
import { FontFamily, FontSize } from '@/constants/typography';
import { useAppTheme } from '@/context/ThemeContext';
import React, { useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
    ViewStyle,
} from 'react-native';
import { IconSymbol } from './icon-symbol';
import { Typography } from './Typography';

interface TagInputProps {
  label?: string;
  hint?: string;
  error?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
  containerStyle?: ViewStyle;
}

export const TagInput: React.FC<TagInputProps> = ({
  label,
  hint,
  error,
  value = [],
  onChange,
  maxTags = 10,
  placeholder = 'Add tag...',
  containerStyle,
}) => {
  const { colors } = useAppTheme();
  const [inputValue, setInputValue] = useState('');
  const [focused, setFocused] = useState(false);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (
      trimmedTag &&
      !value.includes(trimmedTag) &&
      value.length < maxTags
    ) {
      onChange([...value, trimmedTag]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === ' ' || e.nativeEvent.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  const handleSubmitEditing = () => {
    addTag(inputValue);
  };

  const borderColor = error
    ? colors.error
    : focused
    ? colors.borderFocused
    : colors.border;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <Typography variant="label" color={colors.textSecondary} style={styles.label}>
          {label}
        </Typography>
      )}

      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.surface,
            borderColor,
            borderWidth: 1,
          },
        ]}
      >
        {/* Tags Display */}
        {value.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsContainer}
          >
            {value.map((tag) => (
              <View
                key={tag}
                style={[
                  styles.tag,
                  {
                    backgroundColor: colors.primary + '20',
                    borderColor: colors.primary,
                  },
                ]}
              >
                <Typography
                  variant="caption"
                  size={13}
                  color={colors.primary}
                  weight="medium"
                >
                  #{tag}
                </Typography>
                <Pressable
                  onPress={() => removeTag(tag)}
                  hitSlop={8}
                  style={styles.removeButton}
                >
                  <IconSymbol name="xmark" size={12} color={colors.primary} />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Input */}
        {value.length < maxTags && (
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                fontFamily: FontFamily.regular,
                fontSize: FontSize.base,
              },
            ]}
            value={inputValue}
            onChangeText={setInputValue}
            onKeyPress={handleKeyPress}
            onSubmitEditing={handleSubmitEditing}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            placeholderTextColor={colors.textTertiary}
            returnKeyType="done"
            autoCapitalize="none"
            autoCorrect={false}
          />
        )}
      </View>

      {/* Hint or Error */}
      {(hint || error) && (
        <Typography
          variant="caption"
          color={error ? colors.error : colors.textTertiary}
          style={styles.hint}
        >
          {error || hint}
        </Typography>
      )}

      {/* Tag count */}
      <Typography variant="caption" color={colors.textTertiary} style={styles.count}>
        {value.length}/{maxTags} tags
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    marginBottom: Spacing.xs,
  },
  container: {
    minHeight: 50,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingBottom: Spacing.xs,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  removeButton: {
    padding: 2,
  },
  input: {
    minHeight: 32,
    paddingVertical: Spacing.xs,
  },
  hint: {
    marginTop: Spacing.xs,
  },
  count: {
    marginTop: 4,
    textAlign: 'right',
  },
});
