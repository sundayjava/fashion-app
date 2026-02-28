import { AppModal, BackButton, GlassButton, GlassCard, ScreenWrapper, Typography, showToast } from '@/components/ui';
import { AppInput } from '@/components/ui/Input';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette } from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import { SPECIALIZATIONS } from '@/data/otherdata';
import { yupResolver } from '@hookform/resolvers/yup';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    Keyboard,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import * as yup from 'yup';

// ─── Constants ────────────────────────────────────────────────────────────────

const BIO_MAX = 200;
const USERNAME_MAX = 30;

// ─── Validation ───────────────────────────────────────────────────────────────

const schema = yup.object({
    firstName: yup.string().trim().required('First name is required').min(2, 'Too short').max(50, 'Too long'),
    lastName: yup.string().trim().required('Last name is required').min(2, 'Too short').max(50, 'Too long'),
    username: yup
        .string()
        .trim()
        .required('Username is required')
        .min(3, 'At least 3 characters')
        .max(USERNAME_MAX, `Max ${USERNAME_MAX} characters`)
        .matches(/^[a-zA-Z0-9_.-]+$/, 'Letters, numbers, underscores, dots, hyphens only'),
    bio: yup.string().trim().max(BIO_MAX, `Max ${BIO_MAX} characters`).optional(),
    city: yup.string().trim().optional(),
    country: yup.string().trim().optional(),
    website: yup
        .string()
        .trim()
        .optional()
        .test('url', 'Enter a valid URL', (v) => !v || /^https?:\/\/.+/.test(v) || !v.includes('.')),
    otherLink: yup.string().trim().optional(),
    socialLink: yup.string().trim().optional(),
});

type ProfileForm = yup.InferType<typeof schema>;

