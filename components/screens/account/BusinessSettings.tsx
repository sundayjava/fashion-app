import { AppModal, BackButton, GlassButton, GlassCard, ScreenWrapper, Typography, showToast } from '@/components/ui';
import { AppInput } from '@/components/ui/Input';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette } from '@/constants/colors';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import { CURRENCIES, MEASUREMENT_METHODS, PRODUCTION_TIMES, SERVICE_AREAS } from '@/data/otherdata';
import {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetFlatList,
    BottomSheetModal,
    BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { yupResolver } from '@hookform/resolvers/yup';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    Keyboard,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import * as yup from 'yup';

// ─── Validation ───────────────────────────────────────────────────────────────

const DESCRIPTION_MAX = 300;

const schema = yup.object({
    businessName: yup.string().trim().required('Business name is required').min(2, 'Too short').max(80),
    businessDescription: yup.string().trim().max(DESCRIPTION_MAX, `Max ${DESCRIPTION_MAX} characters`).optional(),
    businessAddress: yup.string().trim().optional(),
    regNumber: yup.string().trim().optional(),
});

type BusinessForm = yup.InferType<typeof schema>;

// ─── Section label ────────────────────────────────────────────────────────────

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

// ─── Select Trigger ───────────────────────────────────────────────────────────

function SelectTrigger({ label, value, onPress, icon }: { label: string; value: string; onPress: () => void; icon?: string }) {
    const { colors } = useAppTheme();
    return (
        <View style={{ gap: 4 }}>
            <Typography variant="label" color={colors.textSecondary}>{label}</Typography>
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.75}
                style={[styles.trigger, { borderColor: colors.border, backgroundColor: colors.surface }]}
            >
                {icon && <IconSymbol size={16} name={icon as any} color={colors.textTertiary} style={{ marginRight: Spacing.sm }} />}
                <Typography variant="body" color={value ? colors.text : colors.textTertiary} style={{ flex: 1 }}>
                    {value || `Select ${label.toLowerCase()}…`}
                </Typography>
                <IconSymbol size={16} name="chevron.down" color={colors.textTertiary} />
            </TouchableOpacity>
        </View>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export const BusinessSettings = () => {
    const router = useRouter();
    const { colors, isDark } = useAppTheme();

    const [logoUri, setLogoUri] = useState<string | null>(null);
    const [productionTime, setProductionTime] = useState('');
    const [measurement, setMeasurement] = useState('');
    const [currency, setCurrency] = useState('NGN');
    const [serviceAreas, setServiceAreas] = useState<string[]>([]);
    const [currencyLocked] = useState(false); // becomes true after first payout

    const [productionOpen, setProductionOpen] = useState(false);
    const [measurementOpen, setMeasurementOpen] = useState(false);
    const [areasOpen, setAreasOpen] = useState(false);

    const currencySheetRef = useRef<BottomSheetModal>(null);
    const [currencySearch, setCurrencySearch] = useState('');
    const snapPoints = useMemo(() => ['65%', '90%'], []);

    const filteredCurrencies = useMemo(() =>
        currencySearch.trim() === ''
            ? CURRENCIES
            : CURRENCIES.filter((c) =>
                c.label.toLowerCase().includes(currencySearch.toLowerCase()) ||
                c.code.toLowerCase().includes(currencySearch.toLowerCase())
            ),
        [currencySearch]
    );

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.5}
                pressBehavior="close"
            />
        ),
        []
    );

    const {
        control,
        handleSubmit,
        watch,
        formState: { isSubmitting },
    } = useForm<BusinessForm>({
        resolver: yupResolver(schema) as any,
        defaultValues: { businessName: '', businessDescription: '', businessAddress: '', regNumber: '' },
        mode: 'onChange',
    });

    // ── Logo picker ───────────────────────────────────────────────────────────
    const pickLogo = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            showToast({ type: 'error', text1: 'Permission denied', text2: 'Allow photo access in Settings.' });
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85,
        });
        if (!result.canceled && result.assets[0]) setLogoUri(result.assets[0].uri);
    };

    // ── Service areas ─────────────────────────────────────────────────────────
    const [customArea, setCustomArea] = useState('');

    const toggleArea = (a: string) => {
        setServiceAreas((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
    };

    const addCustomArea = () => {
        const trimmed = customArea.trim();
        if (trimmed && !serviceAreas.includes(trimmed)) {
            setServiceAreas((prev) => [...prev, trimmed]);
        }
        setCustomArea('');
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const onSubmit = async (data: BusinessForm) => {
        // TODO: call API
        await new Promise((r) => setTimeout(r, 800));
        showToast({ type: 'success', text1: 'Business info updated', text2: 'Your changes have been saved.' });
    };

    const businessDescription = watch('businessDescription') ?? '';

    const selectedCurrencyLabel = CURRENCIES.find((c) => c.code === currency)?.label ?? currency;

    return (
        <ScreenWrapper
            padded
            keyboardAvoiding
            keyboardVerticalOffset={Platform.OS === 'android' ? 20 : 0}
        >
            {/* Header row */}
            <View style={styles.headerRow}>
                <BackButton onPress={() => router.back()} />
                <Typography variant="h3">Business Info</Typography>
                <View style={{ minWidth: 40 }} />
            </View>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                onScrollBeginDrag={Keyboard.dismiss}
            >
                {/* ── Logo ── */}
                <SectionLabel label="Business Logo" />
                <GlassCard>
                    <View style={styles.logoRow}>
                        <TouchableOpacity onPress={pickLogo} activeOpacity={0.8} style={styles.logoTap}>
                            {logoUri ? (
                                <Image source={{ uri: logoUri }} style={styles.logo} contentFit="cover" />
                            ) : (
                                <View style={[styles.logo, styles.logoPlaceholder, { backgroundColor: Palette.primary + '18' }]}>
                                    <IconSymbol size={28} name={'briefcase' as any} color={Palette.primary} />
                                </View>
                            )}
                            <View style={styles.logoEditBadge}>
                                <IconSymbol size={12} name={'pencil.line' as any} color="#fff" />
                            </View>
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}>
                            <Typography variant="title">Business Logo</Typography>
                            <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                                Square image recommended (1:1). PNG or JPG.
                            </Typography>
                            <TouchableOpacity onPress={pickLogo} style={styles.uploadBtn} activeOpacity={0.75}>
                                <Typography variant="caption" color={colors.primary} weight="semiBold">
                                    {logoUri ? 'Change logo' : 'Upload logo'}
                                </Typography>
                            </TouchableOpacity>
                        </View>
                    </View>
                </GlassCard>

                {/* ── Business details ── */}
                <SectionLabel label="Business Details" />
                <GlassCard style={{ gap: Spacing.md }}>
                    <Controller
                        control={control}
                        name="businessName"
                        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                            <AppInput
                                label="Business Name"
                                placeholder="Fashionistar Studio"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={error?.message}
                                autoCapitalize="words"
                                returnKeyType="next"
                            />
                        )}
                    />
                    <View style={{ height: Spacing.md }} />
                    <Controller
                        control={control}
                        name="businessDescription"
                        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                            <AppInput
                                label="Business Description"
                                placeholder="Tell clients what your business is about, your style, and what makes you unique…"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={error?.message}
                                hint={`${businessDescription.length}/${DESCRIPTION_MAX}`}
                                multiline
                                numberOfLines={4}
                                maxLength={DESCRIPTION_MAX}
                                textAlignVertical="top"
                                style={{ minHeight: 96, paddingTop: Spacing.sm }}
                                returnKeyType="next"
                            />
                        )}
                    />
                    <View style={{ height: Spacing.md }} />
                    <Controller
                        control={control}
                        name="businessAddress"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <AppInput
                                label="Business Address"
                                placeholder="12 Fashion Ave, World City"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                autoCapitalize="words"
                                returnKeyType="next"
                                multiline
                                numberOfLines={2}
                                textAlignVertical="top"
                                style={{ minHeight: 64, paddingTop: Spacing.sm }}
                            />
                        )}
                    />
                </GlassCard>

                {/* ── Service areas ── */}
                <SectionLabel label="Service Areas" />
                <GlassCard>
                    {serviceAreas.length > 0 && (
                        <View style={styles.tagRow}>
                            {serviceAreas.map((a) => (
                                <TouchableOpacity
                                    key={a}
                                    onPress={() => toggleArea(a)}
                                    style={[styles.tag, { backgroundColor: Palette.primary + '18', borderColor: Palette.primary + '40' }]}
                                    activeOpacity={0.7}
                                >
                                    <Typography variant="caption" color={Palette.primary}>{a}</Typography>
                                    <IconSymbol size={12} name="xmark" color={Palette.primary} style={{ marginLeft: 4 }} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                    <SelectTrigger
                        label="Regions you serve"
                        value={serviceAreas.length > 0 ? `${serviceAreas.length} area${serviceAreas.length > 1 ? 's' : ''} selected` : ''}
                        onPress={() => setAreasOpen(true)}
                        icon="person.fill"
                    />
                </GlassCard>

                {/* ── Operations ── */}
                <SectionLabel label="Operations" />
                <GlassCard style={{ gap: Spacing.md }}>
                    <SelectTrigger
                        label="Production Time"
                        value={productionTime}
                        onPress={() => setProductionOpen(true)}
                        icon="bell"
                    />
                    <View style={{ height: Spacing.md }} />
                    <SelectTrigger
                        label="Measurement Method"
                        value={MEASUREMENT_METHODS.find((m) => m.value === measurement)?.label ?? ''}
                        onPress={() => setMeasurementOpen(true)}
                        icon="person.fill"
                    />
                </GlassCard>

                {/* ── Currency ── */}
                <SectionLabel label="Currency" />
                <GlassCard>
                    {currencyLocked ? (
                        <View style={[styles.lockedBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <IconSymbol size={16} name={'lock' as any} color={colors.textSecondary} />
                            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                                <Typography variant="title">{selectedCurrencyLabel}</Typography>
                                <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                                    Currency is locked after first payout setup. Contact support to change.
                                </Typography>
                            </View>
                        </View>
                    ) : (
                        <SelectTrigger
                            label="Currency"
                            value={selectedCurrencyLabel}
                            onPress={() => currencySheetRef.current?.present()}
                            icon="creditcard"
                        />
                    )}
                </GlassCard>

                {/* ── Registration (optional) ── */}
                <SectionLabel label="Business Registration (Optional)" />
                <GlassCard>
                    <Controller
                        control={control}
                        name="regNumber"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <AppInput
                                label="Registration Number"
                                placeholder="RC-1234567"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                hint="Your official business registration number, if any."
                                autoCapitalize="characters"
                                returnKeyType="done"
                            />
                        )}
                    />
                </GlassCard>
            </ScrollView>

            {/* ── Sticky save ── */}
            <View style={[styles.stickyBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                <GlassButton
                    variant="primary"
                    label="Save Changes"
                    fullWidth
                    loading={isSubmitting}
                    onPress={handleSubmit(onSubmit)}
                />
            </View>

            {/* ── Production Time Modal ── */}
            <AppModal visible={productionOpen} onClose={() => setProductionOpen(false)} title="Production Time" size="sm">
                <View style={{ gap: Spacing.sm }}>
                    {PRODUCTION_TIMES.map((t) => (
                        <TouchableOpacity
                            key={t}
                            onPress={() => { setProductionTime(t); setProductionOpen(false); }}
                            style={[styles.radioRow, { borderColor: productionTime === t ? Palette.primary : colors.border, backgroundColor: productionTime === t ? Palette.primary + '12' : colors.surface }]}
                            activeOpacity={0.75}
                        >
                            <Typography variant="body" color={productionTime === t ? Palette.primary : colors.text} style={{ flex: 1 }}>{t}</Typography>
                            {productionTime === t && <IconSymbol size={16} name="checkmark" color={Palette.primary} />}
                        </TouchableOpacity>
                    ))}
                </View>
            </AppModal>

            {/* ── Measurement Modal ── */}
            <AppModal visible={measurementOpen} onClose={() => setMeasurementOpen(false)} title="Measurement Method" size="sm">
                <View style={{ gap: Spacing.sm }}>
                    {MEASUREMENT_METHODS.map((m) => (
                        <TouchableOpacity
                            key={m.value}
                            onPress={() => { setMeasurement(m.value); setMeasurementOpen(false); }}
                            style={[styles.radioRow, { borderColor: measurement === m.value ? Palette.primary : colors.border, backgroundColor: measurement === m.value ? Palette.primary + '12' : colors.surface }]}
                            activeOpacity={0.75}
                        >
                            <View style={{ flex: 1 }}>
                                <Typography variant="body" color={measurement === m.value ? Palette.primary : colors.text}>{m.label}</Typography>
                                <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>{m.description}</Typography>
                            </View>
                            {measurement === m.value && <IconSymbol size={16} name="checkmark" color={Palette.primary} />}
                        </TouchableOpacity>
                    ))}
                </View>
            </AppModal>

            {/* ── Currency Bottom Sheet ── */}
            <BottomSheetModal
                ref={currencySheetRef}
                snapPoints={snapPoints}
                index={1}
                enablePanDownToClose
                backdropComponent={renderBackdrop}
                backgroundStyle={{ backgroundColor: colors.surfaceElevated }}
                handleIndicatorStyle={{ backgroundColor: colors.border }}
                onDismiss={() => setCurrencySearch('')}
                keyboardBehavior="interactive"
                keyboardBlurBehavior="restore"
                android_keyboardInputMode="adjustResize"
            >
                <View style={styles.sheetContent}>
                    <Typography variant="h4" style={styles.sheetTitle}>Currency</Typography>

                    <BottomSheetTextInput
                        placeholder="Search currency…"
                        placeholderTextColor={colors.textTertiary}
                        value={currencySearch}
                        onChangeText={setCurrencySearch}
                        selectionColor={colors.primary}
                        autoCorrect={false}
                        style={[
                            styles.sheetSearch,
                            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                        ]}
                    />

                    <BottomSheetFlatList
                        data={filteredCurrencies}
                        keyExtractor={(item: { code: string; }) => item.code}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        style={{ flex: 1 }}
                        contentContainerStyle={{ paddingBottom: Spacing.xl * 2 }}
                        ItemSeparatorComponent={() => (
                            <View style={[styles.sheetSep, { backgroundColor: colors.border }]} />
                        )}
                        ListEmptyComponent={
                            <View style={styles.sheetEmpty}>
                                <Typography variant="body" color={colors.textSecondary} align="center">No results</Typography>
                            </View>
                        }
                        renderItem={({ item }: { item: { code: string; label: string } }) => {
                            const selected = item.code === currency;
                            return (
                                <TouchableOpacity
                                    onPress={() => { setCurrency(item.code); currencySheetRef.current?.close(); }}
                                    style={[
                                        styles.sheetItem,
                                        selected && { backgroundColor: colors.primary + '18' },
                                    ]}
                                    activeOpacity={0.75}
                                >
                                    <Typography
                                        variant="body"
                                        weight={selected ? 'semiBold' : 'regular'}
                                        color={selected ? colors.primary : colors.text}
                                        style={{ flex: 1 }}
                                    >
                                        {item.label}
                                    </Typography>
                                    {selected && <IconSymbol size={16} name="checkmark" color={Palette.primary} />}
                                </TouchableOpacity>
                            );
                        }}
                        ListFooterComponent={
                            <View style={[styles.warningBanner, { backgroundColor: Palette.warning + '12', borderColor: Palette.warning + '30', margin: Spacing.md }]}>
                                <IconSymbol size={14} name={'lock' as any} color={Palette.warning} />
                                <Typography variant="caption" color={Palette.warning} style={{ flex: 1, marginLeft: Spacing.xs }}>
                                    Currency will be locked after your first payout is set up.
                                </Typography>
                            </View>
                        }
                    />
                </View>
            </BottomSheetModal>

            {/* ── Service Areas Modal ── */}
            <AppModal visible={areasOpen} onClose={() => setAreasOpen(false)} title="Service Areas" description="Select all regions you can deliver to, or add your own" size="lg">
                <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
                    <View style={styles.tagGrid}>
                        {[...SERVICE_AREAS, ...serviceAreas.filter((a) => !SERVICE_AREAS.includes(a))].map((a) => {
                            const selected = serviceAreas.includes(a);
                            return (
                                <TouchableOpacity
                                    key={a}
                                    onPress={() => toggleArea(a)}
                                    style={[styles.tag, selected ? { backgroundColor: Palette.primary + '18', borderColor: Palette.primary } : { backgroundColor: colors.surface, borderColor: colors.border }]}
                                    activeOpacity={0.7}
                                >
                                    {selected && <IconSymbol size={12} name="checkmark" color={Palette.primary} style={{ marginRight: 4 }} />}
                                    <Typography variant="caption" color={selected ? Palette.primary : colors.text}>{a}</Typography>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>

                {/* Custom area entry */}
                <View style={[styles.customAreaRow, { borderTopColor: colors.border }]}>
                    <AppInput
                        placeholder="Add a custom area…"
                        value={customArea}
                        onChangeText={setCustomArea}
                        onSubmitEditing={addCustomArea}
                        returnKeyType="done"
                        containerStyle={{ flex: 1 }}
                    />
                    <TouchableOpacity
                        onPress={addCustomArea}
                        style={[styles.addBtn, { backgroundColor: customArea.trim() ? Palette.primary : colors.border }]}
                        disabled={!customArea.trim()}
                        activeOpacity={0.75}
                    >
                        <IconSymbol size={18} name="plus" color="#fff" />
                    </TouchableOpacity>
                </View>

                <GlassButton variant="primary" label={`Done (${serviceAreas.length} selected)`} fullWidth onPress={() => setAreasOpen(false)} style={{ marginTop: Spacing.sm }} />
            </AppModal>
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
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    logoTap: {
        position: 'relative',
    },
    logo: {
        width: 72,
        height: 72,
        borderRadius: BorderRadius.lg,
    },
    logoPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoEditBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Palette.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    uploadBtn: {
        marginTop: 6,
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
        paddingBottom: Spacing.sm,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 5,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
    },
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm + 2,
        minHeight: 48,
    },
    radioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.sm + 2,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        gap: Spacing.sm,
    },
    lockedBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
    },
    warningBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: Spacing.sm,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        gap: Spacing.xs,
    },
    customAreaRow: {
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
    sheetContent: {
        flex: 1,
        paddingTop: Spacing.sm,
    },
    sheetTitle: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    sheetSearch: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.sm,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm + 2,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        minHeight: 48,
    },
    sheetItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: Spacing.lg,
        gap: Spacing.md,
    },
    sheetSep: {
        height: StyleSheet.hairlineWidth,
        marginLeft: Spacing.lg,
    },
    sheetEmpty: {
        paddingVertical: Spacing.xl,
        alignItems: 'center',
    },
});