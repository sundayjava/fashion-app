import {
    AppBottomSheet,
    ControlledInput,
    ScreenWrapper,
    showToast,
    Typography,
} from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import { usePostStore } from '@/stores/postStore';
import BottomSheet from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    Alert,
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// More menu options - all options in bottom sheet
const MORE_MENU_OPTIONS = [
  {
    id: 'photo',
    label: 'Photo',
    icon: 'photo',
    color: '#4CAF50',
    description: 'Add up to 10 photos',
  },
  {
    id: 'video',
    label: 'Video',
    icon: 'video.fill',
    color: '#F44336',
    description: 'Add a video (max 3 minutes)',
  },
  {
    id: 'location',
    label: 'Location',
    icon: 'location.fill',
    color: '#FF9800',
    route: '/(app)/(post)/select-location',
  },
  {
    id: 'tag-people',
    label: 'Tag People',
    icon: 'person.fill',
    color: '#2196F3',
    route: '/(app)/(post)/tag-people',
  },
  {
    id: 'category',
    label: 'Category',
    icon: 'square.grid.2x2.fill',
    color: '#9C27B0',
    route: '/(app)/(post)/select-category',
  },
  {
    id: 'options',
    label: 'Additional Options',
    icon: 'slider.horizontal.3',
    color: '#607D8B',
    route: '/(app)/(post)/additional-options',
    description: 'Price, Availability, Collection',
  },
];

