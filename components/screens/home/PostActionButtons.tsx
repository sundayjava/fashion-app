import { BookmarkFillIcon } from '@/assets/icons/BookMarkFillIcon';
import { BookMarkIcon } from '@/assets/icons/BookMarkIcon';
import { CommentsIcon } from '@/assets/icons/CommentsIcon';
import { HeartFillIcon } from '@/assets/icons/HeartFillIcon';
import { HeartIcon } from '@/assets/icons/HeartIcon';
import { ShareIcon } from '@/assets/icons/ShareIcon';
import { Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface ActionButtonProps {
    onPress?: () => void;
    children: React.ReactNode;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ onPress, children }) => {
    return (
        <TouchableOpacity
            style={styles.actionButton}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {children}
        </TouchableOpacity>
    );
};

interface LikeButtonProps {
    isLiked: boolean;
    onPress: () => void;
    size?: number;
}

export const LikeButton: React.FC<LikeButtonProps> = ({ isLiked, onPress, size = 20 }) => {
    const { colors } = useAppTheme();
    
    return (
        <ActionButton onPress={onPress}>
            {isLiked ? (
                <HeartFillIcon color={colors.error} width={size} height={size} />
            ) : (
                <HeartIcon color={colors.icon} width={size} height={size} />
            )}
        </ActionButton>
    );
};

interface SaveButtonProps {
    isSaved: boolean;
    onPress: () => void;
    size?: number;
}

export const SaveButton: React.FC<SaveButtonProps> = ({ isSaved, onPress, size = 18 }) => {
    const { colors } = useAppTheme();
    
    return (
        <ActionButton onPress={onPress}>
            {isSaved ? (
                <BookmarkFillIcon color={colors.primary} width={size} height={size} />
            ) : (
                <BookMarkIcon color={colors.icon} width={size} height={size} />
            )}
        </ActionButton>
    );
};

interface CommentButtonProps {
    onPress: () => void;
    size?: number;
}

export const CommentButton: React.FC<CommentButtonProps> = ({ onPress, size = 26 }) => {
    const { colors } = useAppTheme();
    
    return (
        <ActionButton onPress={onPress}>
            <CommentsIcon color={colors.icon} width={size} height={size} />
        </ActionButton>
    );
};

interface ShareButtonProps {
    onPress: () => void;
    size?: number;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ onPress, size = 22 }) => {
    const { colors } = useAppTheme();
    
    return (
        <ActionButton onPress={onPress}>
            <ShareIcon color={colors.icon} width={size} height={size} />
        </ActionButton>
    );
};

interface ActionButtonsGroupProps {
    isLiked: boolean;
    isSaved: boolean;
    onLike: () => void;
    onComment: () => void;
    onShare: () => void;
    onSave: () => void;
    likeSize?: number;
    commentSize?: number;
    shareSize?: number;
    saveSize?: number;
    style?: any;
}

export const ActionButtonsGroup: React.FC<ActionButtonsGroupProps> = ({
    isLiked,
    isSaved,
    onLike,
    onComment,
    onShare,
    onSave,
    likeSize = 20,
    commentSize = 26,
    shareSize = 22,
    saveSize = 18,
    style,
}) => {
    return (
        <View style={[styles.actionsRow, style]}>
            <View style={styles.actionsLeft}>
                <LikeButton isLiked={isLiked} onPress={onLike} size={likeSize} />
                <CommentButton onPress={onComment} size={commentSize} />
                <ShareButton onPress={onShare} size={shareSize} />
            </View>
            <SaveButton isSaved={isSaved} onPress={onSave} size={saveSize} />
        </View>
    );
};

const styles = StyleSheet.create({
    actionButton: {
        padding: Spacing.xs,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    actionsLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
});
