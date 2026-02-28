import { BackButton, GlassButton, GlassCard, ScreenWrapper, Typography, showToast } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette } from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Keyboard,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ label, hint }: { label: string; hint?: string }) {
    const { colors } = useAppTheme();
    return (
        <View style={{ marginBottom: Spacing.sm, marginTop: Spacing.lg }}>
            <Typography
                variant="caption"
                weight="semiBold"
                color={colors.textSecondary}
                style={{ textTransform: 'uppercase', letterSpacing: 0.8 }}
            >
                {label}
            </Typography>
            {hint && (
                <Typography variant="caption" color={colors.textTertiary} style={{ marginTop: 2 }}>
                    {hint}
                </Typography>
            )}
        </View>
    );
}

// ─── Toggle Row ───────────────────────────────────────────────────────────────

function ToggleRow({
    icon,
    label,
    description,
    value,
    onValueChange,
    isFirst,
    isLast,
}: {
    icon: string;
    label: string;
    description?: string;
    value: boolean;
    onValueChange: (v: boolean) => void;
    isFirst?: boolean;
    isLast?: boolean;
}) {
    const { colors } = useAppTheme();
    return (
        <View
            style={[
                styles.toggleRow,
                !isFirst && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
                !isLast && { paddingBottom: Spacing.md },
                isFirst && { paddingTop: 0 },
            ]}
        >
            <View style={[styles.iconBubble, { backgroundColor: Palette.primary + '14' }]}>
                <IconSymbol size={18} name={icon as any} color={Palette.primary} />
            </View>
            <View style={{ flex: 1, paddingTop: !isFirst ? Spacing.md : 0 }}>
                <Typography variant="title">{label}</Typography>
                {description && (
                    <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                        {description}
                    </Typography>
                )}
            </View>
            <Switch
                style={{ marginTop: !isFirst ? Spacing.md : 0 }}
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: colors.border, true: colors.primary + '10' }}
                thumbColor={Platform.OS === 'android' ? (value ? Palette.primary : '#f4f3f4') : undefined}
            />
        </View>
    );
}

// ─── Radio Row ────────────────────────────────────────────────────────────────

function RadioRow({
    label,
    description,
    checked,
    onPress,
}: {
    label: string;
    description?: string;
    checked: boolean;
    onPress: () => void;
}) {
    const { colors } = useAppTheme();
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.75}
            style={[
                styles.radioRow,
                {
                    borderColor: checked ? Palette.primary : colors.border,
                    backgroundColor: checked ? Palette.primary + '0f' : colors.surface,
                },
            ]}
        >
            <View style={{ flex: 1 }}>
                <Typography variant="body" color={checked ? Palette.primary : colors.text} weight={checked ? 'semiBold' : 'regular'}>
                    {label}
                </Typography>
                {description && (
                    <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                        {description}
                    </Typography>
                )}
            </View>
            <View
                style={[
                    styles.radioCircle,
                    { borderColor: checked ? Palette.primary : colors.border },
                ]}
            >
                {checked && <View style={[styles.radioInner, { backgroundColor: Palette.primary }]} />}
            </View>
        </TouchableOpacity>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export const PortfolioSettings = () => {
    const router = useRouter();
    const { colors } = useAppTheme();

    const [isPublic, setIsPublic] = useState(true);
    const [acceptingOrders, setAcceptingOrders] = useState(true);
    const [showStartingPrice, setShowStartingPrice] = useState(true);
    const [defaultSort, setDefaultSort] = useState<'newest' | 'oldest' | 'popular'>('newest');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        // TODO: call API
        await new Promise((r) => setTimeout(r, 700));
        setSaving(false);
        showToast({ type: 'success', text1: 'Portfolio settings updated', text2: 'Your changes have been saved.' });
    };

    return (
        <ScreenWrapper
            padded
            keyboardAvoiding
            keyboardVerticalOffset={Platform.OS === 'android' ? 20 : 0}
            style={{ paddingTop: Spacing.md }}
        >
            {/* Header row */}
            <View style={styles.headerRow}>
                <BackButton onPress={() => router.back()} />
                <Typography variant="h3">Portfolio Settings</Typography>
                <View style={{ minWidth: 40 }} />
            </View>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                onScrollBeginDrag={Keyboard.dismiss}
            >
                {/* ── Visibility ── */}
                <SectionLabel label="Visibility" hint="Control who can discover your portfolio." />
                <GlassCard>
                    <ToggleRow
                        icon="eye.fill"
                        label="Public Portfolio"
                        description={isPublic ? 'Anyone can view your work and book you.' : 'Your portfolio is hidden from search and discovery.'}
                        value={isPublic}
                        onValueChange={setIsPublic}
                        isFirst
                        isLast
                    />
                </GlassCard>

                {/* ── Availability ── */}
                <SectionLabel label="Availability" hint="Let clients know if you're open for new work." />
                <GlassCard>
                    <ToggleRow
                        icon="briefcase"
                        label="Accepting Orders"
                        description={acceptingOrders ? 'Clients can send you requests.' : "You won't receive new order requests."}
                        value={acceptingOrders}
                        onValueChange={setAcceptingOrders}
                        isFirst
                        isLast
                    />
                </GlassCard>

                {/* ── Display ── */}
                <SectionLabel label="Display" hint="Configure what clients see on your profile." />
                <GlassCard>
                    <ToggleRow
                        icon="creditcard"
                        label="Show Starting Price"
                        description="Display your minimum price on each listing."
                        value={showStartingPrice}
                        onValueChange={setShowStartingPrice}
                        isFirst
                        isLast
                    />
                </GlassCard>

                {/* ── Default Sort ── */}
                <SectionLabel label="Default Sort Order" hint="How your work items appear by default to visitors." />
                <GlassCard style={{ gap: Spacing.sm }}>
                    <RadioRow
                        label="Newest First"
                        description="Show your most recent work at the top."
                        checked={defaultSort === 'newest'}
                        onPress={() => setDefaultSort('newest')}
                    />
                    <View style={{ height: Spacing.sm }} />
                    <RadioRow
                        label="Oldest First"
                        description="Show your earliest work at the top."
                        checked={defaultSort === 'oldest'}
                        onPress={() => setDefaultSort('oldest')}
                    />
                    <View style={{ height: Spacing.sm }} />
                    <RadioRow
                        label="Most Popular"
                        description="Show your highest-rated or most-liked work first."
                        checked={defaultSort === 'popular'}
                        onPress={() => setDefaultSort('popular')}
                    />
                </GlassCard>

                {/* ── Info card ── */}
                <View style={[styles.infoBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <IconSymbol size={16} name={'lightbulb' as any} color={Palette.primary} />
                    <Typography variant="caption" color={colors.textSecondary} style={{ flex: 1, marginLeft: Spacing.sm }}>
                        Keep your portfolio public and accepting orders to maximise visibility and client bookings.
                    </Typography>
                </View>
            </ScrollView>

            {/* ── Sticky save ── */}
            <View style={[styles.stickyBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                <GlassButton
                    variant="primary"
                    label="Save Changes"
                    fullWidth
                    loading={saving}
                    onPress={handleSave}
                />
            </View>
        </ScreenWrapper>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.sm,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.md,
    },
    iconBubble: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginTop: 2,
    },
    radioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        gap: Spacing.md,
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        marginTop: Spacing.lg,
        gap: Spacing.xs,
    },
    stickyBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.md,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
});