declare module 'react-native-health' {
    export interface HealthValue {
        value: number;
        startDate: string;
        endDate: string;
    }

    export interface HealthKitPermissions {
        permissions: {
            read: string[];
            write: string[];
        };
    }

    export const Constants: {
        Permissions: {
            HeartRate: string;
            Steps: string;
            SleepAnalysis: string;
            Workout: string;
        };
    };

    export function initHealthKit(
        permissions: HealthKitPermissions,
        callback: (error: string, result: Object) => void
    ): void;

    export function saveWorkout(
        options: Object,
        callback: (error: Object, result: Object) => void
    ): void;
}
