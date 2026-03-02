/**
 * Notification Service
 * Handles scheduling and managing notifications for measurement reminders
 * 
 * Note: This service lazy-loads expo-notifications to avoid errors in Expo Go
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Lazy-loaded modules
let Notifications: typeof import('expo-notifications') | null = null;

// Flag to track if we've already tried and failed to load notifications
let hasTriedLoading = false;
let loadingFailed = false;

/**
 * Check if running in Expo Go
 */
function isExpoGo(): boolean {
    return Constants.appOwnership === 'expo';
}

/**
 * Lazy load expo-notifications module
 */
async function loadNotifications() {
    // Don't even try to load in Expo Go on Android
    if (isExpoGo() && Platform.OS === 'android') {
        if (!loadingFailed) {
            console.log('ℹ️ Notifications not available in Expo Go on Android. Use a development build for notification support.');
            loadingFailed = true;
        }
        return null;
    }

    // If we've already tried and failed, don't try again
    if (loadingFailed) {
        return null;
    }

    if (!Notifications && !hasTriedLoading) {
        hasTriedLoading = true;
        try {
            Notifications = await import('expo-notifications');

            // Configure notification behavior after loading
            Notifications.setNotificationHandler({
                handleNotification: async () => ({
                    shouldShowAlert: true,
                    shouldPlaySound: true,
                    shouldSetBadge: true,
                    shouldShowBanner: true,
                    shouldShowList: true,
                }),
            });
            
            console.log('✅ Notifications module loaded successfully');
        } catch (error) {
            loadingFailed = true;
            console.log('ℹ️ Notifications not available. Use a development build for notification support.');
            return null;
        }
    }
    return Notifications;
}

class NotificationService {
    private isInitialized = false;

