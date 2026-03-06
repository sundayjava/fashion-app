import { NotificationIcon } from '@/assets/icons/Notification';
import { SearchIcon } from '@/assets/icons/SearchIcon';
import { Avatar, Typography } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { appName } from '@/constants/settings';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NewPostsIndicator } from './NewPostsIndicator';
import { PostCard } from './PostCard';

// Mock categories - Replace with actual database
const CATEGORIES = [
    { id: 'all', name: 'All', icon: 'square.grid.2x2' },
    { id: '1', name: 'Bridal', icon: 'sparkles' },
    { id: '2', name: 'Casual', icon: 'bag' },
    { id: '3', name: 'Streetwear', icon: 'figure.walk' },
    { id: '4', name: 'Shoes', icon: 'shoe' },
    { id: '5', name: 'Traditional', icon: 'star' },
    { id: '6', name: 'Corporate', icon: 'briefcase' },
    { id: '7', name: 'Accessories', icon: 'bag' },
    { id: '8', name: 'Evening Wear', icon: 'moon' },
];

// Mock posts data - Replace with actual database/API
const MOCK_POSTS = [
    {
        id: '1',
        user: {
            name: 'Sarah Johnson',
            username: 'sarahjdesigns',
            avatarUri: 'https://i.pravatar.cc/150?img=1',
        },
        caption: 'Just finished this stunning bridal collection! 💍✨ What do you think? Available for custom orders.',
        media: [
            { id: 'm1', uri: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800', type: 'image' as const },
            { id: 'm2', uri: 'https://images.unsplash.com/photo-1519657337289-077653f724ed?w=800', type: 'image' as const },
            { id: 'm3', uri: 'https://images.unsplash.com/photo-1594552072238-6d37f4145e84?w=800', type: 'image' as const },
            { id: 'm4', uri: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800', type: 'image' as const },
        ],
        location: 'Lagos, Nigeria',
        category: 'Bridal',
        likes: 1234,
        comments: 89,
        views: 5678,
        isLiked: false,
        isSaved: false,
        createdAt: '2h ago',
    },
    {
        id: '2',
        user: {
            name: 'Michael Chen',
            username: 'mchen_fashion',
            avatarUri: 'https://i.pravatar.cc/150?img=12',
        },
        caption: '🎥 Behind the scenes of our latest streetwear collection shoot! The energy was incredible 🔥',
        media: [
            { 
                id: 'v1', 
                uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 
                type: 'video' as const,
                duration: 120,
            },
        ],
        location: 'New York, USA',
        category: 'Streetwear',
        likes: 2341,
        comments: 156,
        views: 12453,
        isLiked: true,
        isSaved: false,
        createdAt: '5h ago',
    },
    {
        id: '3',
        user: {
            name: 'Amara Okafor',
            username: 'amara_couture',
            avatarUri: 'https://i.pravatar.cc/150?img=5',
        },
        caption: 'Traditional meets modern in this Ankara masterpiece. Preserving culture through fashion 🇳🇬❤️',
        media: [
            { id: 'm5', uri: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800', type: 'image' as const },
        ],
        location: 'Abuja, Nigeria',
        category: 'Traditional',
        likes: 892,
        comments: 45,
        views: 3421,
        isLiked: false,
        isSaved: true,
        createdAt: '1d ago',
    },
    {
        id: '4',
        user: {
            name: 'Emma Rodriguez',
            username: 'emma_styles',
            avatarUri: 'https://i.pravatar.cc/150?img=9',
        },
        caption: 'Corporate elegance redefined. Perfect for the modern professional woman 👔',
        media: [
            { id: 'm6', uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', type: 'image' as const },
            { id: 'm7', uri: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800', type: 'image' as const },
            { id: 'm8', uri: 'https://thevou.com/wp-content/uploads/2024/06/what-is-a-fashion-trend-or-trendy-fashion-696x1044.jpg', type: 'image' as const },
        ],
        location: 'London, UK',
        category: 'Corporate',
        likes: 543,
        comments: 32,
        views: 2187,
        isLiked: false,
        isSaved: false,
        createdAt: '2d ago',
    },
    {
        id: '5',
        user: {
            name: 'David Park',
            username: 'davidpark_shoes',
            avatarUri: 'https://i.pravatar.cc/150?img=15',
        },
        caption: 'New collection drop! 👟 Handcrafted leather shoes for every occasion. Limited stock available.',
        media: [
            { id: 'm9', uri: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800', type: 'image' as const },
            { id: 'm10', uri: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800', type: 'image' as const },
        ],
        location: 'Seoul, South Korea',
        category: 'Shoes',
        likes: 678,
        comments: 54,
        views: 2890,
        isLiked: true,
        isSaved: true,
        createdAt: '3d ago',
    },
];

// Mock new posts for indicator
const MOCK_NEW_POSTS = [
    { userId: '101', userName: 'Jane Doe', avatarUri: 'https://i.pravatar.cc/150?img=20' },
    { userId: '102', userName: 'John Smith', avatarUri: 'https://i.pravatar.cc/150?img=21' },
    { userId: '103', userName: 'Lisa Wang', avatarUri: 'https://i.pravatar.cc/150?img=22' },
    { userId: '104', userName: 'Alex Brown', avatarUri: 'https://i.pravatar.cc/150?img=23' },
    { userId: '105', userName: 'Maria Garcia', avatarUri: 'https://i.pravatar.cc/150?img=24' },
];

export const HomeComponent = () => {
    const { colors } = useAppTheme();
    const insets = useSafeAreaInsets();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [categoryDropdownVisible, setCategoryDropdownVisible] = useState(false);
    const [showNewPosts, setShowNewPosts] = useState(true);
    const scrollY = useRef(new Animated.Value(0)).current;
    const lastScrollY = useRef(0);
    const headerTranslateY = useRef(new Animated.Value(0)).current;
    const categoryListHeight = useRef(new Animated.Value(0)).current;
    const isHeaderHidden = useRef(false);
    const flatListRef = useRef<any>(null);

    // Mock posts data - filter by category
    const posts = selectedCategory === 'all' 
        ? MOCK_POSTS 
        : MOCK_POSTS.filter(post => 
            post.category?.toLowerCase() === CATEGORIES.find(c => c.id === selectedCategory)?.name.toLowerCase()
          );

    const selectedCategoryName =
        CATEGORIES.find((cat) => cat.id === selectedCategory)?.name || 'All';

    const toggleCategoryDropdown = () => {
        const isVisible = !categoryDropdownVisible;
        setCategoryDropdownVisible(isVisible);
        
        categoryListHeight.stopAnimation();
        Animated.timing(categoryListHeight, {
            toValue: isVisible ? 60 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    const closeCategoryDropdown = () => {
        if (!categoryDropdownVisible) return;
        setCategoryDropdownVisible(false);
        
        categoryListHeight.stopAnimation();
        Animated.timing(categoryListHeight, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        {
            useNativeDriver: true,
            listener: (event: any) => {
                const currentScrollY = event.nativeEvent.contentOffset.y;
                const diff = currentScrollY - lastScrollY.current;
                const headerHeight = 60 + insets.top;
                const categoryOffset = 52;
                const totalHideDistance = headerHeight + categoryOffset + 60; // 60 is category max height

                if (diff > 10 && currentScrollY > 60 && !isHeaderHidden.current) {
                    // Scrolling down (content going up) - hide header and category
                    isHeaderHidden.current = true;
                    // Close category dropdown when hiding
                    if (categoryDropdownVisible) {
                        closeCategoryDropdown();
                    }
                    Animated.timing(headerTranslateY, {
                        toValue: -totalHideDistance,
                        duration: 200,
                        useNativeDriver: true,
                    }).start();
                } else if (diff < -20 && currentScrollY > 0 && isHeaderHidden.current) {
                    // Scrolling up (content going down) with intention - show header
                    isHeaderHidden.current = false;
                    Animated.timing(headerTranslateY, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: true,
                    }).start();
                }

                lastScrollY.current = currentScrollY;
            },
        }
    );

    const handleLoadNewPosts = () => {
        setShowNewPosts(false);
        // Scroll to top
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        // In real app, fetch new posts here
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Animated Header */}
            <Animated.View
                style={[
                    styles.header,
                    {
                        backgroundColor: colors.surface + 'F0',
                        paddingTop: insets.top + 10,
                        transform: [{ translateY: headerTranslateY }],
                    },
                ]}
            >
                {/* Left - App Name & Category Dropdown */}
                <View style={styles.headerLeft}>
                    <Typography variant="h4" weight="bold" color={colors.text}>
                        {appName} -
                    </Typography>

                    <Pressable
                        onPress={toggleCategoryDropdown}
                        style={[
                            styles.categoryButton,
                        ]}
                    >
                        <Typography
                            variant="body"
                            weight="bold"
                            size={16}
                            color={colors.primary}
                        >
                            {selectedCategoryName}
                        </Typography>
                        <Animated.View
                            style={{
                                transform: [{
                                    rotate: categoryListHeight.interpolate({
                                        inputRange: [0, 60],
                                        outputRange: ['0deg', '180deg'],
                                    })
                                }]
                            }}
                        >
                            <IconSymbol
                                name="chevron.down"
                                size={18}
                                color={colors.primary}
                            />
                        </Animated.View>
                    </Pressable>
                </View>

                {/* Right - Icons */}
                <View style={styles.headerRight}>
                    <TouchableOpacity
                        onPress={() => router.push('/search')}
                        hitSlop={8}
                    >
                        <SearchIcon width={22} height={22} color={colors.icon} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/notification')}
                        hitSlop={8}
                    >
                        <NotificationIcon width={25} height={25} color={colors.icon} />
                        {false && <View style={{
                            position: 'absolute',
                            top: -4,
                            right: -2,
                            width: 20,
                            height: 20,
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'row',
                            backgroundColor: colors.error,
                            borderRadius: 100,

                        }}>
                            <Typography variant="caption" weight="bold" color={'#fff'} style={{ letterSpacing: -1, }}>9+</Typography>
                        </View>}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/(app)/(account)/profile-settings')}
                        hitSlop={8}
                    >
                        <Avatar
                            initials="FS"
                            size="sm"
                        />
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {/* Category Horizontal List */}
            <Animated.View
                style={[
                    styles.categoryListWrapper,
                    {
                        top: insets.top + 52,
                        transform: [{ translateY: headerTranslateY }],
                    },
                ]}
            >
                <Animated.View
                    style={[
                        styles.categoryListContainer,
                        {
                            backgroundColor: colors.surface + 'F0',
                            borderTopColor: colors.border,
                            borderBottomColor: colors.border,
                            maxHeight: categoryListHeight,
                            opacity: categoryListHeight.interpolate({
                                inputRange: [0, 60],
                                outputRange: [0, 1],
                            }),
                        },
                    ]}
                    pointerEvents={categoryDropdownVisible ? 'auto' : 'none'}
                >
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoryScrollContent}
                    >
                        {CATEGORIES.map((category) => {
                            const isSelected = selectedCategory === category.id;
                            return (
                                <Pressable
                                    key={category.id}
                                    onPress={() => {
                                        setSelectedCategory(category.id);
                                        closeCategoryDropdown();
                                    }}
                                    style={[
                                        styles.categoryChipHorizontal,
                                        {
                                            backgroundColor: isSelected
                                                ? colors.primary + '25'
                                                : colors.background,
                                            borderColor: isSelected
                                                ? colors.primary
                                                : colors.border,
                                        },
                                    ]}
                                >
                                    <IconSymbol
                                        name={category.icon as any}
                                        size={16}
                                        color={isSelected ? colors.primary : colors.textSecondary}
                                    />
                                    <Typography
                                        variant="caption"
                                        weight={isSelected ? 'semiBold' : 'regular'}
                                        color={isSelected ? colors.primary : colors.text}
                                    >
                                        {category.name}
                                    </Typography>
                                    {isSelected && (
                                        <IconSymbol
                                            name="checkmark.circle.fill"
                                            size={16}
                                            color={colors.primary}
                                        />
                                    )}
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </Animated.View>
            </Animated.View>

            {/* Content */}
            <Animated.FlatList
                ref={flatListRef}
                data={posts}
                keyExtractor={(item) => item.id}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.content,
                    { paddingTop: insets.top + 60 + Spacing.md },
                ]}
                renderItem={({ item }) => (
                    <PostCard post={item} />
                )}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <IconSymbol name="photo.on.rectangle" size={48} color={colors.textTertiary} />
                        <Typography variant="body" color={colors.textSecondary} style={{ marginTop: Spacing.sm }}>
                            No posts in this category yet
                        </Typography>
                    </View>
                }
            />

            {/* New Posts Indicator */}
            {showNewPosts && (
                <View style={[styles.newPostsContainer, { top: insets.top + 70 }]}>
                    <NewPostsIndicator 
                        newPosts={MOCK_NEW_POSTS}
                        onPress={handleLoadNewPosts}
                    />
                </View>
            )}


        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: Spacing['xl'],
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.md,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        flex: 1,
    },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    content: {
        paddingBottom: Spacing['3xl'],
    },
    categoryListWrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 999,
    },
    categoryListContainer: {
        overflow: 'hidden',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    categoryScrollContent: {
        paddingHorizontal: Spacing.md,
        gap: Spacing.sm,
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    categoryChipHorizontal: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
    },
    newPostsContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 998,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.xl * 2,
    },
});