/**
 * DropdownMenu — WhatsApp-style contextual popup menu.
 *
 * Usage:
 *   const triggerRef = useRef<View>(null);
 *   const [open, setOpen] = useState(false);
 *
 *   <View ref={triggerRef} collapsable={false}>
 *     <TouchableOpacity onPress={() => setOpen(true)}>
 *       <IconSymbol name="morevert" ... />
 *     </TouchableOpacity>
 *   </View>
 *
 *   <DropdownMenu
 *     visible={open}
 *     anchorRef={triggerRef}
 *     onClose={() => setOpen(false)}
 *     items={[
 *       { id: 'save', label: 'Save', icon: 'square.and.arrow.down' },
 *       { id: 'delete', label: 'Delete', icon: 'trash', destructive: true },
 *     ]}
 *     onSelect={(id) => { ... }}
 *   />
 */

import { Palette } from '@/constants/colors';
import { BorderRadius, Shadow, Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    Pressable,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { IconSymbol } from './icon-symbol';
import { Typography } from './Typography';

const { width: SW, height: SH } = Dimensions.get('window');
const MENU_WIDTH = 210;
const ITEM_HEIGHT = 48;
const MARGIN = 8; // gap from screen edge

export interface DropdownMenuItem {
    id: string;
    label: string;
    /** SF Symbol / mapped Material icon name */
    icon?: string;
    destructive?: boolean;
    disabled?: boolean;
}

interface DropdownMenuProps {
    visible: boolean;
    /** Ref of the element the menu should anchor to */
    anchorRef: React.RefObject<View | null>;
    onClose: () => void;
    items: DropdownMenuItem[];
    onSelect: (id: string) => void;
    style?: ViewStyle;
}

interface AnchorMeasure {
    x: number;
    y: number;
    width: number;
    height: number;
    pageX: number;
    pageY: number;
}

export function DropdownMenu({
    visible,
    anchorRef,
    onClose,
    items,
    onSelect,
    style,
}: DropdownMenuProps) {
    const { colors } = useAppTheme();
    const [anchor, setAnchor] = useState<AnchorMeasure | null>(null);
    const anim = useRef(new Animated.Value(0)).current;

    // Measure anchor position when opening
    useEffect(() => {
        if (visible && anchorRef.current) {
            anchorRef.current.measure((x, y, width, height, pageX, pageY) => {
                setAnchor({ x, y, width, height, pageX, pageY });
            });
        }
    }, [visible]);

    // Animate in/out
    useEffect(() => {
        Animated.timing(anim, {
            toValue: visible ? 1 : 0,
            duration: 150,
            useNativeDriver: true,
        }).start();
    }, [visible]);

    if (!visible && !anchor) return null;

    // Compute menu position
    const menuHeight = items.length * ITEM_HEIGHT + Spacing.xs * 2;
    let top = (anchor?.pageY ?? 0) + (anchor?.height ?? 0) + 4;
    let right = SW - (anchor?.pageX ?? SW) - (anchor?.width ?? 0);

    // Flip up if too close to bottom
    if (top + menuHeight > SH - MARGIN) {
        top = (anchor?.pageY ?? 0) - menuHeight - 4;
    }
    // Clamp to right edge
    right = Math.max(MARGIN, Math.min(right, SW - MENU_WIDTH - MARGIN));

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            {/* Dismiss backdrop */}
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

            <Animated.View
                style={[
                    styles.menu,
                    Shadow.lg,
                    {
                        top,
                        right,
                        backgroundColor: colors.surfaceElevated,
                        borderColor: colors.border,
                        opacity: anim,
                        transform: [
                            {
                                scaleY: anim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.85, 1],
                                }),
                            },
                        ],
                    },
                    style,
                ]}
            >
                {items.map((item, i) => (
                    <TouchableOpacity
                        key={item.id}
                        onPress={() => {
                            if (item.disabled) return;
                            onSelect(item.id);
                            onClose();
                        }}
                        activeOpacity={0.7}
                        disabled={item.disabled}
                        style={[
                            styles.item,
                            i < items.length - 1 && {
                                borderBottomWidth: StyleSheet.hairlineWidth,
                                borderBottomColor: colors.border,
                            },
                        ]}
                    >
                        {item.icon && (
                            <IconSymbol
                                size={18}
                                name={item.icon as any}
                                color={
                                    item.disabled
                                        ? colors.textTertiary
                                        : item.destructive
                                        ? Palette.error
                                        : colors.text
                                }
                            />
                        )}
                        <Typography
                            variant="body"
                            color={
                                item.disabled
                                    ? colors.textTertiary
                                    : item.destructive
                                    ? Palette.error
                                    : colors.text
                            }
                            style={{ flex: 1 }}
                        >
                            {item.label}
                        </Typography>
                    </TouchableOpacity>
                ))}
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    menu: {
        position: 'absolute',
        width: MENU_WIDTH,
        borderRadius: BorderRadius.md,
        borderWidth: StyleSheet.hairlineWidth,
        overflow: 'hidden',
        paddingVertical: Spacing.xs,
        transformOrigin: 'top right',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        height: ITEM_HEIGHT,
        paddingHorizontal: Spacing.md,
        gap: Spacing.md,
    },
});