    /**
     * Request notification permissions and initialize
     */
    async initialize(): Promise<boolean> {
        if (this.isInitialized) return true;

        try {
            const NotificationsModule = await loadNotifications();
            if (!NotificationsModule) {
                console.warn('Notifications module not available (possibly running in Expo Go)');
                return false;
            }

            const { status: existingStatus } = await NotificationsModule.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await NotificationsModule.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.warn('Notification permission not granted');
                return false;
            }

            // Android specific channel configuration
            if (Platform.OS === 'android') {
                await NotificationsModule.setNotificationChannelAsync('measurement-reminders', {
                    name: 'Measurement Reminders',
                    importance: NotificationsModule.AndroidImportance.HIGH,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                    sound: 'default',
                });
            }

            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('Failed to initialize notifications:', error);
            return false;
        }
    }

    /**
     * Schedule a reminder notification for a measurement
     */
    async scheduleMeasurementReminder(
        measurementId: number,
        clientName: string,
        reminderDate: Date
    ): Promise<string | null> {
        try {
            const hasPermission = await this.initialize();
            if (!hasPermission) {
                console.warn('Cannot schedule notification: no permission');
                return null;
            }

            const NotificationsModule = await loadNotifications();
            if (!NotificationsModule) return null;

            // Cancel any existing notification for this measurement
            await this.cancelMeasurementReminder(measurementId);

            const now = new Date();
            if (reminderDate <= now) {
                console.warn('Reminder date is in the past');
                return null;
            }

            // Calculate seconds until reminder date
            const secondsUntilReminder = Math.floor((reminderDate.getTime() - now.getTime()) / 1000);

            const notificationId = await NotificationsModule.scheduleNotificationAsync({
                content: {
                    title: '📏 Measurement Reminder',
                    body: `Time to follow up on measurements for ${clientName}`,
                    data: {
                        measurementId,
                        type: 'measurement_reminder',
                        clientName,
                    },
                    sound: 'default',
                    categoryIdentifier: 'measurement-reminders',
                },
                trigger: {
                    type: NotificationsModule.SchedulableTriggerInputTypes.TIME_INTERVAL,
                    seconds: secondsUntilReminder,
                },
            });

            // Store the notification ID for later cancellation
            await this.storeNotificationId(measurementId, notificationId);

            console.log(`Scheduled notification ${notificationId} for ${clientName} at ${reminderDate}`);
            return notificationId;
        } catch (error) {
            console.error('Failed to schedule notification:', error);
            return null;
        }
    }

    /**
     * Cancel a measurement reminder notification
     */
    async cancelMeasurementReminder(measurementId: number): Promise<void> {
        try {
            const NotificationsModule = await loadNotifications();
            if (!NotificationsModule) return;

            const notificationId = await this.getNotificationId(measurementId);
            if (notificationId) {
                await NotificationsModule.cancelScheduledNotificationAsync(notificationId);
                await this.removeNotificationId(measurementId);
                console.log(`Cancelled notification for measurement ${measurementId}`);
            }
        } catch (error) {
            console.error('Failed to cancel notification:', error);
        }
    }

    /**
     * Cancel all pending notifications
     */
    async cancelAllNotifications(): Promise<void> {
        try {
            const NotificationsModule = await loadNotifications();
            if (!NotificationsModule) return;

            await NotificationsModule.cancelAllScheduledNotificationsAsync();
            console.log('Cancelled all notifications');
        } catch (error) {
            console.error('Failed to cancel all notifications:', error);
        }
    }

    /**
     * Get all scheduled notifications
     */
    async getAllScheduledNotifications(): Promise<any[]> {
        try {
            const NotificationsModule = await loadNotifications();
            if (!NotificationsModule) return [];

            return await NotificationsModule.getAllScheduledNotificationsAsync();
        } catch (error) {
            console.error('Failed to get scheduled notifications:', error);
            return [];
        }
    }

    /**
     * Store notification ID for a measurement (in AsyncStorage)
     */
    private async storeNotificationId(measurementId: number, notificationId: string): Promise<void> {
        try {
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
            await AsyncStorage.setItem(
                `@notification_id_${measurementId}`,
                notificationId
            );
        } catch (error) {
            console.error('Failed to store notification ID:', error);
        }
    }

    /**
     * Get stored notification ID for a measurement
     */
    private async getNotificationId(measurementId: number): Promise<string | null> {
        try {
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
            return await AsyncStorage.getItem(`@notification_id_${measurementId}`);
        } catch (error) {
            console.error('Failed to get notification ID:', error);
            return null;
        }
    }

    /**
     * Remove stored notification ID
     */
    private async removeNotificationId(measurementId: number): Promise<void> {
        try {
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
            await AsyncStorage.removeItem(`@notification_id_${measurementId}`);
        } catch (error) {
            console.error('Failed to remove notification ID:', error);
        }
    }

    /**
     * Set up notification listeners
     */
    async setupListeners(
        onNotificationReceived?: (notification: any) => void,
        onNotificationResponse?: (response: any) => void
    ) {
        try {
            const NotificationsModule = await loadNotifications();
            if (!NotificationsModule) {
                console.warn('Cannot set up listeners: Notifications module not available');
                return () => {};
            }

            // Handle notification received while app is foregrounded
            const receivedSubscription = NotificationsModule.addNotificationReceivedListener((notification) => {
                console.log('Notification received:', notification);
                onNotificationReceived?.(notification);
            });

            // Handle user interaction with notification
            const responseSubscription = NotificationsModule.addNotificationResponseReceivedListener((response) => {
                console.log('Notification response:', response);
                const data = response.notification.request.content.data as { measurementId?: number; type?: string; clientName?: string } | undefined;
                onNotificationResponse?.(response);

                // Navigate to measurement details if measurement ID is present
                if (data?.measurementId) {
                    // TODO: Implement navigation to measurement details
                    console.log('Navigate to measurement:', data.measurementId);
                }
            });

            return () => {
                receivedSubscription.remove();
                responseSubscription.remove();
            };
        } catch (error) {
            console.error('Failed to set up listeners:', error);
            return () => {};
        }
    }
}

// Export singleton instance
export const notificationService = new NotificationService();

/**
 * Usage example:
 * 
 * // Initialize in App.tsx:
 * await notificationService.initialize();
 * 
 * // Schedule a reminder:
 * await notificationService.scheduleMeasurementReminder(
 *     measurementId,
 *     'John Doe',
 *     new Date('2024-12-25')
 * );
 * 
 * // Cancel a reminder:
 * await notificationService.cancelMeasurementReminder(measurementId);
 * 
 * // Set up listeners:
 * notificationService.setupListeners(
 *     (notification) => console.log('Received:', notification),
 *     (response) => console.log('User tapped:', response)
 * );
 */
