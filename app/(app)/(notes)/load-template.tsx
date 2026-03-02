import { BackButton, ScreenWrapper, Typography } from "@/components/ui";
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette } from "@/constants/colors";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useAppTheme } from "@/context/ThemeContext";
import { dbService } from "@/services/database";
import { useMeasurementStore } from "@/stores/measurementStore";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert, FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";

interface TemplateRecord {
    id: number;
    name: string;
    fields: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function LoadTemplateScreen() {
    const { colors } = useAppTheme();
    const router = useRouter();
    const { setFields } = useMeasurementStore();

    const [availableTemplates, setAvailableTemplates] = useState<TemplateRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAvailableTemplates();
    }, []);

    const loadAvailableTemplates = async () => {
        try {
            setLoading(true);
            const templates = await dbService.getAllTemplates();
            setAvailableTemplates(templates);
        } catch (error) {
            console.error('Failed to load templates:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load templates',
            });
        } finally {
            setLoading(false);
        }
    };

    const loadTemplateFromDb = async (templateId: number) => {
        try {
            const template = availableTemplates.find(t => t.id === templateId);
            if (template) {
                const fieldNames = JSON.parse(template.fields);
                const newFields = fieldNames.map((name: string) => ({
                    id: Date.now().toString() + Math.random(),
                    name,
                    value: '',
                }));
                setFields(newFields);
                Toast.show({
                    type: 'success',
                    text1: 'Template loaded',
                    text2: `"${template.name}" loaded successfully`,
                });
                // Navigate to measurement screen instead of going back
                router.push('/(app)/(notes)/add-note');
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load template',
            });
        }
    };

    const handleDeleteTemplate = (template: TemplateRecord) => {
        Alert.alert(
            'Delete Template',
            `Are you sure you want to delete "${template.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await dbService.deleteTemplate(template.id);
                            Toast.show({
                                type: 'success',
                                text1: 'Deleted',
                                text2: `"${template.name}" has been deleted`,
                            });
                            loadAvailableTemplates();
                        } catch (error) {
                            Toast.show({
                                type: 'error',
                                text1: 'Error',
                                text2: 'Failed to delete template',
                            });
                        }
                    },
                },
            ]
        );
    };

    const renderTemplateItem = ({ item }: { item: TemplateRecord }) => {
        const fieldCount = JSON.parse(item.fields).length;

        return (
            <TouchableOpacity
                onPress={() => loadTemplateFromDb(item.id)}
                activeOpacity={0.7}
                style={[
                    styles.templateCard,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                    }
                ]}>
                    
                <View style={{ flex: 1 }}>
                    <Typography variant="body" weight="semiBold" color={colors.text}>
                        {item.name}
                    </Typography>
                    <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: 4 }}>
                        {fieldCount} field{fieldCount !== 1 ? 's' : ''}
                    </Typography>
                </View>
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        onPress={(e) => {
                            e.stopPropagation();
                            handleDeleteTemplate(item);
                        }}
                        hitSlop={8}
                        style={styles.deleteBtn}
                    >
                        <IconSymbol size={18} name="trash" color={Palette.error} />
                    </TouchableOpacity>
                    <IconSymbol size={20} name={'chevron.right' as any} color={colors.textTertiary} />
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: Palette.primary + '14' }]}>
                <IconSymbol size={36} name={'doc.text' as any} color={Palette.primary} />
            </View>
            <Typography variant="h4" color={colors.text} style={{ marginTop: Spacing.md, textAlign: 'center' }}>
                No templates yet
            </Typography>
            <Typography variant="body" color={colors.textSecondary} style={{ marginTop: Spacing.xs, textAlign: 'center', maxWidth: 260 }}>
                Create templates from your measurements to reuse them later
            </Typography>
        </View>
    );

    return (
        <ScreenWrapper padded={false}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <BackButton onPress={() => router.back()} />
                    <Typography variant="h4">Template</Typography>
                    <View style={{ width: 40 }} />
                </View>

                {/* Templates List */}
                {loading ? (
                    <View style={styles.emptyState}>
                        <Typography variant="body" color={colors.textSecondary}>
                            Loading templates...
                        </Typography>
                    </View>
                ) : (
                    <FlatList
                        data={availableTemplates}
                        renderItem={renderTemplateItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={[
                            styles.listContent,
                            availableTemplates.length === 0 && styles.listContentEmpty
                        ]}
                        ListEmptyComponent={renderEmptyState}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Spacing.sm,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.md,
        paddingHorizontal: Spacing.md,
    },
    listContent: {
        padding: Spacing.md,
        gap: Spacing.sm,
    },
    listContentEmpty: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    templateCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1.5,
        gap: Spacing.sm,
    },
    defaultBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.xs,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
        marginTop: Spacing.xs,
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    deleteBtn: {
        padding: 4,
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
});
