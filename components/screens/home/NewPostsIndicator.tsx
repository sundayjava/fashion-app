import { Avatar, Typography } from '@/components/ui';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import React from 'react';
import {
    Platform,
    Pressable,
    StyleSheet,
    View
} from 'react-native';

interface NewPost {
    userId: string;
    userName: string;
    avatarUri?: string;
}

interface NewPostsIndicatorProps {
    newPosts: NewPost[];
    onPress: () => void;
}

export const NewPostsIndicator: React.FC<NewPostsIndicatorProps> = ({
    newPosts,
    onPress,
}) => {
    const { colors } = useAppTheme();

    if (newPosts.length === 0) return null;

    const displayPosts = newPosts.slice(0, 2);
    const remainingCount = newPosts.length - 2;

    return (
        <Pressable
            onPress={onPress}
            style={[
                styles.container,
                {
                    backgroundColor: colors.primary,
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
            ]}
        >
            {/* Avatars */}
            <View style={styles.avatarsContainer}>
                {displayPosts.map((post, index) => (
                    <View
                        key={post.userId}
                        style={[
                            styles.avatarWrapper,
                            {
                                marginLeft: index > 0 ? -10 : 0,
                                zIndex: displayPosts.length - index,
                            },
                        ]}
                    >
                        <Avatar
                            source={post.avatarUri ? { uri: post.avatarUri } : undefined}
                            initials={post.userName.charAt(0)}
                            size="xs"
                        />
                    </View>
                ))}
                {remainingCount > 0 && (
                    <View
                        style={[
                            styles.remainingBadge,
                            {
                                backgroundColor: colors.background,
                                marginLeft: -8,
                            },
                        ]}
                    >
                        <Typography variant="caption" weight="bold" color={colors.primary}>
                            +{remainingCount}
                        </Typography>
                    </View>
                )}
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
    },
    avatarsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarWrapper: {
        borderRadius: 100,
        overflow: 'hidden',
    },
    remainingBadge: {
        width: 24,
        height: 24,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 0,
    },
});
