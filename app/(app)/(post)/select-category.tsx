import { AppInput, ScreenWrapper, Typography } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import { usePostStore } from '@/stores/postStore';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';

// Mock categories - Replace with actual database
const MOCK_CATEGORIES = [
  { id: '1', name: 'Bridal', icon: 'sparkles' },
  { id: '2', name: 'Casual', icon: 'bag' },
  { id: '3', name: 'Streetwear', icon: 'figure.walk' },
  { id: '4', name: 'Shoes', icon: 'shoe' },
  { id: '5', name: 'Traditional', icon: 'star' },
  { id: '6', name: 'Corporate', icon: 'briefcase' },
  { id: '7', name: 'Accessories', icon: 'bag' },
  { id: '8', name: 'Evening Wear', icon: 'moon' },
];

export default function SelectCategoryScreen() {
  const { colors } = useAppTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const { categoryId, setCategoryId } = usePostStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryId || null);

  const filteredCategories = MOCK_CATEGORIES.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCategoryId(categoryId);
    setTimeout(() => {
      router.back();
    }, 200);
  };
  

  const handleCreateNew = () => {
    // TODO: Show modal or navigate to create category screen
    console.log('Create new category');
  };

  return (
    <ScreenWrapper>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <IconSymbol name="xmark" size={24} color={colors.text} />
          </Pressable>
          <Typography variant="h3" color={colors.text}>
            Select Category
          </Typography>
          <Pressable onPress={handleCreateNew} hitSlop={12}>
            <IconSymbol name="plus" size={24} color={colors.primary} />
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <AppInput
            placeholder="Search categories..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />}
            autoFocus
          />
        </View>

        {/* Category Grid */}
        <FlatList
          data={filteredCategories}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item.id;
            return (
              <Pressable
                onPress={() => handleSelectCategory(item.id)}
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor: isSelected ? colors.primary + '20' : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '30' }]}>
                  <IconSymbol
                    name={item.icon as any}
                    size={28}
                    color={isSelected ? colors.primary : colors.textSecondary}
                  />
                </View>
                <Typography
                  variant="body"
                  weight={isSelected ? 'semiBold' : 'medium'}
                  color={isSelected ? colors.primary : colors.text}
                  style={{ textAlign: 'center' }}
                >
                  {item.name}
                </Typography>
                {isSelected && (
                  <View style={styles.checkmark}>
                    <IconSymbol name="checkmark" size={16} color={colors.primary} />
                  </View>
                )}
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <IconSymbol name="square.grid.2x2" size={48} color={colors.textTertiary} />
              <Typography variant="body" color={colors.textSecondary} style={{ marginTop: Spacing.sm }}>
                No categories found
              </Typography>
            </View>
          }
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  searchContainer: {
    padding: Spacing.lg,
  },
  gridContent: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
  row: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  categoryCard: {
    flex: 1,
    aspectRatio: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    position: 'relative',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  footer: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
  },
});
