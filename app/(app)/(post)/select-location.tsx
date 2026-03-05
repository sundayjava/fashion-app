import { AppInput, ScreenWrapper, Typography } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import { LocationSearchResult, searchPlaces } from '@/services/location';
import { usePostStore } from '@/stores/postStore';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

export default function SelectLocationScreen() {
  const { colors } = useAppTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [locations, setLocations] = useState<LocationSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { location, setLocation } = usePostStore();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(location || null);
  
  // Refs for debouncing
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced search effect
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Clear previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Reset error
    setError(null);

    // Don't search if query is too short
    if (searchQuery.trim().length < 2) {
      setLocations([]);
      setIsLoading(false);
      return;
    }

    // Show loading state
    setIsLoading(true);

    // Debounce search by 500ms
    searchTimeoutRef.current = setTimeout(async () => {
      abortControllerRef.current = new AbortController();
      
      try {
        const results = await searchPlaces(searchQuery, abortControllerRef.current.signal);
        setLocations(results);
        setIsLoading(false);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Search error:', err);
          setError('Failed to search locations. Please try again.');
          setIsLoading(false);
        }
      }
    }, 500);

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [searchQuery]);

  const handleSelectLocation = (selectedItem: LocationSearchResult) => {
    const fullLocation = `${selectedItem.name}${selectedItem.address ? ', ' + selectedItem.address : ''}`;
    setSelectedLocation(selectedItem.id);
    setLocation(fullLocation);
    setTimeout(() => {
      router.back();
    }, 200);
  };

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Typography variant="body" color={colors.textSecondary} style={{ marginTop: Spacing.md }}>
            Searching...
          </Typography>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyState}>
          <IconSymbol name="xmark.circle.fill" size={48} color={colors.error} />
          <Typography variant="body" color={colors.textSecondary} style={{ marginTop: Spacing.sm, textAlign: 'center', paddingHorizontal: Spacing.xl }}>
            {error}
          </Typography>
        </View>
      );
    }

    if (searchQuery.trim().length < 2) {
      return (
        <View style={styles.emptyState}>
          <IconSymbol name="magnifyingglass" size={48} color={colors.textTertiary} />
          <Typography variant="body" color={colors.textSecondary} style={{ marginTop: Spacing.sm, textAlign: 'center', paddingHorizontal: Spacing.xl }}>
            Type at least 2 characters to search
          </Typography>
          <Typography variant="caption" color={colors.textTertiary} style={{ marginTop: Spacing.xs, textAlign: 'center', paddingHorizontal: Spacing.xl }}>
            e.g., &quot;Sheraton Hotel&quot;, &quot;Lagos&quot;, &quot;Victoria Island&quot;
          </Typography>
        </View>
      );
    }

    if (locations.length === 0) {
      return (
        <View style={styles.emptyState}>
          <IconSymbol name="location" size={48} color={colors.textTertiary} />
          <Typography variant="body" color={colors.textSecondary} style={{ marginTop: Spacing.sm }}>
            No locations found
          </Typography>
          <Typography variant="caption" color={colors.textTertiary} style={{ marginTop: Spacing.xs }}>
            Try a different search term
          </Typography>
        </View>
      );
    }

    return null;
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
            Select Location
          </Typography>
          <View style={{ width: 24 }} />
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <AppInput
            placeholder="Search places, cities, addresses..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />}
            rightIcon={
              isLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : searchQuery.length > 0 ? (
                <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                  <IconSymbol name="xmark.circle.fill" size={20} color={colors.textTertiary} />
                </Pressable>
              ) : undefined
            }
            autoFocus
            autoCapitalize="none"
          />
        </View>

        {/* Location List */}
        <FlatList
          data={locations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleSelectLocation(item)}
              style={[
                styles.locationItem,
                {
                  backgroundColor: colors.surface,
                  borderColor: selectedLocation === item.id ? colors.primary : colors.border,
                },
              ]}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                <IconSymbol
                  name="location.fill"
                  size={20}
                  color={selectedLocation === item.id ? colors.primary : colors.textSecondary}
                />
              </View>
              <View style={styles.locationInfo}>
                <Typography variant="body" weight="medium" color={colors.text} numberOfLines={1}>
                  {item.name}
                </Typography>
                <Typography variant="caption" color={colors.textSecondary} numberOfLines={1}>
                  {item.address}
                </Typography>
                <View style={styles.typeBadge}>
                  <Typography variant="caption" size={10} color={colors.textTertiary}>
                    {item.type}
                  </Typography>
                </View>
              </View>
              {selectedLocation === item.id && (
                <IconSymbol name="checkmark.circle.fill" size={24} color={colors.primary} />
              )}
            </Pressable>
          )}
          ListEmptyComponent={renderEmptyState()}
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
    paddingBottom: Spacing.sm,
  },
  listContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.sm,
    flexGrow: 1,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInfo: {
    flex: 1,
    gap: 2,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
    paddingTop: Spacing['3xl'],
  },
});
