import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppInput, ScreenWrapper, Typography } from '@/components/ui';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import { usePostStore } from '@/stores/postStore';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

// Mock people data - Replace with actual API/database
const MOCK_PEOPLE = [
  { id: '1', name: 'John Doe', username: '@johndoe', avatar: null },
  { id: '2', name: 'Jane Smith', username: '@janesmith', avatar: null },
  { id: '3', name: 'Mike Johnson', username: '@mikej', avatar: null },
  { id: '4', name: 'Sarah Williams', username: '@sarahw', avatar: null },
  { id: '5', name: 'David Brown', username: '@davidb', avatar: null },
];

export default function TagPeopleScreen() {
  const { colors } = useAppTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const { taggedPeople, setTaggedPeople } = usePostStore();
  const [selectedPeople, setSelectedPeople] = useState<string[]>(taggedPeople || []);

  const filteredPeople = MOCK_PEOPLE.filter(
    (person) =>
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleTag = (personId: string) => {
    setSelectedPeople((prev) =>
      prev.includes(personId)
        ? prev.filter((id) => id !== personId)
        : [...prev, personId]
    );
  };

  const handleDone = () => {
    setTaggedPeople(selectedPeople);
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
            Tag People
          </Typography>
          <Pressable onPress={handleDone} hitSlop={12}>
            <Typography variant="body" color={colors.primary} weight="semiBold">
              Done
            </Typography>
          </Pressable>
        </View>

        {/* Tagged People Preview */}
        {selectedPeople.length > 0 && (
          <View style={[styles.taggedContainer, { backgroundColor: colors.surface }]}>
            <Typography variant="caption" color={colors.textSecondary} style={{ marginBottom: Spacing.xs }}>
              {selectedPeople.length} {selectedPeople.length === 1 ? 'person' : 'people'} tagged
            </Typography>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.taggedList}>
                {selectedPeople.map((personId) => {
                  const person = MOCK_PEOPLE.find((p) => p.id === personId);
                  return (
                    <View
                      key={personId}
                      style={[styles.taggedChip, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}
                    >
                      <Typography variant="caption" color={colors.primary}>
                        {person?.name}
                      </Typography>
                      <Pressable onPress={() => toggleTag(personId)} hitSlop={8}>
                        <IconSymbol name="xmark" size={14} color={colors.primary} />
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Search */}
        <View style={styles.searchContainer}>
          <AppInput
            placeholder="Search people..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />}
            autoFocus
          />
        </View>

        {/* People List */}
        <FlatList
          data={filteredPeople}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isTagged = selectedPeople.includes(item.id);
            return (
              <Pressable
                onPress={() => toggleTag(item.id)}
                style={[
                  styles.personItem,
                  {
                    backgroundColor: colors.surface,
                    borderColor: isTagged ? colors.primary : colors.border,
                  },
                ]}
              >
                <View style={[styles.avatar, { backgroundColor: colors.primary + '30' }]}>
                  <IconSymbol name="person.fill" size={20} color={colors.primary} />
                </View>
                <View style={styles.personInfo}>
                  <Typography variant="body" weight="medium" color={colors.text}>
                    {item.name}
                  </Typography>
                  <Typography variant="caption" color={colors.textSecondary}>
                    {item.username}
                  </Typography>
                </View>
                {isTagged ? (
                  <IconSymbol name="checkmark.circle.fill" size={24} color={colors.primary} />
                ) : (
                  <View style={[styles.checkbox, { borderColor: colors.border }]} />
                )}
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <IconSymbol name="person" size={48} color={colors.textTertiary} />
              <Typography variant="body" color={colors.textSecondary} style={{ marginTop: Spacing.sm }}>
                No people found
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
  taggedContainer: {
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  taggedList: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  taggedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  searchContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  listContent: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
  personItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personInfo: {
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
  },
});
