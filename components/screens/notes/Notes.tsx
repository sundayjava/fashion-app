import { ScreenWrapper, Typography } from "@/components/ui";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Palette } from "@/constants/colors";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useAppTheme } from "@/context/ThemeContext";
import { dbService, MeasurementRecord } from "@/services/database";
import { MeasurementField } from "@/types";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    Platform,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";

export const Notes = () => {
    const router = useRouter();
    const { colors, isDark } = useAppTheme();

    const [ownedMeasurements, setOwnedMeasurements] = useState<MeasurementRecord[]>([]);
    const [sharedMeasurements, setSharedMeasurements] = useState<MeasurementRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Load measurements when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadMeasurements();
        }, [])
    );

    const loadMeasurements = async () => {
        try {
            setLoading(true);
            const allMeasurements = await dbService.getAllMeasurements();

            // For now, all measurements are "owned" until we implement user authentication
            // Later: filter based on sharedWith and isPublic fields
            setOwnedMeasurements(allMeasurements);
            setSharedMeasurements([]); // Placeholder for shared measurements
        } catch (error) {
            console.error('Failed to load measurements:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load measurements',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadMeasurements();
        setRefreshing(false);
    };

    const handleEdit = (measurement: MeasurementRecord) => {
        // Navigate to add-note screen with measurement ID for editing
        router.push(`/(app)/(notes)/add-note?id=${measurement.id}`);
    };

    const handleDelete = (measurement: MeasurementRecord) => {
        Alert.alert(
            'Delete Measurement',
            `Are you sure you want to delete "${measurement.clientName}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await dbService.deleteMeasurement(measurement.id);
                            Toast.show({
                                type: 'success',
                                text1: 'Deleted',
                                text2: `"${measurement.clientName}" has been deleted`,
                            });
                            loadMeasurements();
                        } catch (error) {
                            Toast.show({
                                type: 'error',
                                text1: 'Error',
                                text2: 'Failed to delete measurement',
                            });
                        }
                    },
                },
            ]
        );
    };

    const renderMeasurementCard = ({ item }: { item: MeasurementRecord }) => {
        const fields: MeasurementField[] = JSON.parse(item.fields);
        const fieldCount = fields.length;
        const filledCount = fields.filter(f => f.value).length;
        const isCompleted = item.isCompleted;

        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleEdit(item)}
                style={[
                    styles.measurementCard,
                    {
                        backgroundColor: colors.surface,
                        borderColor: isCompleted ? Palette.success + '40' : colors.border,
                    },
                ]}
            >
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <View style={{ flex: 1 }}>
                            <Typography variant="body" weight="semiBold" color={colors.text}>
                                {item.clientName}
                            </Typography>
                            <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                                {filledCount}/{fieldCount} fields • {item.unit}
                            </Typography>
                        </View>
                        {isCompleted && (
                            <View style={[styles.badge, { backgroundColor: Palette.success + '18' }]}>
                                <IconSymbol size={12} name="checkmark" color={Palette.success} />
                                <Typography variant="caption" weight="semiBold" color={Palette.success}>
                                    Done
                                </Typography>
                            </View>
                        )}
                    </View>

                    {item.imageUri && (
                        <Image
                            source={{ uri: item.imageUri }}
                            style={styles.cardImage}
                            resizeMode="cover"
                        />
                    )}

                    {item.notes && (
                        <Typography
                            variant="caption"
                            color={colors.textSecondary}
                            style={{ marginTop: Spacing.xs }}
                            numberOfLines={2}
                        >
                            {item.notes}
                        </Typography>
                    )}

                    <View style={styles.cardFooter}>
                        <Typography variant="caption" color={colors.textTertiary}>
                            {new Date(item.updatedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </Typography>
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation();
                                handleDelete(item);
                            }}
                            hitSlop={8}
                            style={styles.deleteBtn}
                        >
                            <IconSymbol size={16} name="trash" color={Palette.error} />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: Palette.primary + '14' }]}>
                <IconSymbol size={36} name={'ruler' as any} color={Palette.primary} />
            </View>
            <Typography variant="h4" color={colors.text} style={{ marginTop: Spacing.md, textAlign: 'center' }}>
                No measurements yet
            </Typography>
            <Typography variant="body" color={colors.textSecondary} style={{ marginTop: Spacing.xs, textAlign: 'center', maxWidth: 260 }}>
                Start creating measurements for your clients
            </Typography>
        </View>
    );

    const renderSection = (title: string, data: MeasurementRecord[]) => {
        if (data.length === 0) return null;

        return (
            <View style={styles.section}>
                <Typography variant="h4" color={colors.text} style={styles.sectionTitle}>
                    {title}
                </Typography>
                <FlatList
                    data={data}
                    renderItem={renderMeasurementCard}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    scrollEnabled={false}
                />
            </View>
        );
    };

    return (
        <ScreenWrapper
            padded={false}
            keyboardAvoiding
            keyboardVerticalOffset={Platform.OS === 'android' ? 20 : 0}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Typography variant="h3" color={colors.text}>
                        Measurements
                    </Typography>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
                        <TouchableOpacity
                            onPress={() => router.push('/(app)/(notes)/add-note')}
                            activeOpacity={0.8}
                            style={[styles.addBtn, { backgroundColor: Palette.primary }]}
                        >
                            <IconSymbol size={20} name="plus" color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push('/(app)/(notes)/load-template')}
                            activeOpacity={0.8}
                            style={[styles.addBtn, { backgroundColor: Palette.primary }]}
                        >
                            <IconSymbol size={20} name="square.and.arrow.up" color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Measurements List */}
                <FlatList
                    data={[]}
                    renderItem={() => null}
                    ListHeaderComponent={
                        <>
                            {loading ? (
                                <View style={styles.loadingState}>
                                    <Typography variant="body" color={colors.textSecondary}>
                                        Loading measurements...
                                    </Typography>
                                </View>
                            ) : ownedMeasurements.length === 0 && sharedMeasurements.length === 0 ? (
                                renderEmptyState()
                            ) : (
                                <>
                                    {renderSection('Your Measurements', ownedMeasurements)}
                                    {renderSection('Shared with You', sharedMeasurements)}
                                </>
                            )}
                        </>
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={colors.textSecondary}
                        />
                    }
                    contentContainerStyle={styles.scrollContent}
                />
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Spacing.sm,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.md,
    },
    addBtn: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        paddingBottom: Spacing.xl,
    },
    section: {
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.sm,
    },
    listContent: {
        gap: Spacing.sm,
        paddingHorizontal: Spacing.md,
    },
    measurementCard: {
        borderRadius: BorderRadius.lg,
        borderWidth: 1.5,
        overflow: 'hidden',
    },
    cardContent: {
        padding: Spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
    },
    cardImage: {
        width: '100%',
        height: 120,
        marginTop: Spacing.sm,
        borderRadius: BorderRadius.md,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: Spacing.xs,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: Spacing.sm,
    },
    deleteBtn: {
        padding: 4,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.xl * 2,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xl * 2,
    },
});