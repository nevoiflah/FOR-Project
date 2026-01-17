import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Helper to prevent crashes on web or unsupported platforms
const isHapticsSupported = Platform.OS === 'ios' || Platform.OS === 'android';

export const HapticFeedback = {
    light: () => {
        if (isHapticsSupported) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    },
    medium: () => {
        if (isHapticsSupported) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
    },
    heavy: () => {
        if (isHapticsSupported) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
    },
    success: () => {
        if (isHapticsSupported) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    },
    error: () => {
        if (isHapticsSupported) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    },
    selection: () => {
        if (isHapticsSupported) {
            Haptics.selectionAsync();
        }
    }
};
