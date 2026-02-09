import { Platform, Alert } from 'react-native';
import type { HealthKitPermissions } from 'react-native-health';

// Using require to bypass some TypeScript/Metro import mangling issues with native modules
const AppleHealthKit = require('react-native-health').default || require('react-native-health');

const permissions = {
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
} as HealthKitPermissions;

class AppleHealthService {
    isAvailable: boolean;

    constructor() {
        this.isAvailable = false;
    }

    init(): Promise<boolean> {
        if (Platform.OS !== 'ios') {
            console.log('[AppleHealth] Not available on this platform');
            return Promise.resolve(false);
        }

        // Defensive check for initialization function
        // Some RN modules hide functions under .default depending on build setup
        const initFn = AppleHealthKit.initHealthKit || (AppleHealthKit as any).default?.initHealthKit;

        if (typeof initFn !== 'function') {
            console.log('[AppleHealth] CRITICAL: initHealthKit is not a function at runtime!');
            console.log('[AppleHealth] Available keys:', Object.keys(AppleHealthKit));
            if ((AppleHealthKit as any).default) {
                console.log('[AppleHealth] Default keys:', Object.keys((AppleHealthKit as any).default));
            }
            return Promise.resolve(false);
        }

        return new Promise<boolean>((resolve) => {
            initFn(permissions, (error: string) => {
                if (error) {
                    console.log('[AppleHealth] Error initializing HealthKit:', error);
                    this.isAvailable = false;
                    resolve(false);
                    return;
                }
                this.isAvailable = true;
                console.log('[AppleHealth] Successfully initialized');
                resolve(true);
            });
        });
    }

    saveWorkout(
        type: string,
        startDate: Date,
        endDate: Date,
        calories: number
    ): Promise<boolean> {
        if (!this.isAvailable) {
            console.log('[AppleHealth] Service not available');
            return Promise.resolve(false);
        }

        const options = {
            type: 'Fitness',
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            energyBurned: calories,
            energyBurnedUnit: 'cal',
        };

        return new Promise<boolean>((resolve) => {
            AppleHealthKit.saveWorkout(options, (err: any) => {
                if (err) {
                    console.log('[AppleHealth] Error saving workout:', err);
                    resolve(false);
                    return;
                }
                console.log('[AppleHealth] Workout saved successfully');
                resolve(true);
            });
        });
    }
}

export const appleHealthService = new AppleHealthService();
