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

    async checkDailyGoals(data: any, goals: any[]) { // Using 'any' for goals to avoid circular dependency, but logically it's Goal[]
        if (!data || !goals) return;

        // Find relevant goals
        const stepsGoal = goals.find(g => g.title.toLowerCase().includes('steps'));
        const sleepGoal = goals.find(g => g.title.toLowerCase().includes('sleep'));

        // Check Steps
        if (stepsGoal && data.steps?.count >= stepsGoal.target && stepsGoal.target > 0) {
            // In a real app, check if we already notified for this specific goal today
            await this.scheduleImmediateNotification(
                "Goal Reached! 🏆",
                `Congratulations! You've hit your daily goal of ${stepsGoal.target} steps.`
            );
        }

        // Check Sleep Score
        if (sleepGoal && data.sleep?.score >= sleepGoal.target && sleepGoal.target > 0) {
            const currentHour = new Date().getHours();
            // Only notify in the morning
            if (currentHour >= 8 && currentHour <= 11) {
                await this.scheduleImmediateNotification(
                    "Great Sleep! 🌙",
                    `You achieved your sleep quality goal with a score of ${data.sleep.score}.`
                );
            }
        }
    }

    async scheduleImmediateNotification(title: string, body: string) {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    sound: true,
                },
                trigger: null, // Send immediately
            });
        } catch (e) {
            console.error('[NotificationService] Immediate Notification Error:', e);
        }
    }

    async cancelAllNotifications() {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }
}

export const notificationService = new NotificationService();
