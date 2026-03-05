import { ControlledInput, GlassButton, ScreenWrapper, Typography } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import { usePostStore } from '@/stores/postStore';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';

const AVAILABILITY_OPTIONS = [
  { id: 'in_stock', label: 'In Stock', icon: 'checkmark.circle.fill', color: '#4CAF50' },
  { id: 'made_to_order', label: 'Made to Order', icon: 'hammer.fill', color: '#FF9800' },
  { id: 'sold_out', label: 'Sold Out', icon: 'xmark.circle.fill', color: '#F44336' },
  { id: 'coming_soon', label: 'Coming Soon', icon: 'clock.fill', color: '#2196F3' },
];

type FormValues = {
  priceMin?: string;
  priceMax?: string;
  collection?: string;
};

export default function AdditionalOptionsScreen() {
  const { colors } = useAppTheme();
  const { availability, priceMin, priceMax, collection, setAvailability, setPriceRange, setCollection } = usePostStore();
  const [selectedAvailability, setSelectedAvailability] = useState<string | null>(availability || null);
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      priceMin: priceMin?.toString() || '',
      priceMax: priceMax?.toString() || '',
      collection: collection || '',
    },
  });

  const handleSave = (data: FormValues) => {
    // Save to zustand store
    setPriceRange(
      data.priceMin ? parseFloat(data.priceMin) : undefined,
      data.priceMax ? parseFloat(data.priceMax) : undefined
    );
    setAvailability(selectedAvailability as any);
    setCollection(data.collection || '');
    
    router.back();
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
            Additional Options
          </Typography>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <ScrollView contentContainerStyle={styles.content}>
          {/* Price Range */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="creditcard.fill" size={20} color={colors.primary} />
              <Typography variant="body" weight="semiBold" color={colors.text}>
                Price Range
              </Typography>
            </View>
            <Typography variant="caption" color={colors.textSecondary} style={{ marginBottom: Spacing.sm }}>
              Optional - Set price range for your item
            </Typography>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <ControlledInput
                  control={control}
                  name="priceMin"
                  placeholder="Min price"
                  keyboardType="numeric"
                  leftIcon={<Typography variant="body" color={colors.textSecondary}>$</Typography>}
                />
              </View>
              <Typography variant="body" color={colors.textSecondary} style={{ paddingHorizontal: Spacing.sm }}>
                -
              </Typography>
              <View style={{ flex: 1 }}>
                <ControlledInput
                  control={control}
                  name="priceMax"
                  placeholder="Max price"
                  keyboardType="numeric"
                  leftIcon={<Typography variant="body" color={colors.textSecondary}>$</Typography>}
                />
              </View>
            </View>
          </View>

          {/* Availability */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="checkmark.circle" size={20} color={colors.primary} />
              <Typography variant="body" weight="semiBold" color={colors.text}>
                Availability
              </Typography>
            </View>
            <Typography variant="caption" color={colors.textSecondary} style={{ marginBottom: Spacing.sm }}>
              Select availability status
            </Typography>
            <View style={styles.availabilityGrid}>
              {AVAILABILITY_OPTIONS.map((option) => {
                const isSelected = selectedAvailability === option.id;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => setSelectedAvailability(option.id)}
                    style={[
                      styles.availabilityCard,
                      {
                        backgroundColor: isSelected ? option.color + '20' : colors.surface,
                        borderColor: isSelected ? option.color : colors.border,
                      },
                    ]}
                  >
                    <IconSymbol
                      name={option.icon as any}
                      size={24}
                      color={isSelected ? option.color : colors.textSecondary}
                    />
                    <Typography
                      variant="caption"
                      weight={isSelected ? 'semiBold' : 'medium'}
                      color={isSelected ? option.color : colors.text}
                      style={{ textAlign: 'center' }}
                    >
                      {option.label}
                    </Typography>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Collection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="square.stack.3d.up.fill" size={20} color={colors.primary} />
              <Typography variant="body" weight="semiBold" color={colors.text}>
                Collection
              </Typography>
            </View>
            <Typography variant="caption" color={colors.textSecondary} style={{ marginBottom: Spacing.sm }}>
              Optional - Group items in a collection
            </Typography>
            <ControlledInput
              control={control}
              name="collection"
              placeholder="E.g., Summer 2026, Bridal Collection"
              leftIcon={<IconSymbol name="bag.fill" size={18} color={colors.textSecondary} />}
            />
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <GlassButton
            label="Save Options"
            onPress={handleSubmit(handleSave)}
            fullWidth
          />
        </View>
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
  content: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  availabilityCard: {
    flex: 1,
    minWidth: '45%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
  },
});
