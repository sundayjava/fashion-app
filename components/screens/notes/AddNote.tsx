import { AppBottomSheet, AppModal, BackButton, GlassButton, ScreenWrapper, Typography } from "@/components/ui";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { FAB } from "@/components/ui/FAB";
import { AppInput } from "@/components/ui/Input";
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette } from "@/constants/colors";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useAppTheme } from "@/context/ThemeContext";
import { MENU_ITEMS, PRESET_FIELDS, UNITS } from "@/data/otherdata";
import { dbService } from "@/services/database";
import { useMeasurementStore } from "@/stores/measurementStore";
import { MeasurementField } from "@/types";
import BottomSheet from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    FlatList,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Toast from "react-native-toast-message";

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
    isLast,
    onSubmitEditing,
    onRefReady,
}: {
    field: MeasurementField;
    unit: string;
    onValueChange: (id: string, value: string) => void;
    onRemove: (id: string) => void;
    isLast?: boolean;
    onSubmitEditing?: () => void;
    onRefReady?: (ref: TextInput | null) => void;
}) {
    const { colors } = useAppTheme();
    const inputRef = useRef<TextInput>(null);

    // Register ref when component mounts
    useEffect(() => {
        if (inputRef.current && onRefReady) {
            onRefReady(inputRef.current);
        }
    }, [onRefReady]);

    return (
        <View style={[
            styles.measureRow,
            {
                borderBottomColor: colors.border,
                backgroundColor: 'transparent',
            }
        ]}>
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
                    returnKeyType={isLast ? "done" : "next"}
                    onSubmitEditing={onSubmitEditing}
                    blurOnSubmit={false}
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

export const AddNotes = ({ measurementId }: { measurementId?: number }) => {
    const router = useRouter();
    const { colors, isDark } = useAppTheme();

    // Zustand store
    const { fields, unit, setFields, addField, removeField, updateFieldValue, setUnit, fieldExists, reset } = useMeasurementStore();

    const moreButtonRef = useRef<View>(null);
    const presetBottomSheetRef = useRef<BottomSheet>(null);
    const inputRefs = useRef<Map<string, TextInput>>(new Map());

    const [unitOpen, setUnitOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [customOpen, setCustomOpen] = useState(false);
    const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [customName, setCustomName] = useState('');
    const [templateName, setTemplateName] = useState('');

    // Load measurement data for editing or default template for new measurement
    useEffect(() => {
        const initializeData = async () => {
            if (measurementId) {
                // Editing existing measurement
                await loadMeasurementForEdit(measurementId);
                setIsEditing(true);
            } else {
                // Creating new measurement - load default template if no fields in store
                if (fields.length === 0) {
                    await loadDefaultTemplate();
                }
            }
        };
        initializeData();

        // Cleanup: reset store when leaving the screen (only for new measurements)
        return () => {
            if (!measurementId) {
                reset();
            }
        };
    }, [measurementId]);

    // ── Database operations ───────────────────────────────────────────────────

    const loadMeasurementForEdit = async (id: number) => {
        try {
            const measurement = await dbService.getMeasurement(id);
            if (measurement) {
                const parsedFields: MeasurementField[] = JSON.parse(measurement.fields);
                setFields(parsedFields);
                setUnit(measurement.unit);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Not found',
                    text2: 'Measurement not found',
                });
                router.back();
            }
        } catch (error) {
            console.error('Failed to load measurement:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load measurement',
            });
            router.back();
        }
    };

    const loadDefaultTemplate = async () => {
        try {
            const template = await dbService.getDefaultTemplate();
            if (template) {
                const fieldNames = JSON.parse(template.fields);
                const newFields = fieldNames.map((name: string) => ({
                    id: Date.now().toString() + Math.random(),
                    name,
                    value: '',
                }));
                setFields(newFields);
            }
        } catch (error) {
            console.error('Failed to load default template:', error);
        }
    };

    const saveTemplateToDb = async () => {
        if (!templateName.trim()) return;
        try {
            await dbService.saveTemplate(templateName.trim(), fields);
            Toast.show({
                type: 'success',
                text1: 'Template saved',
                text2: `"${templateName}" saved successfully`,
            });
            setTemplateName('');
            setSaveTemplateOpen(false);
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Failed to save template',
            });
        }
    };

    const restoreDefault = () => {
        const defaultFields = PRESET_FIELDS.slice(0, 5).map((name) => ({
            id: Date.now().toString() + Math.random(),
            name,
            value: '',
        }));
        setFields(defaultFields);
        Toast.show({
            type: 'success',
            text1: 'Restored default',
            text2: 'Default fields have been restored',
        });
    };

    // ── Field helpers ─────────────────────────────────────────────────────────
    const handleAddField = (name: string) => {
        const trimmed = name.trim();
        if (!trimmed) return;

        // Check for duplicate names
        if (fieldExists(trimmed)) {
            Toast.show({
                type: 'error',
                text1: 'Duplicate field',
                text2: `"${trimmed}" already exists`,
            });
            return;
        }

        addField(trimmed);
    };

    const addPreset = (name: string) => {
        if (fieldExists(name)) {
            Toast.show({
                type: 'info',
                text1: 'Already added',
                text2: `"${name}" is already in your list`,
            });
            return;
        }
        addField(name);
    };

    const handleAddCustom = () => {
        handleAddField(customName);
        setCustomName('');
        setCustomOpen(false);
    };

    const handleMenuSelect = (id: string) => {
        switch (id) {
            case 'save_template':
                if (fields.length === 0) {
                    Toast.show({
                        type: 'info',
                        text1: 'No fields',
                        text2: 'Add at least one field to save as template',
                    });
                    return;
                }
                setSaveTemplateOpen(true);
                break;
            case 'load_template':
                router.push('/(app)/(notes)/load-template');
                break;
            case 'restore_default':
                restoreDefault();
                break;
            case 'help':
                Toast.show({
                    type: 'info',
                    text1: 'Help',
                    text2: 'Tap the + button to add custom fields or use presets',
                });
                break;
        }
    };

    const renderMeasurementItem = ({ item, index }: { item: MeasurementField; index: number }) => {
        const isLast = index === fields.length - 1;
        
        const focusNextField = () => {
            if (!isLast) {
                const nextField = fields[index + 1];
                const nextInput = inputRefs.current.get(nextField.id);
                nextInput?.focus();
            }
        };

        const registerRef = (ref: TextInput | null) => {
            if (ref) {
                inputRefs.current.set(item.id, ref);
            } else {
                inputRefs.current.delete(item.id);
            }
        };

        return (
            <MeasurementRow
                field={item}
                unit={unit}
                onValueChange={updateFieldValue}
                onRemove={removeField}
                isLast={isLast}
                onSubmitEditing={focusNextField}
                onRefReady={registerRef}
            />
        );
    };

    const selectedUnitLabel = UNITS.find((u) => u.value === unit)?.value ?? unit;

    return (
        <ScreenWrapper
            padded={false}
            keyboardAvoiding
            keyboardVerticalOffset={Platform.OS === 'android' ? 20 : 0}
        >
            <View style={[styles.container, { paddingTop: Spacing.sm }]}>

                {/* ── Header ── */}
                <View style={styles.header}>
                    <BackButton onPress={() => router.back()} />
                    <Typography variant="h4">{isEditing ? 'Edit' : 'Measurement'}</Typography>
                    <View style={styles.headerRight}>
                        {fields.length > 0 && (
                            <TouchableOpacity
                                onPress={() => {
                                    const url = measurementId 
                                        ? `/(app)/(notes)/save-measurement?id=${measurementId}`
                                        : '/(app)/(notes)/save-measurement';
                                    router.push(url as any);
                                }}
                                style={[styles.saveBtn, { backgroundColor: Palette.primary }]}
                                activeOpacity={0.8}
                            >
                                <Typography variant="caption" weight="semiBold" color="#fff">
                                    {isEditing ? 'Update' : 'Save'}
                                </Typography>
                            </TouchableOpacity>
                        )}
                        <UnitChip unit={selectedUnitLabel} onPress={() => setUnitOpen(true)} />
                        {/* anchor ref so the dropdown knows where to position itself */}
                        <View ref={moreButtonRef} collapsable={false}>
                            <TouchableOpacity
                                onPress={() => setMenuOpen(true)}
                                hitSlop={8}
                                style={styles.iconBtn}
                                activeOpacity={0.7}
                            >
                                <IconSymbol size={24} name="ellipsis" color={colors.text} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* ── Field List ── */}
                {fields.length === 0 ? (
                    <View style={{ flex: 1 }}>
                        <EmptyState />
                    </View>
                ) : (
                    <View style={{ flex: 1, paddingHorizontal: Spacing.xs}}>
                        <FlatList
                            data={fields}
                            renderItem={renderMeasurementItem}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={{ flexGrow: 1 }}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        />
                    </View>
                )}

                {/* ── FABs (bottom-right, stacked) ── */}
                <View style={styles.fabGroup}>
                    <FAB
                        icon="list.bullet"
                        onPress={() => presetBottomSheetRef.current?.snapToIndex(0)}
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

            {/* ── Preset Field Bottom Sheet ── */}
            <AppBottomSheet
                ref={presetBottomSheetRef}
                snapPoints={['50%', '75%']}
                title="Add Preset Field"
                scrollable
            >
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
            </AppBottomSheet>

            {/* ── Save Template Modal ── */}
            <AppModal
                visible={saveTemplateOpen}
                onClose={() => { setSaveTemplateOpen(false); setTemplateName(''); }}
                title="Save Template"
                description="Give your template a name"
                size="md"
            >
                <AppInput
                    placeholder="e.g. Shirt measurements"
                    value={templateName}
                    onChangeText={setTemplateName}
                    onSubmitEditing={saveTemplateToDb}
                    returnKeyType="done"
                    autoFocus
                    autoCapitalize="words"
                />
                <GlassButton
                    variant="primary"
                    label="Save Template"
                    fullWidth
                    onPress={saveTemplateToDb}
                    disabled={!templateName.trim() || fields.length === 0}
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
        paddingHorizontal: Spacing.md,
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
    saveBtn: {
        paddingHorizontal: Spacing.md,
        paddingVertical: 6,
        borderRadius: BorderRadius.full,
    },
    datePickerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.sm + 2,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        gap: Spacing.sm,
    },
    notesInput: {
        padding: Spacing.sm + 2,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        fontSize: 15,
        textAlignVertical: 'top',
        minHeight: 80,
    },
    summaryCard: {
        padding: Spacing.sm + 2,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        alignItems: 'center',
    },
});