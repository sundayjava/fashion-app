import { BorderRadius, Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassButton } from './GlassButton';
import { IconSymbol } from './icon-symbol';
import { Typography } from './Typography';

export interface Category {
  id: string;
  name: string;
}

interface CategorySelectorProps {
  label?: string;
  hint?: string;
  error?: string;
  value?: string; // category id
  onChange: (categoryId: string) => void;
  categories: Category[];
  placeholder?: string;
  containerStyle?: ViewStyle;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  label,
  hint,
  error,
  value,
  onChange,
  categories,
  placeholder = 'Select category',
  containerStyle,
}) => {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);

  const selectedCategory = categories.find((cat) => cat.id === value);

  const handleSelect = (categoryId: string) => {
    onChange(categoryId);
    setModalVisible(false);
  };

  const borderColor = error ? colors.error : colors.border;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <Typography variant="label" color={colors.textSecondary} style={styles.label}>
          {label}
        </Typography>
      )}

      <Pressable
        onPress={() => setModalVisible(true)}
        style={[
          styles.selector,
          {
            backgroundColor: colors.surface,
            borderColor,
            borderWidth: 1,
          },
        ]}
      >
        <Typography
          variant="body"
          color={selectedCategory ? colors.text : colors.textTertiary}
          style={{ flex: 1 }}
        >
          {selectedCategory ? selectedCategory.name : placeholder}
        </Typography>
        <IconSymbol
          name="chevron.down"
          size={20}
          color={colors.textSecondary}
        />
      </Pressable>

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

      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setModalVisible(false)}
          />
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.background,
                paddingBottom: insets.bottom + Spacing.md,
              },
            ]}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <Typography variant="h3" color={colors.text}>
                Select Category
              </Typography>
              <Pressable
                onPress={() => setModalVisible(false)}
                hitSlop={12}
                style={[styles.closeButton, { backgroundColor: colors.surface }]}
              >
                <IconSymbol name="xmark" size={20} color={colors.text} />
              </Pressable>
            </View>

            {/* Categories List */}
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleSelect(item.id)}
                  style={[
                    styles.categoryItem,
                    {
                      backgroundColor:
                        value === item.id ? colors.primary + '15' : 'transparent',
                    },
                  ]}
                >
                  <Typography
                    variant="body"
                    weight={value === item.id ? 'semiBold' : 'regular'}
                    color={value === item.id ? colors.primary : colors.text}
                  >
                    {item.name}
                  </Typography>
                  {value === item.id && (
                    <IconSymbol name="checkmark" size={20} color={colors.primary} />
                  )}
                </Pressable>
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />

            {/* Create New Category Button */}
            <View style={styles.footer}>
              <GlassButton
                variant="outline"
                label="Create New Category"
                onPress={() => {
                  setModalVisible(false);
                  // TODO: Navigate to create category screen
                }}
                leftIcon={<IconSymbol name="plus" size={20} color={colors.primary} />}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  hint: {
    marginTop: Spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    maxHeight: '70%',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: Spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
});
