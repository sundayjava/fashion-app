import { LocationPin } from "@/assets/icons/LocationPin";
import { SearchIcon } from "@/assets/icons/SearchIcon";
import { ScreenWrapper, Typography } from "@/components/ui";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Palette } from "@/constants/colors";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useAppTheme } from "@/context/ThemeContext";
import { Image } from "expo-image";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PortfolioGridItem, type PortfolioItem } from "./PortfolioGridItem";
import { PortfolioListItem } from "./PortfolioListItem";

const { width } = Dimensions.get('window');
const COVER_HEIGHT = 140;
const LOGO_SIZE = 80;
const SCROLL_THRESHOLD = COVER_HEIGHT + 60;
const TAB_BAR_HEIGHT = 50;

type TabType = 'All' | 'Categories' | 'Videos';
type ViewMode = 'grid' | 'list';

interface Category {
    id: string;
    name: string;
    createdAt?: string;
}

// Mock categories - will be replaced with database query
const MOCK_CATEGORIES: Category[] = [
    { id: '1', name: 'Bridal' },
    { id: '2', name: 'Casual' },
    { id: '3', name: 'Streetwear' },
    { id: '4', name: 'Shoes' },
    { id: '5', name: 'Traditional' },
    { id: '6', name: 'Corporate' },
];

// Mock portfolio items - will be replaced with database query
const MOCK_PORTFOLIO_ITEMS: PortfolioItem[] = [
    {
        id: '1',
        type: 'image',
        uri: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
        title: 'Elegant Evening Gown',
        categoryId: '1',
        likes: 234,
        views: 1520,
        createdAt: '2024-02-28',
    },
    {
        id: '2',
        type: 'video',
        uri: 'https://example.com/video1.mp4',
        thumbnailUri: 'https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=400',
        title: 'Bridal Collection Showcase',
        categoryId: '1',
        duration: '2:34',
        likes: 589,
        views: 3240,
        createdAt: '2024-02-27',
    },
    {
        id: '3',
        type: 'image',
        uri: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400',
        title: 'Summer Casual Look',
        categoryId: '2',
        likes: 156,
        views: 890,
        createdAt: '2024-02-26',
    },
    {
        id: '4',
        type: 'image',
        uri: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400',
        title: 'Street Style Fashion',
        categoryId: '3',
        likes: 423,
        views: 2100,
        createdAt: '2024-02-25',
    },
    {
        id: '5',
        type: 'video',
        uri: 'https://example.com/video2.mp4',
        thumbnailUri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400',
        title: 'Shoe Collection Tour',
        categoryId: '4',
        duration: '1:45',
        likes: 312,
        views: 1890,
        createdAt: '2024-02-24',
    },
    {
        id: '6',
        type: 'image',
        uri: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400',
        title: 'Traditional Ankara Design',
        categoryId: '5',
        likes: 678,
        views: 3450,
        createdAt: '2024-02-23',
    },
    {
        id: '7',
        type: 'image',
        uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        title: 'Corporate Suit Collection',
        categoryId: '6',
        likes: 201,
        views: 1120,
        createdAt: '2024-02-22',
    },
    {
        id: '8',
        type: 'video',
        uri: 'https://example.com/video3.mp4',
        thumbnailUri: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400',
        title: 'Behind the Scenes',
        categoryId: '2',
        duration: '3:12',
        likes: 445,
        views: 2670,
        createdAt: '2024-02-21',
    },
    {
        id: '9',
        type: 'image',
        uri: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400',
        title: 'Wedding Dress Details',
        categoryId: '1',
        likes: 890,
        views: 4250,
        createdAt: '2024-02-20',
    },
    {
        id: '10',
        type: 'image',
        uri: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400',
        title: 'Urban Streetwear',
        categoryId: '3',
        likes: 334,
        views: 1780,
        createdAt: '2024-02-19',
    },
];

