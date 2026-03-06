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

export const HomeComponent = () => {
    const { colors } = useAppTheme();
    const insets = useSafeAreaInsets();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [categoryDropdownVisible, setCategoryDropdownVisible] = useState(false);
    const scrollY = useRef(new Animated.Value(0)).current;
    const lastScrollY = useRef(0);
    const headerTranslateY = useRef(new Animated.Value(0)).current;
    const categoryListHeight = useRef(new Animated.Value(0)).current;
    const isHeaderHidden = useRef(false);

    // Mock posts data
    const posts = Array.from({ length: 20 }, (_, i) => ({
        id: String(i + 1),
        title: `Post ${i + 1}`,
    }));

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

                if (diff > 10 && currentScrollY > 60 && !isHeaderHidden.current) {
                    // Scrolling down (content going up) - hide header
                    isHeaderHidden.current = true;
                    Animated.timing(headerTranslateY, {
                        toValue: -headerHeight,
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

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Animated Header */}
            <Animated.View
                style={[
                    styles.header,
                    {
                        backgroundColor: colors.surface + 'F0',
                        paddingTop: insets.top,
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
                    styles.categoryListContainer,
                    {
                        backgroundColor: colors.surface + 'F0',
                        borderTopColor: colors.border,
                        top: insets.top + 52,
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

            {/* Content */}
            <Animated.FlatList
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
                    <View
                        style={[
                            styles.postPlaceholder,
                            { backgroundColor: colors.surface },
                        ]}
                    >
                        <Typography variant="body" color={colors.text}>
                            {item.title}
                        </Typography>
                    </View>
                )}
            />


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
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xl,
    },
    postPlaceholder: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.md,
    },
    categoryListContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 999,
        overflow: 'hidden',
        borderTopWidth: 1,
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
});