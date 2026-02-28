import { AppModal, BackButton, GlassButton, GlassCard, ScreenWrapper, Typography } from "@/components/ui";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { FAB } from "@/components/ui/FAB";
import { AppInput } from "@/components/ui/Input";
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette } from "@/constants/colors";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useAppTheme } from "@/context/ThemeContext";
import { MENU_ITEMS, PRESET_FIELDS, UNITS } from "@/data/otherdata";
import { MeasurementField } from "@/types";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

function UnitChip({ unit, onPress }: { unit: string; onPress: () => void }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.75}
            style={[styles.unitChip, { backgroundColor: Palette.primary + '18', borderColor: Palette.primary + '40' }]}
        >
            <Typography variant="caption" weight="semiBold" color={Palette.primary}>
                {unit}
            </Typography>
            <IconSymbol size={12} name="chevron.down" color={Palette.primary} style={{ marginLeft: 3 }} />
        </TouchableOpacity>
    );
}

// ─── Measurement Row ─────────────────────────────────────────────────────────

function MeasurementRow({
    field,
    unit,
    onValueChange,
    onRemove,
}: {
    field: MeasurementField;
    unit: string;
    onValueChange: (id: string, value: string) => void;
    onRemove: (id: string) => void;
}) {
    const { colors } = useAppTheme();
    const inputRef = useRef<TextInput>(null);

    return (
        <View style={[styles.measureRow, { borderBottomColor: colors.border }]}>
            <Typography variant="body" color={colors.text} style={styles.measureLabel} numberOfLines={1}>
                {field.name}
            </Typography>
            <View style={styles.measureInputWrap}>
                <TextInput
                    ref={inputRef}
                    value={field.value}
                    onChangeText={(t) => onValueChange(field.id, t.replace(/[^0-9.]/g, ''))}
                    keyboardType="decimal-pad"
                    placeholder="—"
                    placeholderTextColor={colors.textTertiary}
                    style={[styles.measureInput, { color: colors.text, borderColor: colors.border }]}
                    selectTextOnFocus
                    returnKeyType="next"
                />
                <Typography variant="caption" color={colors.textSecondary} style={styles.measureUnit}>
                    {unit}
                </Typography>
            </View>
            <TouchableOpacity onPress={() => onRemove(field.id)} hitSlop={8} style={{ marginLeft: Spacing.xs }}>
                <IconSymbol size={18} name="xmark" color={colors.textTertiary} />
            </TouchableOpacity>
        </View>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
    const { colors } = useAppTheme();
    return (
        <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: Palette.primary + '14' }]}>
                <IconSymbol size={36} name={'ruler' as any} color={Palette.primary} />
            </View>
            <Typography variant="h4" color={colors.text} style={{ marginTop: Spacing.md, textAlign: 'center' }}>
                No measurements yet
            </Typography>
            <Typography variant="body" color={colors.textSecondary} style={{ marginTop: Spacing.xs, textAlign: 'center', maxWidth: 260 }}>
                Use the buttons below to add custom fields or pick from our preset list.
            </Typography>
        </View>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export const AddNotes = () => {
    const router = useRouter();
    const { colors, isDark } = useAppTheme();

    const moreButtonRef = useRef<View>(null);

    const [unit, setUnit] = useState<string>('in');
    const [fields, setFields] = useState<MeasurementField[]>([]);

    const [unitOpen, setUnitOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [customOpen, setCustomOpen] = useState(false);
    const [presetOpen, setPresetOpen] = useState(false);
    const [customName, setCustomName] = useState('');

    // ── Field helpers ─────────────────────────────────────────────────────────
    const addField = (name: string) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        setFields((prev) => [...prev, { id: Date.now().toString(), name: trimmed, value: '' }]);
    };

    const addPreset = (name: string) => {
        if (!fields.find((f) => f.name === name)) addField(name);
    };

    const updateValue = (id: string, value: string) => {
        setFields((prev) => prev.map((f) => (f.id === id ? { ...f, value } : f)));
    };

    const removeField = (id: string) => {
        setFields((prev) => prev.filter((f) => f.id !== id));
    };

    const handleAddCustom = () => {
        addField(customName);
        setCustomName('');
        setCustomOpen(false);
    };

    const handleMenuSelect = (id: string) => {
        // TODO: wire up actions
        console.log('menu:', id);
    };

    const selectedUnitLabel = UNITS.find((u) => u.value === unit)?.value ?? unit;

    return (
        <ScreenWrapper
            padded={false}
            keyboardAvoiding
            keyboardVerticalOffset={Platform.OS === 'android' ? 20 : 0}
        >
            <View style={[styles.container, { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm }]}>

                {/* ── Header ── */}
                <View style={styles.header}>
                    <BackButton onPress={() => router.back()} />
                    <Typography variant="h4">Measurement</Typography>
                    <View style={styles.headerRight}>
                        <UnitChip unit={selectedUnitLabel} onPress={() => setUnitOpen(true)} />
                        {/* anchor ref so the dropdown knows where to position itself */}
                        <View ref={moreButtonRef} collapsable={false}>
                            <TouchableOpacity
                                onPress={() => setMenuOpen(true)}
                                hitSlop={8}
                                style={styles.iconBtn}
                                activeOpacity={0.7}
                            >
                                <IconSymbol size={24} name={'morevert' as any} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* ── Field List ── */}
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={[
                        styles.listContent,
                        fields.length === 0 && { flex: 1 },
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {fields.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
                            {fields.map((field) => (
                                <MeasurementRow
                                    key={field.id}
                                    field={field}
                                    unit={unit}
                                    onValueChange={updateValue}
                                    onRemove={removeField}
                                />
                            ))}
                        </GlassCard>
                    )}
                </ScrollView>

                {/* ── FABs (bottom-right, stacked) ── */}
                <View style={styles.fabGroup}>
                    <FAB
                        icon="list.bullet"
                        onPress={() => setPresetOpen(true)}
                        color={isDark ? '#3a3a3a' : Palette.primaryDark}
                        size={48}
                    />
                    <FAB
                        icon="plus"
                        onPress={() => setCustomOpen(true)}
                        color={Palette.primary}
                        size={56}
                    />
                </View>
            </View>

            {/* ── Dropdown menu ── */}
            <DropdownMenu
                visible={menuOpen}
                anchorRef={moreButtonRef}
                onClose={() => setMenuOpen(false)}
                items={MENU_ITEMS}
                onSelect={handleMenuSelect}
            />

            {/* ── Unit Selector Modal ── */}
            <AppModal visible={unitOpen} onClose={() => setUnitOpen(false)} title="Measuring Unit" size="sm">
                <View style={{ gap: Spacing.sm }}>
                    {UNITS.map((u) => {
                        const selected = u.value === unit;
                        return (
                            <TouchableOpacity
                                key={u.value}
                                onPress={() => { setUnit(u.value); setUnitOpen(false); }}
                                activeOpacity={0.75}
                                style={[
                                    styles.optionRow,
                                    {
                                        borderColor: selected ? Palette.primary : colors.border,
                                        backgroundColor: selected ? Palette.primary + '12' : colors.surface,
                                    },
                                ]}
                            >
                                <Typography
                                    variant="body"
                                    weight={selected ? 'semiBold' : 'regular'}
                                    color={selected ? Palette.primary : colors.text}
                                    style={{ flex: 1 }}
                                >
                                    {u.label}
                                </Typography>
                                {selected && <IconSymbol size={16} name="checkmark" color={Palette.primary} />}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </AppModal>

            {/* ── Add Custom Field Modal ── */}
            <AppModal
                visible={customOpen}
                onClose={() => { setCustomOpen(false); setCustomName(''); }}
                title="Custom Field"
                description="Name your measurement field"
                size="md"
            >
                <AppInput
                    placeholder="e.g. Armhole circumference"
                    value={customName}
                    onChangeText={setCustomName}
                    onSubmitEditing={handleAddCustom}
                    returnKeyType="done"
                    autoFocus
                    autoCapitalize="words"
                />
                <GlassButton
                    variant="primary"
                    label="Add Field"
                    fullWidth
                    onPress={handleAddCustom}
                    disabled={!customName.trim()}
                    style={{ marginTop: Spacing.md }}
                />
            </AppModal>

            {/* ── Preset Field Modal ── */}
            <AppModal
                visible={presetOpen}
                onClose={() => setPresetOpen(false)}
                title="Add Preset Field"
                description="Tap a field to add it"
                size="lg"
            >
                <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
                    <View style={styles.presetGrid}>
                        {PRESET_FIELDS.map((name) => {
                            const added = !!fields.find((f) => f.name === name);
                            return (
                                <TouchableOpacity
                                    key={name}
                                    onPress={() => addPreset(name)}
                                    disabled={added}
                                    activeOpacity={0.7}
                                    style={[
                                        styles.presetChip,
                                        added
                                            ? { backgroundColor: Palette.primary + '18', borderColor: Palette.primary }
                                            : { backgroundColor: colors.surface, borderColor: colors.border },
                                    ]}
                                >
                                    {added && (
                                        <IconSymbol size={12} name="checkmark" color={Palette.primary} style={{ marginRight: 4 }} />
                                    )}
                                    <Typography
                                        variant="caption"
                                        color={added ? Palette.primary : colors.text}
                                        weight={added ? 'semiBold' : 'regular'}
                                    >
                                        {name}
                                    </Typography>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>
                <GlassButton
                    variant="primary"
                    label="Done"
                    fullWidth
                    onPress={() => setPresetOpen(false)}
                    style={{ marginTop: Spacing.md }}
                />
            </AppModal>
        </ScreenWrapper>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.md,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    unitChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 5,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
    },
    iconBtn: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContent: {
        paddingBottom: 120,
    },
    measureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm + 2,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    measureLabel: {
        flex: 1,
        marginRight: Spacing.sm,
    },
    measureInputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    measureInput: {
        width: 72,
        textAlign: 'right',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 6,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        fontSize: 15,
    },
    measureUnit: {
        width: 26,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fabGroup: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 36 : Spacing.lg,
        right: Spacing.md,
        alignItems: 'center',
        gap: Spacing.sm,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.sm + 2,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        gap: Spacing.sm,
    },
    presetGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        paddingBottom: Spacing.md,
    },
    presetChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 6,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
    },
});