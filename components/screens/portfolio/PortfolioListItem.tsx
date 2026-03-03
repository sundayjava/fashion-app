import { Typography } from "@/components/ui";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useAppTheme } from "@/context/ThemeContext";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import type { PortfolioItem } from "./PortfolioGridItem";

interface PortfolioListItemProps {
    item: PortfolioItem;
    onPress?: (item: PortfolioItem) => void;
}

export const PortfolioListItem = React.memo<PortfolioListItemProps>(({ item, onPress }) => {
    const { colors } = useAppTheme();

    return (
        <TouchableOpacity
            style={[styles.container, { borderBottomColor: colors.border }]}
            onPress={() => onPress?.(item)}
            activeOpacity={0.8}
        >
            {/* Thumbnail */}
            <View style={[styles.thumbnailContainer, { backgroundColor: colors.surface }]}>
                <Image
                    source={{ uri: item.type === 'video' ? item.thumbnailUri : item.uri }}
                    style={styles.thumbnail}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    recyclingKey={item.id}
                />

                {/* Video indicator */}
                {item.type === 'video' && (
                    <View style={styles.videoOverlay}>
                        <View style={[styles.playIcon, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                            <IconSymbol name="play.fill" size={16} color="#fff" />
                        </View>
                    </View>
                )}

                {/* Duration badge */}
                {item.type === 'video' && item.duration && (
                    <View style={[styles.durationBadge, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                        <Typography variant="caption" size={10} weight="semiBold" color="#fff">
                            {item.duration}
                        </Typography>
                    </View>
                )}
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.titleRow}>
                    <Typography
                        variant="body"
                        weight="medium"
                        numberOfLines={1}
                        color={colors.text}
                        style={{ flex: 1 }}
                    >
                        {item.title || 'Untitled'}
                    </Typography>
                    <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    {item.likes !== undefined && item.likes > 0 && (
                        <View style={styles.stat}>
                            <IconSymbol name="heart.fill" size={14} color={colors.textSecondary} />
                            <Typography variant="caption" size={13} color={colors.textSecondary}>
                                {item.likes > 999 ? `${(item.likes / 1000).toFixed(1)}K` : item.likes}
                            </Typography>
                        </View>
                    )}

                    {item.views !== undefined && item.views > 0 && (
                        <View style={styles.stat}>
                            <IconSymbol name="eye.fill" size={14} color={colors.textSecondary} />
                            <Typography variant="caption" size={13} color={colors.textSecondary}>
                                {item.views > 999 ? `${(item.views / 1000).toFixed(1)}K` : item.views}
                            </Typography>
                        </View>
                    )}

                    <View style={styles.stat}>
                        <IconSymbol 
                            name={item.type === 'video' ? 'video.fill' : 'photo.fill'} 
                            size={14} 
                            color={colors.textSecondary} 
                        />
                        <Typography variant="caption" size={13} color={colors.textSecondary}>
                            {item.type === 'video' ? 'Video' : 'Photo'}
                        </Typography>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        gap: Spacing.sm,
    },
    thumbnailContainer: {
        width: 100,
        height: 120,
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
        position: 'relative',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    videoOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    playIcon: {
        width: 32,
        height: 32,
        borderRadius: BorderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    durationBadge: {
        position: 'absolute',
        bottom: Spacing.xs - 2,
        right: Spacing.xs - 2,
        paddingHorizontal: Spacing.xs - 2,
        paddingVertical: 1,
        borderRadius: BorderRadius.sm,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: Spacing.xs - 2,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        flexWrap: 'wrap',
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
});
PortfolioListItem.displayName = 'PortfolioListItem';