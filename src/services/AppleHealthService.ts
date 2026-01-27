import AppleHealthKit, {
    HealthValue,
    HealthKitPermissions,
} from 'react-native-health';
import { Platform } from 'react-native';

const permissions: HealthKitPermissions = {
    permissions: {
        read: [
            AppleHealthKit.Constants.Permissions.HeartRate,
            AppleHealthKit.Constants.Permissions.Steps,
            AppleHealthKit.Constants.Permissions.SleepAnalysis,
        ],
        write: [
            AppleHealthKit.Constants.Permissions.Workout,
        ],
    },
};

class AppleHealthService {
    isAvailable = false;

    async init() {
        if (Platform.OS !== 'ios') return false;

        return new Promise<boolean>((resolve) => {
            AppleHealthKit.initHealthKit(permissions, (error: string) => {
                if (error) {
                    console.log('[AppleHealth] Error initializing HealthKit: ', error);
                    resolve(false);
                    return;
                }
                this.isAvailable = true;
                resolve(true);
            });
        });
    }

    async saveWorkout(type: string, startDate: Date, endDate: Date, calories: number) {
        if (!this.isAvailable) return;

        const options = {
            type: 'Fitness', // Generic for now, ideally map 'run' -> 'Running', 'yoga' -> 'Yoga'
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            energyBurned: calories,
            energyBurnedUnit: 'cal',
        };

        return new Promise((resolve, reject) => {
            AppleHealthKit.saveWorkout(options, (err: Object, res: Object) => {
                if (err) {
                    console.log('[AppleHealth] Error saving workout:', err);
                    resolve(false);
                    return;
                }
                resolve(true);
            });
        });
    }
}

export const appleHealthService = new AppleHealthService();
