import { Avatar, Typography } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewToken
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActionButtonsGroup } from './PostActionButtons';

const { width, height } = Dimensions.get('window');

interface MediaItem {
    id: string;
    uri: string;
    type: 'image' | 'video';
}

interface PostUser {
    name: string;
    username: string;
    avatarUri?: string;
}

interface ImagePreviewProps {
    visible: boolean;
    onClose: () => void;
    images: MediaItem[];
    initialIndex?: number;
    user: PostUser;
    caption?: string;
    location?: string;
    category?: string;
    createdAt: string;
    likes: number;
    comments: number;
    views: number;
    isLiked?: boolean;
    isSaved?: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
    visible,
    onClose,
    images,
    initialIndex = 0,
    user,
    caption,
    location,
    category,
    createdAt,
    likes,
    comments,
    views,
    isLiked: initialIsLiked,
    isSaved: initialIsSaved,
}) => {
    const { colors } = useAppTheme();
    const insets = useSafeAreaInsets();
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isLiked, setIsLiked] = useState(initialIsLiked || false);
    const [isSaved, setIsSaved] = useState(initialIsSaved || false);
    const [likesCount, setLikesCount] = useState(likes);
    const flatListRef = useRef<FlatList>(null);

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

    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index || 0);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    // Reset to initial index when modal opens
    React.useEffect(() => {
        if (visible && flatListRef.current && initialIndex > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToIndex({ index: initialIndex, animated: false });
            }, 100);
        }
        setCurrentIndex(initialIndex);
    }, [visible, initialIndex]);

    const renderImage = ({ item, index }: { item: MediaItem; index: number }) => (
        <View style={styles.imageContainer}>
            <Image
                source={{ uri: item.uri }}
                style={styles.image}
                contentFit="contain"
                cachePolicy="memory-disk"
            />
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {/* Top Header with Gradient */}
                <LinearGradient
                    colors={[colors.background + 'E6', colors.background + '00']}
                    style={[
                        styles.topHeader,
                        {
                            paddingTop: insets.top,
                        },
                    ]}
                >
                    <TouchableOpacity
                        onPress={onClose}
                        style={styles.closeButton}
                        hitSlop={8}
                    >
                        <IconSymbol name="xmark" size={24} color={colors.text} />
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <Typography variant="body" weight="semiBold" color={colors.text}>
                            {currentIndex + 1} / {images.length}
                        </Typography>
                    </View>

                    <TouchableOpacity style={styles.moreButton} hitSlop={8}>
                        <IconSymbol name="ellipsis" size={24} color={colors.text} />
                    </TouchableOpacity>
                </LinearGradient>

                {/* Images FlatList - Horizontal Instagram Stories Style */}
                <FlatList
                    ref={flatListRef}
                    data={images}
                    renderItem={renderImage}
                    keyExtractor={(item) => item.id}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    getItemLayout={(_, index) => ({
                        length: width,
                        offset: width * index,
                        index,
                    })}
                />

                {/* Bottom Info Panel with Gradient */}
                <LinearGradient
                    colors={[colors.background + '00', colors.background + 'E6', colors.background + 'F2']}
                    locations={[0, 0.3, 1]}
                    style={[
                        styles.bottomPanel,
                        {
                            paddingBottom: insets.bottom + Spacing.md,
                        },
                    ]}
                >
                    {/* Action Buttons Row */}
                    <ActionButtonsGroup
                        isLiked={isLiked}
                        isSaved={isSaved}
                        onLike={handleLike}
                        onComment={handleComment}
                        onShare={handleShare}
                        onSave={handleSave}
                        style={{ marginBottom: Spacing.sm }}
                    />

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <Typography variant="body" weight="semiBold" color={colors.text}>
                            {likesCount.toLocaleString()} likes
                        </Typography>
                        <View style={[styles.statDot, { backgroundColor: colors.textTertiary }]} />
                        <Typography variant="body" color={colors.textSecondary}>
                            {comments.toLocaleString()} comments
                        </Typography>
                        <View style={[styles.statDot, { backgroundColor: colors.textTertiary }]} />
                        <Typography variant="body" color={colors.textSecondary}>
                            {views.toLocaleString()} views
                        </Typography>
                    </View>

                    {/* User Info */}
                    <View style={styles.userRow}>
                        <Avatar
                            source={user.avatarUri ? { uri: user.avatarUri } : undefined}
                            initials={user.name.charAt(0)}
                            size="sm"
                        />
                        <View style={styles.userInfo}>
                            <Typography variant="body" weight="semiBold" color={colors.text}>
                                {user.name}
                            </Typography>
                            <View style={styles.metaRow}>
                                <Typography variant="caption" color={colors.textSecondary}>
                                    @{user.username}
                                </Typography>
                                <View style={[styles.metaDot, { backgroundColor: colors.textTertiary }]} />
                                <Typography variant="caption" color={colors.textSecondary}>
                                    {createdAt}
                                </Typography>
                            </View>
                        </View>
                    </View>

                    {/* Caption */}
                    {caption && (
                        <Pressable style={styles.captionContainer}>
                            <Typography
                                variant="body"
                                color={colors.text}
                                style={styles.caption}
                                numberOfLines={3}
                            >
                                {caption}
                            </Typography>
                        </Pressable>
                    )}

                </LinearGradient>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topHeader: {
        position: 'absolute',
        top: 10,
        left: 0,
        right: 0,
        zIndex: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.sm,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    closeButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    moreButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageContainer: {
        width,
        height,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    bottomPanel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.md,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    actionsLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    actionButton: {
        padding: Spacing.xs,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.sm,
    },
    statDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    userInfo: {
        flex: 1,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginTop: -2,
    },
    metaDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
    },
    captionContainer: {
        marginBottom: Spacing.sm,
    },
    caption: {
        lineHeight: 20,
    },
    metaInfo: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
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
});