// ─── Small helper: section header ────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
    const { colors } = useAppTheme();
    return (
        <Typography
            variant="caption"
            weight="semiBold"
            color={colors.textSecondary}
            style={{ textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm, marginTop: Spacing.lg }}
        >
            {label}
        </Typography>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ProfileSettings = () => {
    const router = useRouter();
    const { colors, isDark } = useAppTheme();

    const [coverUri, setCoverUri] = useState<string | null>(null);
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [specializations, setSpecializations] = useState<string[]>([]);
    const [specializationOpen, setSpecializationOpen] = useState(false);
    const [customSpec, setCustomSpec] = useState('');

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<ProfileForm>({
        resolver: yupResolver(schema) as any,
        defaultValues: {
            firstName: '',
            lastName: '',
            username: '',
            bio: '',
            city: '',
            country: '',
            website: '',
            otherLink: '',
            socialLink: '',
        },
        mode: 'onChange',
    });

    const bio = watch('bio') ?? '';

    // ── Image picker ─────────────────────────────────────────────────────────
    const pickImage = async (type: 'cover' | 'avatar') => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            showToast({ type: 'error', text1: 'Permission denied', text2: 'Allow photo access in Settings.' });
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: type === 'cover' ? [16, 9] : [1, 1],
            quality: 0.85,
        });
        if (!result.canceled && result.assets[0]) {
            if (type === 'cover') setCoverUri(result.assets[0].uri);
            else setAvatarUri(result.assets[0].uri);
        }
    };

    // ── Specialization helpers ────────────────────────────────────────────────
    const toggleSpec = (s: string) => {
        setSpecializations((prev) =>
            prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
        );
    };
    const addCustomSpec = () => {
        const trimmed = customSpec.trim();
        if (trimmed && !specializations.includes(trimmed)) {
            setSpecializations((prev) => [...prev, trimmed]);
        }
        setCustomSpec('');
    };
    const removeSpec = (s: string) => setSpecializations((prev) => prev.filter((x) => x !== s));

    // ── Submit ────────────────────────────────────────────────────────────────
    const onSubmit = async (data: ProfileForm) => {
        // TODO: call API with data + coverUri + avatarUri + specializations
        await new Promise((r) => setTimeout(r, 800));
        showToast({ type: 'success', text1: 'Profile updated', text2: 'Your changes have been saved.' });
    };

    return (
        <ScreenWrapper
            padded={false}
            keyboardAvoiding
            keyboardVerticalOffset={Platform.OS === 'android' ? 20 : 0}
        >
            {/* ── Cover photo + Avatar hero ── */}
            <View style={styles.heroSection}>
                {/* Cover */}
                <TouchableOpacity onPress={() => pickImage('cover')} activeOpacity={0.85} style={styles.coverTap}>
                    {coverUri ? (
                        <Image source={{ uri: coverUri }} style={styles.cover} contentFit="cover" />
                    ) : (
                        <View style={[styles.cover, styles.coverPlaceholder, { backgroundColor: colors.primaryLight + '20' }]}>
                            <IconSymbol size={28} name={'photo' as any} color={colors.textTertiary} />
                            <Typography variant="caption" color={colors.textTertiary} style={{ marginTop: 4 }}>
                                Tap to add cover
                            </Typography>
                        </View>
                    )}
                    {/* Edit overlay */}
                    <View style={[styles.coverEditBadge, { backgroundColor: colors.surface }]}>
                        <IconSymbol size={14} name={'pencil.line' as any} color={colors.text} />
                        <Typography variant="caption" style={{ color: colors.text, marginLeft: 4 }}>Edit Cover</Typography>
                    </View>
                </TouchableOpacity>

                {/* Floating title row */}
                <View style={styles.floatingTitleRow}>
                    <BackButton onPress={() => router.back()} />
                    <View style={{ minWidth: 40 }} />
                </View>

                {/* Avatar */}
                <View style={styles.avatarWrapper}>
                    <TouchableOpacity onPress={() => pickImage('avatar')} activeOpacity={0.85} style={styles.avatarTap}>
                        {avatarUri ? (
                            <Image source={{ uri: avatarUri }} style={styles.avatar} contentFit="cover" />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: Palette.primary + '22' }]}>
                                <Typography style={{ fontSize: 28, color: Palette.primary, fontWeight: '700' }}>FI</Typography>
                            </View>
                        )}
                        <View style={styles.avatarEditBadge}>
                            <IconSymbol size={12} name={'pencil.line' as any} color="#fff" />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ── Form body ── */}
            <ScrollView
                contentContainerStyle={[styles.formBody, { paddingBottom: 120 }]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                onScrollBeginDrag={Keyboard.dismiss}
            >
                {/* ── Personal info ── */}
                <SectionLabel label="Personal Info" />
                <GlassCard style={{ gap: Spacing.md }}>
                    {/* Row: first + last */}
                    <View style={styles.rowTwo}>
                        <View style={{ flex: 1 }}>
                            <Controller
                                control={control}
                                name="firstName"
                                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                                    <AppInput
                                        label="First Name"
                                        placeholder="Jane"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        error={error?.message}
                                        autoCapitalize="words"
                                        returnKeyType="next"
                                    />
                                )}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Controller
                                control={control}
                                name="lastName"
                                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                                    <AppInput
                                        label="Last Name"
                                        placeholder="Doe"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        error={error?.message}
                                        autoCapitalize="words"
                                        returnKeyType="next"
                                    />
                                )}
                            />
                        </View>
                    </View>

                    <View style={{ height: Spacing.sm }} />
                    {/* Username */}
                    <Controller
                        control={control}
                        name="username"
                        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                            <AppInput
                                label="Username"
                                placeholder="@yourname"
                                value={value}
                                onChangeText={(t) => onChange(t.replace(/\s/g, '').toLowerCase())}
                                onBlur={onBlur}
                                error={error?.message}
                                hint={`${value?.length ?? 0}/${USERNAME_MAX} chars · Changing username too often may reduce discoverability`}
                                autoCapitalize="none"
                                autoCorrect={false}
                                returnKeyType="next"
                                leftIcon={<Typography variant="body" color={colors.textTertiary}>@</Typography>}
                            />
                        )}
                    />
                    <View style={{ height: Spacing.sm }} />
                    {/* Bio */}
                    <Controller
                        control={control}
                        name="bio"
                        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                            <AppInput
                                label="Bio"
                                placeholder="Tell people a little about yourself and your work…"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={error?.message}
                                hint={`${value?.length ?? 0}/${BIO_MAX}`}
                                multiline
                                numberOfLines={4}
                                maxLength={BIO_MAX}
                                textAlignVertical="top"
                                style={{ minHeight: 96, paddingTop: Spacing.sm }}
                                returnKeyType="next"
                            />
                        )}
                    />
                </GlassCard>

                {/* ── Location ── */}
                <SectionLabel label="Location" />
                <GlassCard style={{ gap: Spacing.md }}>
                    <View style={styles.rowTwo}>
                        <View style={{ flex: 1 }}>
                            <Controller
                                control={control}
                                name="city"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <AppInput
                                        label="City"
                                        placeholder="Enter City..."
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        autoCapitalize="words"
                                        returnKeyType="next"
                                    />
                                )}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Controller
                                control={control}
                                name="country"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <AppInput
                                        label="Country"
                                        placeholder="Enter Country..."
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        autoCapitalize="words"
                                        returnKeyType="next"
                                    />
                                )}
                            />
                        </View>
                    </View>
                </GlassCard>

                {/* ── Specialization ── */}
                <SectionLabel label="Specializations" />
                <GlassCard>
                    {specializations.length > 0 && (
                        <View style={styles.tagRow}>
                            {specializations.map((s) => (
                                <TouchableOpacity
                                    key={s}
                                    onPress={() => removeSpec(s)}
                                    style={[styles.tag, { backgroundColor: Palette.primary + '18', borderColor: Palette.primary + '40' }]}
                                    activeOpacity={0.7}
                                >
                                    <Typography variant="caption" color={Palette.primary}>{s}</Typography>
                                    <IconSymbol size={12} name="xmark" color={Palette.primary} style={{ marginLeft: 4 }} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                    <TouchableOpacity
                        onPress={() => setSpecializationOpen(true)}
                        style={[styles.selectTrigger, { borderColor: colors.border, backgroundColor: colors.surface }]}
                        activeOpacity={0.75}
                    >
                        <IconSymbol size={18} name={'briefcase' as any} color={colors.textTertiary} />
                        <Typography variant="body" color={specializations.length ? colors.text : colors.textTertiary} style={{ flex: 1, marginLeft: Spacing.sm }}>
                            {specializations.length ? `${specializations.length} selected` : 'Select specializations…'}
                        </Typography>
                        <IconSymbol size={16} name="chevron.down" color={colors.textTertiary} />
                    </TouchableOpacity>
                </GlassCard>

                {/* ── Links ── */}
                <SectionLabel label="Links" />
                <GlassCard style={{ gap: Spacing.md }}>
                    <Controller
                        control={control}
                        name="website"
                        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                            <AppInput
                                label="Website"
                                placeholder="https://yoursite.com"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={error?.message}
                                keyboardType="url"
                                autoCapitalize="none"
                                autoCorrect={false}
                                returnKeyType="next"
                                leftIcon={<IconSymbol size={16} name={'doc.text' as any} color={colors.textTertiary} />}
                            />
                        )}
                    />
                    <View style={{ height: Spacing.md }} />
                    <Controller
                        control={control}
                        name="socialLink"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <AppInput
                                label="Social Link (Instagram, TikTok…)"
                                placeholder="https://instagram.com/yourhandle"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                keyboardType="url"
                                autoCapitalize="none"
                                autoCorrect={false}
                                returnKeyType="done"
                                leftIcon={<IconSymbol size={16} name={'paperplane.fill' as any} color={colors.textTertiary} />}
                            />
                        )}
                    />
                    <View style={{ height: Spacing.md }} />
                    <Controller
                        control={control}
                        name="otherLink"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <AppInput
                                label="Others"
                                placeholder="https://instagram.com/yourhandle"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                keyboardType="url"
                                autoCapitalize="none"
                                autoCorrect={false}
                                returnKeyType="done"
                                leftIcon={<IconSymbol size={16} name={'paperplane.fill' as any} color={colors.textTertiary} />}
                            />
                        )}
                    />
                </GlassCard>
            </ScrollView>

            {/* ── Sticky Save ── */}
            <View style={[styles.stickyBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                <GlassButton
                    variant="primary"
                    label="Save Changes"
                    fullWidth
                    loading={isSubmitting}
                    onPress={handleSubmit(onSubmit)}
                />
            </View>

            {/* ── Specialization picker modal ── */}
            <AppModal
                visible={specializationOpen}
                onClose={() => setSpecializationOpen(false)}
                title="Specializations"
                description="Select all that apply, or add your own"
                size="lg"
            >
                <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
                    <View style={styles.tagGrid}>
                        {SPECIALIZATIONS.map((s) => {
                            const selected = specializations.includes(s);
                            return (
                                <TouchableOpacity
                                    key={s}
                                    onPress={() => toggleSpec(s)}
                                    style={[
                                        styles.tag,
                                        selected
                                            ? { backgroundColor: Palette.primary + '18', borderColor: Palette.primary }
                                            : { backgroundColor: colors.surface, borderColor: colors.border },
                                    ]}
                                    activeOpacity={0.7}
                                >
                                    {selected && <IconSymbol size={12} name="checkmark" color={Palette.primary} style={{ marginRight: 4 }} />}
                                    <Typography variant="caption" color={selected ? Palette.primary : colors.text}>{s}</Typography>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Custom entry */}
                    <View style={[styles.customSpecRow, { borderTopColor: colors.border }]}>
                        <AppInput
                            placeholder="Add custom specialization…"
                            value={customSpec}
                            onChangeText={setCustomSpec}
                            onSubmitEditing={addCustomSpec}
                            returnKeyType="done"
                            containerStyle={{ flex: 1 }}
                        />
                        <TouchableOpacity
                            onPress={addCustomSpec}
                            style={[styles.addBtn, { backgroundColor: Palette.primary }]}
                            disabled={!customSpec.trim()}
                            activeOpacity={0.75}
                        >
                            <IconSymbol size={18} name="plus" color="#fff" />
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                <GlassButton
                    variant="primary"
                    label={`Done  (${specializations.length} selected)`}
                    fullWidth
                    onPress={() => setSpecializationOpen(false)}
                    style={{ marginTop: Spacing.md }}
                />
            </AppModal>
        </ScreenWrapper>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const COVER_HEIGHT = 180;
const AVATAR_SIZE = 88;

const styles = StyleSheet.create({
    heroSection: {
        position: 'relative',
        marginBottom: AVATAR_SIZE / 2 + Spacing.md,
    },
    coverTap: {
        width: '100%',
        height: COVER_HEIGHT,
    },
    cover: {
        width: '100%',
        height: COVER_HEIGHT,
    },
    coverPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    coverEditBadge: {
        position: 'absolute',
        bottom: Spacing.sm,
        right: Spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
    },
    avatarWrapper: {
        position: 'absolute',
        bottom: -AVATAR_SIZE / 2,
        left: Spacing.lg,
    },
    avatarTap: {
        position: 'relative',
    },
    avatar: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        borderWidth: 3,
        borderColor: '#fff',
    },
    avatarPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarEditBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: Palette.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    floatingTitleRow: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 16 : 16,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
    },
    formBody: {
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.sm,
    },
    rowTwo: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
        marginBottom: Spacing.sm,
    },
    tagGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        paddingBottom: Spacing.md,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 5,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
    },
    selectTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm + 2,
        minHeight: 48,
    },
    customSpecRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingTop: Spacing.md,
        borderTopWidth: StyleSheet.hairlineWidth,
        marginTop: Spacing.xs,
    },
    addBtn: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
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