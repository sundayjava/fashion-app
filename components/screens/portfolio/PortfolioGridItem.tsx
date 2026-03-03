import { Typography } from "@/components/ui";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useAppTheme } from "@/context/ThemeContext";
import { Image } from "expo-image";
import React from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get('window');
const GRID_SPACING = Spacing.xs;
const ITEM_WIDTH = (width - (GRID_SPACING * 3)) / 2;

export interface PortfolioItem {
    id: string;
    type: 'image' | 'video';
    uri: string;
    thumbnailUri?: string; // For videos
    title?: string;
    categoryId?: string;
    likes?: number;
    views?: number;
    duration?: string; // For videos, e.g., "2:34"
    createdAt: string;
}

interface PortfolioGridItemProps {
    item: PortfolioItem;
    onPress?: (item: PortfolioItem) => void;
}

export const PortfolioGridItem = React.memo<PortfolioGridItemProps>(({ item, onPress }) => {
    const { colors } = useAppTheme();

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => onPress?.(item)}
            activeOpacity={0.8}
        >
            <View style={[styles.imageContainer, { backgroundColor: colors.surface }]}>
                <Image
                    source={{ uri: item.type === 'video' ? item.thumbnailUri : item.uri }}
                    style={styles.image}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    recyclingKey={item.id}
                />

                {/* Video indicator */}
                {item.type === 'video' && (
                    <>
                        <View style={styles.videoOverlay}>
                            <View style={[styles.playIcon, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                                <IconSymbol name="play.fill" size={20} color="#fff" />
                            </View>
                        </View>
                        {item.duration && (
                            <View style={[styles.durationBadge, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                                <Typography variant="caption" size={11} weight="semiBold" color="#fff">
                                    {item.duration}
                                </Typography>
                            </View>
                        )}
                    </>
                )}

                {/* Likes overlay */}
                {item.likes !== undefined && item.likes > 0 && (
                    <View style={[styles.likesBadge, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                        <IconSymbol name="heart.fill" size={12} color="#fff" />
                        <Typography variant="caption" size={11} weight="medium" color="#fff">
                            {item.likes > 999 ? `${(item.likes / 1000).toFixed(1)}K` : item.likes}
                        </Typography>
                    </View>
                )}
            </View>

            {/* Title (optional) */}
            {item.title && (
                <Typography
                    variant="caption"
                    size={13}
                    numberOfLines={2}
                    color={colors.text}
                    style={{ marginTop: Spacing.xs, lineHeight: 16 }}
                >
                    {item.title}
                </Typography>
            )}
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    container: {
        width: ITEM_WIDTH,
        marginBottom: Spacing.md,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 3 / 4, // Portrait ratio for fashion
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    videoOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    playIcon: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    durationBadge: {
        position: 'absolute',
        bottom: Spacing.xs,
        right: Spacing.xs,
        paddingHorizontal: Spacing.xs,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
    },
    likesBadge: {
        position: 'absolute',
        top: Spacing.xs,
        right: Spacing.xs,
        paddingHorizontal: Spacing.xs,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
});

PortfolioGridItem.displayName = 'PortfolioGridItem';
