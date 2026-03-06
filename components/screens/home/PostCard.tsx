import { BookmarkFillIcon } from '@/assets/icons/BookMarkFillIcon';
import { BookMarkIcon } from '@/assets/icons/BookMarkIcon';
import { CommentsIcon } from '@/assets/icons/CommentsIcon';
import { HeartFillIcon } from '@/assets/icons/HeartFillIcon';
import { HeartIcon } from '@/assets/icons/HeartIcon';
import { LocationPin } from '@/assets/icons/LocationPin';
import { ShareIcon } from '@/assets/icons/ShareIcon';
import { Avatar, Typography } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import { ResizeMode, Video } from 'expo-av';
import { Image } from 'expo-image';
import React, { useCallback, useRef, useState } from 'react';
import {
    Dimensions,
    Pressable,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { ImagePreview } from './ImagePreview';

const { width } = Dimensions.get('window');
const MAIN_IMAGE_HEIGHT = width * 0.75;
const THUMB_SIZE = 60;

interface MediaItem {
    id: string;
    uri: string;
    type: 'image' | 'video';
    duration?: number;
}

interface PostCardProps {
    post: {
        id: string;
        user: {
            name: string;
            username: string;
            avatarUri?: string;
        };
        caption: string;
        media: MediaItem[];
        location?: string;
        category?: string;
        likes: number;
        comments: number;
        views: number;
        isLiked?: boolean;
        isSaved?: boolean;
        createdAt: string;
        taggedPeople?: string[];
    };
    onPress?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onPress }) => {
    const { colors } = useAppTheme();
    const videoRef = useRef<Video>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isLiked, setIsLiked] = useState(post.isLiked || false);
    const [isSaved, setIsSaved] = useState(post.isSaved || false);
    const [likesCount, setLikesCount] = useState(post.likes);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewStartIndex, setPreviewStartIndex] = useState(0);

    const hasVideo = post.media.some(m => m.type === 'video');
    const images = post.media.filter(m => m.type === 'image');
    const video = post.media.find(m => m.type === 'video');

    const handleLike = useCallback(() => {
        setIsLiked(!isLiked);
        setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    }, [isLiked, likesCount]);

    const handleSave = useCallback(() => {
        setIsSaved(!isSaved);
    }, [isSaved]);

    const handleComment = useCallback(() => {
        // TODO: Navigate to comments or open comment sheet
        console.log('Comment pressed');
    }, []);

    const handleShare = useCallback(() => {
        // TODO: Open share sheet
        console.log('Share pressed');
    }, []);

    const handleImageThumbPress = useCallback((index: number) => {
        setSelectedImageIndex(index);
    }, []);

    const handleImagePress = useCallback((index: number) => {
        setPreviewStartIndex(index);
        setPreviewVisible(true);
    }, []);

    const handleClosePreview = useCallback(() => {
        setPreviewVisible(false);
    }, []);

    const renderImageGallery = () => {
        if (images.length === 0) return null;

        if (images.length === 1) {
            return (
                <Pressable onPress={() => handleImagePress(0)}>
                    <Image
                        source={{ uri: images[0].uri }}
                        style={[styles.singleImage, { backgroundColor: colors.surface }]}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                    />
                </Pressable>
            );
        }

        const displayImages = images.slice(0, 3);
        const remainingCount = images.length - 3;

        return (
            <View style={styles.galleryContainer}>
                {/* Main Image */}
                <Pressable onPress={() => handleImagePress(selectedImageIndex)}>
                    <Image
                        source={{ uri: images[selectedImageIndex].uri }}
                        style={[styles.mainImage, { backgroundColor: colors.surface }]}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                    />
                </Pressable>

                {/* Thumbnails - Overlaid at bottom right */}
                <View style={styles.thumbnailsContainer}>
                    {displayImages.map((img, index) => (
                        <Pressable
                            key={img.id}
                            onPress={() => {
                                if (index === 2 && remainingCount > 0) {
                                    // Open preview to show all images
                                    handleImagePress(index);
                                } else {
                                    handleImageThumbPress(index);
                                }
                            }}
                            style={[
                                styles.thumbnail,
                                {
                                    borderColor: selectedImageIndex === index ? colors.primary : 'rgba(255,255,255,0.8)',
                                    backgroundColor: colors.surface,
                                },
                            ]}
                        >
                            <Image
                                source={{ uri: img.uri }}
                                style={styles.thumbnailImage}
                                contentFit="cover"
                                cachePolicy="memory-disk"
                            />
                            {index === 2 && remainingCount > 0 && (
                                <View style={[styles.remainingOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                                    <Typography variant="caption" weight="bold" color="#fff">
                                        +{remainingCount}
                                    </Typography>
                                </View>
                            )}
                        </Pressable>
                    ))}
                </View>
            </View>
        );
    };

    const renderVideo = () => {
        if (!video) return null;

        return (
            <View style={styles.videoContainer}>
                <Video
                    ref={videoRef}
                    source={{ uri: video.uri }}
                    style={[styles.video, { backgroundColor: colors.surface }]}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={false}
                    isLooping
                    isMuted={false}
                    useNativeControls
                />
            </View>
        );
    };

    return (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <Avatar
                        source={post.user.avatarUri ? { uri: post.user.avatarUri } : undefined}
                        initials={post.user.name.charAt(0)}
                        size="md"
                    />
                    <View style={styles.userText}>
                        <Typography variant="body" weight="semiBold" color={colors.text}>
                            {post.user.name}
                        </Typography>
                        <View style={styles.metaRow}>
                            <Typography variant="caption" color={colors.textSecondary}>
                                @{post.user.username}
                            </Typography>
                            <View style={[styles.dot, { backgroundColor: colors.textTertiary }]} />
                            <Typography variant="caption" color={colors.textSecondary}>
                                {post.createdAt}
                            </Typography>
                        </View>
                    </View>
                </View>
                <TouchableOpacity hitSlop={8}>
                    <IconSymbol name="ellipsis" size={20} color={colors.icon} />
                </TouchableOpacity>
            </View>

            {/* Caption */}
            {post.caption && (
                <Typography
                    variant="body"
                    color={colors.text}
                    style={styles.caption}
                    numberOfLines={3}
                >
                    {post.caption}
                </Typography>
            )}

            {/* Media */}
            {hasVideo ? renderVideo() : renderImageGallery()}

            {/* Location & Category */}
            {(post.location || post.category) && (
                <View style={styles.metaInfo}>
                    {post.location && (
                        <View style={styles.locationTag}>
                            <LocationPin width={16} height={16} color={colors.icon} />
                            <Typography variant="caption" color={colors.textSecondary}>
                                {post.location}
                            </Typography>
                        </View>
                    )}
                    {post.category && (
                        <View style={[styles.categoryTag, { backgroundColor: colors.primary + '15' }]}>
                            <Typography variant="caption" color={colors.primary} weight="medium">
                                {post.category}
                            </Typography>
                        </View>
                    )}
                </View>
            )}

            {/* Stats Bar */}
            <View style={[styles.statsBar, { borderTopColor: colors.border }]}>
                <View style={styles.statsLeft}>
                    <View style={styles.statItem}>
                        <HeartFillIcon color={colors.error} width={16} height={16} />
                        <Typography variant="caption" color={colors.textSecondary}>
                            {likesCount}
                        </Typography>
                    </View>
                    <View style={styles.statItem}>
                        <CommentsIcon color={colors.icon} width={20} height={20} />
                        <Typography variant="caption" color={colors.textSecondary}>
                            {post.comments}
                        </Typography>
                    </View>
                    <View style={styles.statItem}>
                        <IconSymbol name="eye" size={16} color={colors.textSecondary} />
                        <Typography variant="caption" color={colors.textSecondary}>
                            {post.views}
                        </Typography>
                    </View>
                </View>
            </View>

            {/* Action Bar */}
            <View style={[styles.actionBar, { borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleLike}
                    activeOpacity={0.7}
                >
                    {isLiked ? <HeartFillIcon color={colors.error} width={20} height={20} /> : <HeartIcon color={colors.icon} width={20} height={20} />}
                    <Typography
                        variant="caption"
                        color={isLiked ? colors.error : colors.textSecondary}
                        weight="medium"
                    >
                        Like
                    </Typography>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                    <CommentsIcon color={colors.icon} width={26} height={26} />
                    <Typography variant="caption" color={colors.textSecondary} weight="medium">
                        Comment
                    </Typography>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                    <ShareIcon color={colors.icon} width={22} height={24} />
                    <Typography variant="caption" color={colors.textSecondary} weight="medium">
                        Share
                    </Typography>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleSave}
                    activeOpacity={0.7}
                >
                    {isSaved ? <BookmarkFillIcon color={colors.primary} width={18} height={18} /> : <BookMarkIcon color={colors.icon} width={18} height={18} />}
                    <Typography
                        variant="caption"
                        color={isSaved ? colors.primary : colors.textSecondary}
                        weight="medium"
                    >
                        Save
                    </Typography>
                </TouchableOpacity>
            </View>

            {/* Image Preview Modal */}
            <ImagePreview
                visible={previewVisible}
                onClose={handleClosePreview}
                images={images}
                initialIndex={previewStartIndex}
                user={post.user}
                caption={post.caption}
                location={post.location}
                category={post.category}
                createdAt={post.createdAt}
                likes={likesCount}
                comments={post.comments}
                views={post.views}
                isLiked={isLiked}
                isSaved={isSaved}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.md,
        marginHorizontal: Spacing.md,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        flex: 1,
    },
    userText: {
        flex: 1,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginTop: -2,
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
    },
    caption: {
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.sm,
        lineHeight: 20,
    },
    singleImage: {
        width: '100%',
        height: MAIN_IMAGE_HEIGHT,
    },
    galleryContainer: {
        position: 'relative',
        width: '100%',
        height: MAIN_IMAGE_HEIGHT,
        marginBottom: Spacing.sm,
    },
    mainImage: {
        width: '100%',
        height: '100%',
    },
    thumbnailsContainer: {
        position: 'absolute',
        bottom: Spacing.sm,
        right: Spacing.sm,
        flexDirection: 'row',
        gap: Spacing.xs,
    },
    thumbnail: {
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: BorderRadius.sm,
        borderWidth: 2,
        overflow: 'hidden',
        position: 'relative',
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
    },
    remainingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoContainer: {
        width: '100%',
        height: MAIN_IMAGE_HEIGHT,
        marginBottom: Spacing.sm,
    },
    video: {
        width: '100%',
        height: '100%',
    },
    metaInfo: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.sm,
    },
    locationTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    categoryTag: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
    },
    statsBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    statsLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 1,
    },
    actionBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: Spacing.xs,
    },
});