export const AddPost = () => {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Zustand store
  const {
    caption,
    media,
    tags,
    categoryId,
    location,
    taggedPeople,
    setCaption,
    addMedia,
    removeMedia,
    reset: resetStore,
  } = usePostStore();

  const {
    control,
    handleSubmit,
    setValue,
  } = useForm<any>({
    defaultValues: {
      caption: caption || '',
    },
  });

  // Sync form caption with store
  React.useEffect(() => {
    setValue('caption', caption);
  }, [caption, setValue]);

  // Request media library permissions
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant photo library access to add media to your post.'
      );
      return false;
    }
    return true;
  };

  // Pick images
  const pickImages = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 10 - media.length, // Max 10 media items
      });

      if (!result.canceled && result.assets) {
        result.assets.forEach((asset, index) => {
          addMedia({
            id: `${Date.now()}_${index}`,
            uri: asset.uri,
            type: 'image' as const,
          });
        });
      }
    } catch (_error) {
      showToast({ type: 'error', text1: 'Failed to pick images' });
    }
  };

  // Pick video
  const pickVideo = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    // Check if already has video
    if (media.some((m) => m.type === 'video')) {
      Alert.alert('Video Limit', 'You can only add one video per post.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        quality: 0.8,
        videoMaxDuration: 180, // 3 minutes max
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        addMedia({
          id: `${Date.now()}`,
          uri: asset.uri,
          type: 'video',
          duration: asset.duration ?? undefined,
        });
      }
    } catch (_error) {
      showToast({ type: 'error', text1: 'Failed to pick video' });
    }
  };

  // Remove media item - using store
  const handleRemoveMedia = (id: string) => {
    removeMedia(id);
  };

  // Handle navigation back
  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(app)/(tabs)');
    }
  };

  // Publish post
  const publishPost = (data: any) => {
    if (media.length === 0) {
      showToast({ type: 'error', text1: 'Please add at least one image or video' });
      return;
    }

    setIsSubmitting(true);
    // Update caption in store
    setCaption(data.caption);
    // TODO: Upload media and save to database as published
    console.log('Publish data:', { caption: data.caption, media, tags, categoryId, location, taggedPeople });
    
    setTimeout(() => {
      setIsSubmitting(false);
      showToast({ type: 'success', text1: 'Post published successfully' });
      handleClose();
      resetStore();
    }, 2000);
  };

  // Open more options menu
  const openMoreMenu = () => {
    bottomSheetRef.current?.snapToIndex(0);
  };

  // Handle menu option selection
  const handleMenuOption = (option: typeof MORE_MENU_OPTIONS[0]) => {
    bottomSheetRef.current?.close();
    
    if (option.id === 'photo') {
      setTimeout(() => pickImages(), 300);
    } else if (option.id === 'video') {
      setTimeout(() => pickVideo(), 300);
    } else if (option.route) {
      setTimeout(() => {
        router.push(option.route as any);
      }, 300);
    }
  };

  return (
    <ScreenWrapper>
      <View style={[styles.container]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={handleClose} hitSlop={12}>
            <IconSymbol name="xmark" size={24} color={colors.text} />
          </Pressable>
          <Typography variant="h3" color={colors.text}>
            Create post
          </Typography>
          <Pressable onPress={handleSubmit(publishPost)} disabled={isSubmitting} hitSlop={12}>
            <Typography variant="body" color={isSubmitting ? colors.textTertiary : colors.primary} weight="semiBold">
              {isSubmitting ? 'Posting...' : 'Post'}
            </Typography>
          </Pressable>
        </View>

        {/* Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Caption Input */}
          <ControlledInput
            control={control}
            name="caption"
            placeholder="What's on your mind?"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            style={{ minHeight: 120, fontSize: 16 }}
            containerStyle={{ marginBottom: Spacing.lg }}
          />

          {/* Media Preview */}
          {media.length > 0 && (
            <View style={[styles.mediaPreview, { backgroundColor: colors.surface }]}>
              <View style={styles.mediaGrid}>
                {media.map((item, index) => (
                  <View key={item.id} style={styles.mediaItem}>
                    <Image
                      source={{ uri: item.uri }}
                      style={styles.mediaImage}
                      contentFit="cover"
                    />
                    {item.type === 'video' && (
                      <View style={styles.videoOverlay}>
                        <IconSymbol name="play.circle.fill" size={32} color="#fff" />
                      </View>
                    )}
                    <Pressable
                      onPress={() => handleRemoveMedia(item.id)}
                      style={[styles.removeButton, { backgroundColor: colors.error }]}
                    >
                      <IconSymbol name="xmark" size={12} color="#fff" />
                    </Pressable>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Selected Options Preview */}
          {(categoryId || location || (taggedPeople && taggedPeople.length > 0)) && (
            <View style={styles.selectedOptionsContainer}>
              {categoryId && (
                <View style={[styles.optionChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <IconSymbol name="square.grid.2x2.fill" size={14} color="#9C27B0" />
                  <Typography variant="caption" size={12} color={colors.text}>Category</Typography>
                </View>
              )}
              {location && (
                <View style={[styles.optionChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <IconSymbol name="location.fill" size={14} color="#FF9800" />
                  <Typography variant="caption" size={12} color={colors.text}>{location}</Typography>
                </View>
              )}
              {taggedPeople && taggedPeople.length > 0 && (
                <View style={[styles.optionChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <IconSymbol name="person.fill" size={14} color="#2196F3" />
                  <Typography variant="caption" size={12} color={colors.text}>
                    {taggedPeople.length} {taggedPeople.length === 1 ? 'person' : 'people'}
                  </Typography>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Action Bar */}
        <View
          style={[
            styles.actionBar,
            {
              borderTopColor: colors.border,
              paddingBottom: insets.bottom + Spacing.xs,
              backgroundColor: colors.background,
            },
          ]}
        >
          <Pressable
            onPress={pickImages}
            style={styles.actionButton}
            disabled={media.some((m) => m.type === 'video')}
          >
            <IconSymbol name="photo" size={24} color={media.some((m) => m.type === 'video') ? colors.textTertiary : '#4CAF50'} />
            <Typography variant="caption" size={11} color={colors.text}>Photo</Typography>
          </Pressable>

          <Pressable
            onPress={pickVideo}
            style={styles.actionButton}
            disabled={media.length > 0}
          >
            <IconSymbol name="video.fill" size={24} color={media.length > 0 ? colors.textTertiary : '#F44336'} />
            <Typography variant="caption" size={11} color={colors.text}>Video</Typography>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(app)/(post)/tag-people')}
            style={styles.actionButton}
          >
            <IconSymbol name="person.fill" size={24} color="#2196F3" />
            <Typography variant="caption" size={11} color={colors.text}>Tag</Typography>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(app)/(post)/select-category')}
            style={styles.actionButton}
          >
            <IconSymbol name="square.grid.2x2.fill" size={24} color="#9C27B0" />
            <Typography variant="caption" size={11} color={colors.text}>Category</Typography>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(app)/(post)/select-location')}
            style={styles.actionButton}
          >
            <IconSymbol name="location.fill" size={24} color="#FF9800" />
            <Typography variant="caption" size={11} color={colors.text}>Location</Typography>
          </Pressable>

          <Pressable
            onPress={openMoreMenu}
            style={styles.actionButton}
          >
            <IconSymbol name="ellipsis.circle.fill" size={24} color={colors.textSecondary} />
            <Typography variant="caption" size={11} color={colors.text}>More</Typography>
          </Pressable>
        </View>

        {/* More Options Bottom Sheet */}
        <AppBottomSheet
          ref={bottomSheetRef}
          snapPoints={['45%', '70%']}
          title="Add to your post"
        >
          <View style={styles.menuList}>
            {MORE_MENU_OPTIONS.map((option) => (
              <Pressable
                key={option.id}
                onPress={() => handleMenuOption(option)}
                style={[styles.menuItem, { borderBottomColor: colors.border }]}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: option.color + '20' }]}>
                  <IconSymbol name={option.icon as any} size={24} color={option.color} />
                </View>
                <View style={styles.menuContent}>
                  <Typography variant="body" weight="medium" color={colors.text}>
                    {option.label}
                  </Typography>
                  {option.description && (
                    <Typography variant="caption" color={colors.textSecondary}>
                      {option.description}
                    </Typography>
                  )}
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.textTertiary} />
              </Pressable>
            ))}
          </View>
        </AppBottomSheet>
      </View>
    </ScreenWrapper>
  );
};

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
  scrollContent: {
    padding: Spacing.lg,
  },
  mediaPreview: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  mediaItem: {
    width: (width - Spacing.lg * 2 - Spacing.sm * 2 - Spacing.xs * 2) / 3,
    height: (width - Spacing.lg * 2 - Spacing.sm * 2 - Spacing.xs * 2) / 3,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    gap: 4,
  },
  menuList: {
    paddingBottom: Spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
    gap: 2,
  },
});
