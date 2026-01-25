import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure how notifications are handled when the app is foregrounded
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

class NotificationService {
    async registerForPushNotificationsAsync() {
        if (!Device.isDevice) {
            console.log('[NotificationService] Skipping push token: Not a physical device');
            return 'simulated_token_for_dev'; // Return a mock token to allow testing UI on simulator
        }

        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.warn('[NotificationService] Failed to get push token: Permission denied');
                return null;
            }

            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'Default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                });
            }

            const projectId =
                Constants.expoConfig?.extra?.eas?.projectId ??
                Constants.easConfig?.projectId ??
                '19bbbaf9-a86c-4106-a298-1321f61271df';

            const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
            console.log('[NotificationService] Push Token:', token);
            return token;
        } catch (e) {
            console.error('[NotificationService] Registration Error:', e);
            return null;
        }
    }

    async scheduleHealthReminder(title: string, body: string, hour: number, minute: number) {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    sound: true,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                    hour,
                    minute,
                    repeats: true,
                },
            });
        } catch (e) {
            console.error('[NotificationService] Schedule Error:', e);
        }
    }

    async scheduleMorningReadiness(readinessScore: number) {
        let body = `Your readiness score is ${readinessScore} today. Let's make it a great one!`;
        if (readinessScore > 90) body = `Peak Performance! Your readiness is ${readinessScore}. Perfect day for a challenge.`;
        else if (readinessScore < 60) body = `Recovery Day. Your readiness is ${readinessScore}. Take it easy today.`;

        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Morning Readiness",
                    body,
                    sound: true,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                    hour: 8,
                    minute: 0,
                    repeats: true,
                },
            });
        } catch (e) {
            console.error('[NotificationService] Readiness Schedule Error:', e);
        }
    }

    async cancelAllNotifications() {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }
}

export const notificationService = new NotificationService();
