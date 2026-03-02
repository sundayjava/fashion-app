import { BackButton, GlassButton, ScreenWrapper, Typography } from "@/components/ui";
import { AppInput } from "@/components/ui/Input";
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette } from "@/constants/colors";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useAppTheme } from "@/context/ThemeContext";
import { dbService } from "@/services/database";
import { notificationService } from "@/services/notifications";
import { useMeasurementStore } from "@/stores/measurementStore";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Image,
    Keyboard,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function SaveMeasurementScreen() {
    const { colors, isDark } = useAppTheme();
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const measurementId = id ? parseInt(id, 10) : undefined;
    
    // Get fields and unit from Zustand store
    const { fields, unit, reset } = useMeasurementStore();

    const [clientName, setClientName] = useState('');
    const [reminderDate, setReminderDate] = useState<Date | undefined>();
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [notes, setNotes] = useState('');
    const [imageUri, setImageUri] = useState<string | undefined>();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);

    // Load existing measurement data if editing
    useEffect(() => {
        if (measurementId) {
            loadMeasurementData(measurementId);
        }
    }, [measurementId]);

    const loadMeasurementData = async (id: number) => {
        try {
            setLoading(true);
            const measurement = await dbService.getMeasurement(id);
            if (measurement) {
                setClientName(measurement.clientName);
                setNotes(measurement.notes || '');
                setImageUri(measurement.imageUri);
                if (measurement.reminderDate) {
                    setReminderDate(new Date(measurement.reminderDate));
                }
            }
        } catch (error) {
            console.error('Failed to load measurement data:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load measurement data',
            });
        } finally {
            setLoading(false);
        }
    };

    // Format date for display
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        if (selectedDate) {
            setReminderDate(selectedDate);
        }
    };

    const pickImage = async () => {
        try {
            // Request permission
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if (!permissionResult.granted) {
                Alert.alert('Permission Required', 'Please allow access to your photos to add an image.');
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8, // Compress for storage
            });

            if (!result.canceled && result.assets[0]) {
                setImageUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to pick image',
            });
        }
    };

    const takePhoto = async () => {
        try {
            // Request permission
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            
            if (!permissionResult.granted) {
                Alert.alert('Permission Required', 'Please allow access to your camera to take a photo.');
                return;
            }

            // Launch camera
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setImageUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to take photo',
            });
        }
    };

    const selectImageSource = () => {
        Alert.alert(
            'Add Photo',
            'Choose how you want to add a photo',
            [
                {
                    text: 'Take Photo',
                    onPress: takePhoto,
                },
                {
                    text: 'Choose from Library',
                    onPress: pickImage,
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ]
        );
    };

    const handleSave = async () => {
        if (!clientName.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Required',
                text2: 'Please enter client name',
            });
            return;
        }

        if (fields.length === 0) {
            Toast.show({
                type: 'error',
                text1: 'No fields',
                text2: 'Please add measurement fields first',
            });
            return;
        }

        setSaving(true);

        try {
            const savedId = await dbService.saveMeasurement(
                fields,
                unit,
                clientName.trim(),
                reminderDate?.toISOString(),
                notes.trim() || undefined,
                imageUri,
                measurementId // Pass ID for updates
            );

            // Schedule notification if reminder date is set
            if (reminderDate) {
                const notificationId = await notificationService.scheduleMeasurementReminder(
                    savedId,
                    clientName.trim(),
                    reminderDate
                );

                if (notificationId) {
                    Toast.show({
                        type: 'success',
                        text1: measurementId ? 'Updated & Reminder Set' : 'Saved & Reminder Set',
                        text2: `Reminder set for ${formatDate(reminderDate)}`,
                    });
                } else {
                    Toast.show({
                        type: 'info',
                        text1: 'Saved',
                        text2: 'Notification unavailable in Expo Go. Use a development build for reminders.',
                    });
                }
            } else {
                Toast.show({
                    type: 'success',
                    text1: measurementId ? 'Measurement updated' : 'Measurement saved',
                    text2: `${measurementId ? 'Updated' : 'Saved'} for ${clientName}`,
                });
            }

            // Clear store
            reset();

            // Navigate back (will go to measurements list)
            router.back();
            router.back(); // Go back twice to return to list
        } catch (error) {
            console.error('Failed to save measurement:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to save measurement',
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScreenWrapper padded={false}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    {/* ── Header ── */}
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <BackButton onPress={() => router.back()} />
                        <Typography variant="h4">{measurementId ? 'Update' : 'Save'} Measurement</Typography>
                        <View style={{ width: 32 }} />
                    </View>

                    <ScrollView 
                        style={styles.content}
                        contentContainerStyle={styles.contentContainer}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Client Name */}
                        <View style={styles.section}>
                            <Typography variant="body" weight="semiBold" style={styles.label}>
                                Client Name <Typography variant="body" color={Palette.error}>*</Typography>
                            </Typography>
                            <AppInput
                                placeholder="Enter client name"
                                value={clientName}
                                onChangeText={setClientName}
                                autoFocus
                                autoCapitalize="words"
                                returnKeyType="next"
                            />
                        </View>

                        {/* Reminder Date */}
                        <View style={styles.section}>
                            <Typography variant="body" weight="semiBold" style={styles.label}>
                                Reminder Date (Optional)
                            </Typography>
                            
                            <TouchableOpacity
                                onPress={() => {
                                    Keyboard.dismiss();
                                    setShowDatePicker(true);
                                }}
                                style={[styles.dateButton, { 
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border,
                                }]}
                                activeOpacity={0.7}
                            >
                                <IconSymbol size={20} name="calendar" color={colors.textSecondary} />
                                <Typography 
                                    variant="body" 
                                    color={reminderDate ? colors.text : colors.textTertiary}
                                    style={{ flex: 1, marginLeft: Spacing.sm }}
                                >
                                    {reminderDate ? formatDate(reminderDate) : 'Select a date'}
                                </Typography>
                                {reminderDate && (
                                    <TouchableOpacity
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            setReminderDate(undefined);
                                        }}
                                        hitSlop={8}
                                    >
                                        <IconSymbol size={16} name="xmark.circle.fill" color={colors.textTertiary} />
                                    </TouchableOpacity>
                                )}
                            </TouchableOpacity>

                            {showDatePicker && (
                                <View style={styles.datePickerContainer}>
                                    <DateTimePicker
                                        value={reminderDate || new Date()}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'inline' : 'default'}
                                        onChange={handleDateChange}
                                        minimumDate={new Date()}
                                        themeVariant={isDark ? 'dark' : 'light'}
                                    />
                                    {Platform.OS === 'ios' && (
                                        <GlassButton
                                            variant="primary"
                                            label="Done"
                                            onPress={() => setShowDatePicker(false)}
                                            style={{ marginTop: Spacing.sm }}
                                        />
                                    )}
                                </View>
                            )}
                        </View>

                        {/* Cloth Image */}
                        <View style={styles.section}>
                            <Typography variant="body" weight="semiBold" style={styles.label}>
                                Cloth Image (Optional)
                            </Typography>
                            
                            {imageUri ? (
                                <View style={styles.imageContainer}>
                                    <Image 
                                        source={{ uri: imageUri }} 
                                        style={styles.image}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.imageOverlay}>
                                        <TouchableOpacity
                                            onPress={() => setImageUri(undefined)}
                                            style={[styles.imageButton, { backgroundColor: Palette.error }]}
                                            activeOpacity={0.8}
                                        >
                                            <IconSymbol size={16} name="trash" color="#fff" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={selectImageSource}
                                            style={[styles.imageButton, { backgroundColor: Palette.primary }]}
                                            activeOpacity={0.8}
                                        >
                                            <IconSymbol size={16} name="arrow.triangle.2.circlepath" color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    onPress={selectImageSource}
                                    style={[styles.imagePickerButton, { 
                                        backgroundColor: colors.surface,
                                        borderColor: colors.border,
                                    }]}
                                    activeOpacity={0.7}
                                >
                                    <IconSymbol size={32} name="camera" color={colors.textSecondary} />
                                    <Typography variant="body" color={colors.textSecondary} style={{ marginTop: Spacing.xs }}>
                                        Add photo of cloth
                                    </Typography>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Notes */}
                        <View style={styles.section}>
                            <Typography variant="body" weight="semiBold" style={styles.label}>
                                Notes (Optional)
                            </Typography>
                            <AppInput
                                placeholder="Add any additional notes..."
                                value={notes}
                                onChangeText={setNotes}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                returnKeyType="done"
                                blurOnSubmit
                            />
                        </View>
                    </ScrollView>

                    {/* Save Button */}
                    <View style={[styles.footer, { 
                        backgroundColor: colors.background,
                        borderTopColor: colors.border 
                    }]}>
                        <GlassButton
                            variant="primary"
                            label={saving ? "Saving..." : "Save Measurement"}
                            onPress={handleSave}
                            disabled={!clientName.trim() || saving}
                            fullWidth
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: Spacing.md,
        paddingBottom: Spacing.xl * 2,
    },
    section: {
        marginBottom: Spacing.lg,
    },
    label: {
        marginBottom: Spacing.xs,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
    },
    datePickerContainer: {
        marginTop: Spacing.sm,
        alignItems: 'center',
    },
    imagePickerButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xl * 2,
        borderRadius: BorderRadius.lg,
        borderWidth: 2,
        borderStyle: 'dashed',
    },
    imageContainer: {
        position: 'relative',
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: BorderRadius.lg,
    },
    imageOverlay: {
        position: 'absolute',
        top: Spacing.sm,
        right: Spacing.sm,
        flexDirection: 'row',
        gap: Spacing.xs,
    },
    imageButton: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    footer: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        borderTopWidth: 1,
    },
});