export const UserPortfolio = () => {
    const { colors } = useAppTheme();
    const insets = useSafeAreaInsets();
    const scrollY = useRef(new Animated.Value(0)).current;

    // Filter and view states
    const [activeTab, setActiveTab] = useState<TabType>('All');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [refreshing, setRefreshing] = useState(false);

    // TODO: Replace with actual database query
    const categories = MOCK_CATEGORIES;
    const portfolioItems = MOCK_PORTFOLIO_ITEMS;

    // Mock profile data
    const userName = "@JaneDoe";
    const businessName = "Elegance Fashion House";
    const logoUri = null;
    const coverUri = null;
    const address = "123 Fashion Street, Lagos";
    const serviceArea = "Lagos, Abuja, PH";
    const productionTime = "2-4 weeks";
    const specializations = useMemo(() => ["Wedding Dresses", "Corporate Wear", "Traditional Attire"], []);
    const links = useMemo(() => [
        { label: "Instagram", url: "https://instagram.com" },
        { label: "WhatsApp", url: "https://wa.me" },
        { label: "Website", url: "https://example.com" },
    ], []);

    // Memoized filtered items
    const filteredItems = useMemo(() => {
        return portfolioItems.filter(item => {
            if (activeTab === 'Videos' && item.type !== 'video') return false;
            if (activeTab === 'Categories' && item.type === 'video') return false;
            if (activeTab === 'Categories' && selectedCategory && item.categoryId !== selectedCategory) {
                return false;
            }
            return true;
        });
    }, [portfolioItems, activeTab, selectedCategory]);

    // Memoized callbacks
    const handleItemPress = useCallback((item: PortfolioItem) => {
        console.log('Item pressed:', item);
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    }, []);

    const keyExtractor = useCallback((item: PortfolioItem) => item.id, []);

    // Optimized render functions
    const renderItem = useCallback(
        ({ item }: { item: PortfolioItem }) => {
            if (viewMode === 'grid') {
                return (
                    <View >
                        <PortfolioGridItem item={item} onPress={handleItemPress} />
                    </View>
                );
            }
            return <PortfolioListItem item={item} onPress={handleItemPress} />;
        },
        [viewMode, handleItemPress]
    );

    // Animated styles using regular React Native Animated API (like HomeComponent)
    const animatedHeaderOpacity = scrollY.interpolate({
        inputRange: [SCROLL_THRESHOLD - 50, SCROLL_THRESHOLD],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const animatedHeaderTranslateY = scrollY.interpolate({
        inputRange: [SCROLL_THRESHOLD - 50, SCROLL_THRESHOLD],
        outputRange: [-20, 0],
        extrapolate: 'clamp',
    });

    const floatingButtonsOpacity = scrollY.interpolate({
        inputRange: [0, 30],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const stickyTabBarOpacity = scrollY.interpolate({
        inputRange: [SCROLL_THRESHOLD + 197 - 20, SCROLL_THRESHOLD + 197],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const floatingStickyTabOpacity = scrollY.interpolate({
        inputRange: [SCROLL_THRESHOLD + 197 - 20, SCROLL_THRESHOLD + 197],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const floatingStickyTabTranslateY = scrollY.interpolate({
        inputRange: [SCROLL_THRESHOLD + 197 - 20, SCROLL_THRESHOLD + 197],
        outputRange: [-20, 0],
        extrapolate: 'clamp',
    });

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
    );

    // List header component (memoized)
    const ListHeaderComponent = useCallback(() => (
        <>
            {/* Cover Photo */}
            <View style={styles.coverContainer}>
                {coverUri ? (
                    <Image
                        source={{ uri: coverUri }}
                        style={styles.coverImage}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        priority="high"
                    />
                ) : (
                    <View style={[styles.coverPlaceholder, { backgroundColor: Palette.primary + '14' }]}>
                        <IconSymbol size={40} name="photo" color={colors.textTertiary} />
                        <Typography variant="caption" color={colors.textTertiary} style={{ marginTop: Spacing.xs }}>
                            Add cover photo
                        </Typography>
                    </View>
                )}

                {/* Business Logo */}
                <View style={styles.logoContainer}>
                    <View style={[styles.logoWrapper, { backgroundColor: colors.background }]}>
                        {logoUri ? (
                            <Image
                                source={{ uri: logoUri }}
                                style={styles.logo}
                                contentFit="cover"
                                cachePolicy="memory-disk"
                                priority="high"
                            />
                        ) : (
                            <View style={[styles.logoPlaceholder, { backgroundColor: Palette.primary }]}>
                                <Typography variant="h3" weight="bold" color="#fff">
                                    {businessName.charAt(0)}
                                </Typography>
                            </View>
                        )}
                    </View>
                </View>

                {/* Floating Action Buttons */}
                <Animated.View style={[
                    styles.floatingButtons,
                    { opacity: floatingButtonsOpacity }
                ]}>
                    <TouchableOpacity
                        style={[styles.floatingIconButton, { backgroundColor: colors.background }]}
                        activeOpacity={0.7}
                    >
                        <IconSymbol size={20} name="magnifyingglass" color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.floatingIconButton, { backgroundColor: colors.background }]}
                        activeOpacity={0.7}
                    >
                        <IconSymbol size={20} name="pencil.line" color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.floatingIconButton, { backgroundColor: colors.background }]}
                        activeOpacity={0.7}
                    >
                        <IconSymbol size={20} name="square.and.arrow.up" color={colors.text} />
                    </TouchableOpacity>
                </Animated.View>
            </View>

            {/* Profile Info Section */}
            <View style={[styles.infoSection, { paddingTop: LOGO_SIZE / 2 + Spacing.xs }]}>
                <View>
                    <Typography variant="h4" weight="bold" color={colors.text}>
                        {businessName}
                    </Typography>
                    <TouchableOpacity>
                        <Typography variant="body" color={colors.textSecondary} style={{ marginTop: -6, opacity: 0.7, textDecorationStyle: 'dotted', textDecorationColor: colors.primary, textDecorationLine: 'underline' }} numberOfLines={1}>
                            {userName}
                        </Typography>
                    </TouchableOpacity>
                </View>

                {/* Bio */}
                <Typography variant="caption" size={17} numberOfLines={3} color={colors.textSecondary} style={{ lineHeight: 19, marginTop: Spacing.sm }}>
                    Fashion designer specializing in bespoke garments and modern African wear. Creating unique pieces that celebrate culture and style.
                </Typography>

                {/* Info Pills */}
                <View style={styles.infoPills}>
                    {specializations.length > 0 && (
                        <View style={[styles.infoPill]}>
                            <IconSymbol size={20} name="briefcase" color={colors.textSecondary} style={{ opacity: 0.7 }} />
                            <Typography variant="caption" size={16} color={colors.textSecondary} numberOfLines={1} style={{ opacity: 0.7, letterSpacing: -0.2 }}>
                                {specializations[0]}
                            </Typography>
                        </View>
                    )}
                    {serviceArea && (
                        <View style={[styles.infoPill]}>
                            <LocationPin color={colors.textSecondary} style={{ opacity: 0.7 }} width={24} height={24} />
                            <Typography variant="caption" size={16} color={colors.textSecondary} numberOfLines={1} style={{ opacity: 0.7, letterSpacing: -0.2 }}>
                                {serviceArea}
                            </Typography>
                        </View>
                    )}
                    {address && (
                        <View style={[styles.infoPill]}>
                            <IconSymbol size={20} name="house.fill" color={colors.textSecondary} style={{ opacity: 0.7 }} />
                            <Typography variant="caption" size={16} color={colors.textSecondary} numberOfLines={1} style={{ opacity: 0.7, letterSpacing: -0.2 }}>
                                {address}
                            </Typography>
                        </View>
                    )}
                    {productionTime && (
                        <View style={[styles.infoPill]}>
                            <IconSymbol size={20} name="calendar" color={colors.textSecondary} style={{ opacity: 0.7 }} />
                            <Typography variant="caption" size={16} color={colors.textSecondary} numberOfLines={1} style={{ opacity: 0.7, letterSpacing: -0.2 }}>
                                {productionTime}
                            </Typography>
                        </View>
                    )}
                    {links.slice(0, 2).map((link, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.infoPill]}
                            activeOpacity={0.7}
                        >
                            <IconSymbol size={18} name="link" color={colors.textSecondary} style={{ opacity: 0.7 }} />
                            <Typography variant="caption" weight="medium" color={colors.textSecondary} size={16} numberOfLines={1} style={{ opacity: 0.7, letterSpacing: -0.2, textDecorationStyle: 'double', textDecorationColor: colors.primary, textDecorationLine: 'underline' }}>
                                {link.label}
                            </Typography>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Stats */}
                <View style={[styles.statsRow, {
                    borderBottomColor: colors.border,
                    borderTopColor: colors.border,
                }]}>
                    <View style={styles.statItem}>
                        <Typography variant="h4" weight="bold" color={colors.text}>
                            2.4K
                        </Typography>
                        <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: -5, opacity: 0.7 }}>
                            Followers
                        </Typography>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.statItem}>
                        <Typography variant="h4" weight="bold" color={colors.text}>
                            127
                        </Typography>
                        <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: -5, opacity: 0.7 }}>
                            Post
                        </Typography>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.statItem}>
                        <Typography variant="h4" weight="bold" color={colors.text}>
                            89
                        </Typography>
                        <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: -5, opacity: 0.7 }}>
                            Reviews
                        </Typography>
                    </View>
                </View>
            </View>

            {/* Tab Bar in Header */}
            <Animated.View style={{ opacity: stickyTabBarOpacity }}>
                <View style={[styles.tabBar, {
                    backgroundColor: colors.background,
                    borderBottomColor: colors.border,
                }]}>
                    <View style={styles.tabsContainer}>
                        {(['All', 'Categories', 'Videos'] as TabType[]).map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                style={[
                                    styles.tab,
                                    activeTab === tab && styles.activeTab,
                                ]}
                                onPress={() => {
                                    setActiveTab(tab);
                                    if (tab !== 'Categories') {
                                        setSelectedCategory(null);
                                    }
                                }}
                                activeOpacity={0.7}
                            >
                                <Typography
                                    variant="caption"
                                    size={15}
                                    weight={activeTab === tab ? 'semiBold' : 'regular'}
                                    color={activeTab === tab ? colors.primary : colors.textSecondary}
                                >
                                    {tab}
                                </Typography>
                                {activeTab === tab && (
                                    <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity
                        style={styles.viewModeButton}
                        onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                        activeOpacity={0.7}
                    >
                        <IconSymbol
                            size={22}
                            name={viewMode === 'grid' ? 'square.grid.2x2' : 'list.bullet'}
                            color={colors.text}
                        />
                    </TouchableOpacity>
                </View>

                {/* Category Filters */}
                {activeTab === 'Categories' && (
                    <View style={[styles.categoryFilters, {
                        backgroundColor: colors.background,
                        borderBottomColor: colors.border,
                    }]}>
                        <FlatList
                            horizontal
                            data={categories}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item: category }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.categoryChip,
                                        {
                                            backgroundColor: selectedCategory === category.id
                                                ? colors.primary + '14'
                                                : colors.surface,
                                            borderColor: selectedCategory === category.id
                                                ? colors.primary
                                                : colors.border,
                                        },
                                    ]}
                                    onPress={() => setSelectedCategory(
                                        selectedCategory === category.id ? null : category.id
                                    )}
                                    activeOpacity={0.7}
                                >
                                    <Typography
                                        variant="caption"
                                        weight={selectedCategory === category.id ? 'semiBold' : 'regular'}
                                        color={selectedCategory === category.id ? colors.primary : colors.text}
                                    >
                                        {category.name}
                                    </Typography>
                                </TouchableOpacity>
                            )}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.categoryScrollContent}
                        />
                    </View>
                )}
            </Animated.View>
        </>
    ), [
        coverUri, logoUri, businessName, userName, address, serviceArea, productionTime,
        specializations, links, colors, activeTab, selectedCategory, viewMode, categories,
        floatingButtonsOpacity, stickyTabBarOpacity
    ]);

    // List empty component
    const ListEmptyComponent = useCallback(() => (
        <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <IconSymbol
                name={activeTab === 'Videos' ? 'video.slash' : 'photo.on.rectangle'}
                size={48}
                color={colors.textTertiary}
            />
            <Typography
                variant="body"
                weight="medium"
                color={colors.textSecondary}
                style={{ marginTop: Spacing.sm }}
            >
                No items to display
            </Typography>
            <Typography
                variant="caption"
                color={colors.textTertiary}
                style={{ marginTop: Spacing.xs, textAlign: 'center' }}
            >
                {activeTab === 'Categories' && selectedCategory
                    ? 'No items in this category yet'
                    : activeTab === 'Videos'
                        ? 'No videos uploaded yet'
                        : 'Start adding items to your portfolio'}
            </Typography>
        </View>
    ), [colors, activeTab, selectedCategory]);

    return (
        <ScreenWrapper padded={false}>
            {/* Animated Top Bar */}
            <Animated.View
                style={[
                    styles.animatedHeader,
                    {
                        backgroundColor: colors.background,
                        borderBottomColor: colors.border,
                        paddingTop: insets.top,
                        opacity: animatedHeaderOpacity,
                        transform: [{ translateY: animatedHeaderTranslateY }],
                    },
                ]}
                pointerEvents="box-none"
            >
                <View style={styles.animatedHeaderContent}>
                    <View style={{ flex: 1 }}>
                        <Typography variant="caption" color={colors.textSecondary} numberOfLines={1}>
                            {businessName}
                        </Typography>
                        <Typography variant="body" weight="semiBold" color={colors.text} numberOfLines={1}>
                            {userName}
                        </Typography>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            activeOpacity={0.7}
                            hitSlop={8}
                        >
                            <SearchIcon width={22} height={22} color={colors.icon} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.iconButton}
                            activeOpacity={0.7}
                            hitSlop={8}
                        >
                            <IconSymbol size={20} name="pencil.line" color={colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.iconButton}
                            activeOpacity={0.7}
                            hitSlop={8}
                        >
                            <IconSymbol size={20} name="square.and.arrow.up.fill" color={colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>

            {/* Floating Sticky Tab Bar (appears when scrolling) */}
            <Animated.View
                style={[
                    styles.floatingStickyTab,
                    {
                        backgroundColor: colors.background,
                        borderBottomColor: colors.border,
                        top: insets.top + 60,
                        opacity: floatingStickyTabOpacity,
                        transform: [{ translateY: floatingStickyTabTranslateY }],
                    },
                ]}
                pointerEvents="box-none"
            >
                <View style={[styles.tabBar, {
                    backgroundColor: colors.background,
                    borderBottomColor: colors.border,
                }]} pointerEvents="auto">
                    <View style={styles.tabsContainer}>
                        {(['All', 'Categories', 'Videos'] as TabType[]).map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                style={[
                                    styles.tab,
                                    activeTab === tab && styles.activeTab,
                                ]}
                                onPress={() => {
                                    setActiveTab(tab);
                                    if (tab !== 'Categories') {
                                        setSelectedCategory(null);
                                    }
                                }}
                                activeOpacity={0.7}
                            >
                                <Typography
                                    variant="caption"
                                    size={15}
                                    weight={activeTab === tab ? 'semiBold' : 'regular'}
                                    color={activeTab === tab ? colors.primary : colors.textSecondary}
                                >
                                    {tab}
                                </Typography>
                                {activeTab === tab && (
                                    <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity
                        style={styles.viewModeButton}
                        onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                        activeOpacity={0.7}
                    >
                        <IconSymbol
                            size={22}
                            name={viewMode === 'grid' ? 'square.grid.2x2' : 'list.bullet'}
                            color={colors.text}
                        />
                    </TouchableOpacity>
                </View>

                {/* Category Filters */}
                {activeTab === 'Categories' && (
                    <View style={[styles.categoryFilters, {
                        backgroundColor: colors.background,
                        borderBottomColor: colors.border,
                    }]} pointerEvents="auto">
                        <FlatList
                            horizontal
                            data={categories}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item: category }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.categoryChip,
                                        {
                                            backgroundColor: selectedCategory === category.id
                                                ? colors.primary + '14'
                                                : colors.surface,
                                            borderColor: selectedCategory === category.id
                                                ? colors.primary
                                                : colors.border,
                                        },
                                    ]}
                                    onPress={() => setSelectedCategory(
                                        selectedCategory === category.id ? null : category.id
                                    )}
                                    activeOpacity={0.7}
                                >
                                    <Typography
                                        variant="caption"
                                        weight={selectedCategory === category.id ? 'semiBold' : 'regular'}
                                        color={selectedCategory === category.id ? colors.primary : colors.text}
                                    >
                                        {category.name}
                                    </Typography>
                                </TouchableOpacity>
                            )}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.categoryScrollContent}
                        />
                    </View>
                )}
            </Animated.View>

            {/* Optimized FlatList */}
            <Animated.FlatList
                data={filteredItems}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                key={viewMode} // Force re-render when view mode changes
                numColumns={viewMode === 'grid' ? 2 : 1}
                ListHeaderComponent={ListHeaderComponent}
                ListEmptyComponent={ListEmptyComponent}
                contentContainerStyle={styles.flatListContent}
                columnWrapperStyle={viewMode === 'grid' ? styles.columnWrapper : undefined}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                removeClippedSubviews={Platform.OS === 'android'}
                maxToRenderPerBatch={10}
                initialNumToRender={10}
                windowSize={11}
                updateCellsBatchingPeriod={50}
                getItemLayout={viewMode === 'list' ? (_, index) => ({
                    length: 136, // 120 + 16 padding
                    offset: 136 * index,
                    index,
                }) : undefined}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    animatedHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        borderBottomWidth: 1,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    animatedHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    coverContainer: {
        position: 'relative',
        width: width,
        height: COVER_HEIGHT,
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    coverPlaceholder: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        position: 'absolute',
        bottom: -LOGO_SIZE / 2,
        left: Spacing.lg,
    },
    logoWrapper: {
        width: LOGO_SIZE + 6,
        height: LOGO_SIZE + 6,
        borderRadius: (LOGO_SIZE + 6) / 2,
        padding: 3,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    logo: {
        width: LOGO_SIZE,
        height: LOGO_SIZE,
        borderRadius: LOGO_SIZE / 2,
    },
    logoPlaceholder: {
        width: LOGO_SIZE,
        height: LOGO_SIZE,
        borderRadius: LOGO_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoSection: {
        paddingHorizontal: Spacing.sm + 2,
    },
    infoPills: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: Spacing.xs,
    },
    infoPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        paddingRight: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
    },
    floatingButtons: {
        position: 'absolute',
        top: Spacing.md,
        right: Spacing.md,
        flexDirection: 'row',
        gap: Spacing.xs,
    },
    floatingIconButton: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderTopWidth: 1,
        borderBottomWidth: 1,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statDivider: {
        width: 1,
        height: 32,
    },
    floatingStickyTab: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 98,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    tabBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        borderBottomWidth: 1,
        height: TAB_BAR_HEIGHT,
    },
    tabsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: Spacing.md,
    },
    tab: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.xs,
        position: 'relative',
    },
    activeTab: {
        // Active styling handled by indicator and text color
    },
    activeIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        borderRadius: 2,
    },
    viewModeButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BorderRadius.md,
    },
    categoryFilters: {
        borderBottomWidth: 1,
        paddingVertical: Spacing.xs,
    },
    categoryScrollContent: {
        paddingHorizontal: Spacing.md,
        gap: Spacing.xs,
    },
    categoryChip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
    },
    flatListContent: {
        paddingBottom: Spacing.xl * 2,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.xs,
    },
    emptyState: {
        margin: Spacing.md,
        padding: Spacing.xl * 2,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
