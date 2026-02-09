import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { bluetoothService } from '../services/BluetoothService';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { COLORS } from '../constants/theme';
import { notificationService } from '../services/NotificationService';
import { useLanguage } from './LanguageContext';
import { appleHealthService } from '../services/AppleHealthService';

export interface Goal {
    id: string;
    title: string;
    target: number;
    current: number;
    unit: string;
    color: string;
    type: 'boolean' | 'numeric';
}

export type WorkoutType = 'run' | 'walk' | 'cycle' | 'yoga' | 'hiit' | 'mindfulness';

export interface Workout {
    id: string;
    type: WorkoutType;
    duration: number; // in seconds
    calories: number;
    date: string; // ISO string
    heartRateAvg?: number;
    distance?: number; // in meters (optional)
}

interface RingData {
    sleep: {
        duration: string;
        score: number;
        deep: string;
        rem: string;
        weekly: number[];
    };
    steps: {
        count: number;
        goal: number;
        calories: number;
    };
    heart: {
        bpm: number;
        resting: number;
        variability: number;
        trend: number[];
    };
    readiness: {
        score: number;
        status: string;
        weekly: number[];
    };
    userProfile?: {
        name: string;
        age: string;
        weight: string;
        height: string;
        gender: 'male' | 'female' | 'other';
    };
    goals?: Goal[];
    history?: Workout[];
    unitSystem?: 'metric' | 'imperial';
    notificationsEnabled?: boolean;
    appleHealthEnabled?: boolean;
}

interface DataContextType {
    isConnected: boolean;
    isRingBound: boolean;
    isSyncing: boolean;
    data: RingData | null;
    connectRing: () => Promise<void>;
    disconnectRing: () => Promise<void>;
    updateRingData: (updates: Partial<RingData>) => Promise<void>;
    toggleUnitSystem: () => Promise<void>;
    toggleNotifications: (enabled: boolean) => Promise<void>;
    toggleAppleHealth: (enabled: boolean) => Promise<void>;
    updateUserProfile: (profile: RingData['userProfile']) => void;
    addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
    removeGoal: (id: string) => Promise<void>;
    updateGoal: (id: string, progress: number) => Promise<void>;
    saveWorkout: (workout: Omit<Workout, 'id'>) => Promise<void>;
    triggerHeartRateScan: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DEFAULT_DATA: RingData = {
    sleep: {
        duration: '0h 0m',
        score: 0,
        deep: '0h 0m',
        rem: '0h 0m',
        weekly: [0, 0, 0, 0, 0, 0, 0],
    },
    steps: {
        count: 0,
        goal: 10000,
        calories: 0,
    },
    heart: {
        bpm: 0,
        resting: 0,
        variability: 0,
        trend: [],
    },
    readiness: {
        score: 0,
        status: 'No Data',
        weekly: [0, 0, 0, 0, 0, 0, 0],
    },
    goals: [
        { id: '1', title: 'Daily Steps', target: 10000, current: 0, unit: 'steps', color: COLORS.primary, type: 'numeric' },
        { id: '2', title: 'Sleep Quality', target: 90, current: 0, unit: '/ 100', color: COLORS.danger, type: 'numeric' },
        { id: '3', title: 'Active Minutes', target: 60, current: 0, unit: 'min', color: COLORS.warning, type: 'numeric' },
    ],
    history: [],
    unitSystem: 'metric',
    appleHealthEnabled: false,
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [isConnected, setIsConnected] = useState(false);
    const [isRingBound, setIsRingBound] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [data, setData] = useState<RingData | null>(null);

    // Initial load and connection check
    useEffect(() => {
        setIsConnected(bluetoothService.isConnected());

        // Listen for physical connection changes
        const unsubscribe = bluetoothService.onConnectionChange((connected) => {
            console.log('[DataContext] Connection state CALLBACK:', connected);
            setIsConnected(connected);
        });

        return unsubscribe;
    }, []);

    // Sync with Firestore in real-time
    useEffect(() => {
        if (!user) {
            setData(null);
            setIsConnected(false);
            return;
        }

        const userDocRef = doc(db, 'users', user.uid);

        // Listen for real-time changes
        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setData(docSnap.data() as RingData);
                setIsRingBound(true);
            } else {
                // Initialize user data if they are new
                const initialData = { ...DEFAULT_DATA };
                if (user.displayName) {
                    initialData.userProfile = {
                        name: user.displayName,
                        age: '',
                        weight: '',
                        height: '',
                        gender: 'other'
                    };
                }
                setDoc(userDocRef, initialData);
            }
        });

        return unsubscribe;
    }, [user]);

    // Monitor Bluetooth Connection and Sync Data
    useEffect(() => {
        let hrSubscription: any = null;
        let batterySubscription: any = null;
        let proprietarySubscription: any = null;

        const startSync = async () => {
            console.log(`[DataContext] Attempting startSync. bound=${isRingBound}, connected=${isConnected}`);
            // Only sync if ring is bound AND physically connected
            if (isRingBound && isConnected) {
                console.log('[DataContext] Conditions met. Starting direct data sync from ring...');

                try {
                    setIsSyncing(true);
                    // Monitor Heart Rate (Service: 180D, Characteristic: 2A37)
                    hrSubscription = bluetoothService.monitorCharacteristic(
                        '180D',
                        '2A37',
                        (base64Value) => {
                            if (base64Value) {
                                const bpm = bluetoothService.parseHeartRate(base64Value);
                                if (bpm !== null && bpm > 0) {
                                    updateRingData({
                                        heart: {
                                            bpm: bpm,
                                            // trend and resting will be handled in updateRingData merge logic if needed, 
                                            // but better to handle atomic updates there.
                                        } as any
                                    });
                                }
                            }
                        }
                    );

                    // Monitor Battery (Service: 180F, Characteristic: 2A19)
                    batterySubscription = bluetoothService.monitorCharacteristic(
                        '180F',
                        '2A19',
                        (base64Value) => {
                            if (base64Value) {
                                const level = bluetoothService.parseBatteryLevel(base64Value);
                                if (level !== null) {
                                    // Hardware info will be displayed in Profile modal
                                    console.log(`[DataContext] Ring Battery Level: ${level}%`);
                                }
                            }
                        }
                    );

                    // Monitor Proprietary MHCS data (Service: FDDA, Characteristic: FDD1)
                    proprietarySubscription = bluetoothService.monitorCharacteristic(
                        '0000fdda-0000-1000-8000-00805f9b34fb',
                        '0000fdd1-0000-1000-8000-00805f9b34fb',
                        (base64Value) => {
                            if (base64Value) {
                                console.log(`[DataContext] FDD1 Raw: ${base64Value}`);
                                const bpm = bluetoothService.parseHeartRate(base64Value);
                                if (bpm !== null && bpm > 0) {
                                    console.log(`[DataContext] Proprietary HR (FDD1) parsed: ${bpm}`);
                                    updateRingData({ heart: { bpm: bpm } as any });
                                }
                            }
                        }
                    );

                    // Monitor additional Proprietary service (FEE7)
                    bluetoothService.monitorCharacteristic(
                        '0000fee7-0000-1000-8000-00805f9b34fb',
                        '0000fea2-0000-1000-8000-00805f9b34fb',
                        (base64Value) => {
                            if (base64Value) {
                                console.log(`[DataContext] FEA2 Raw: ${base64Value}`);
                                const bpm = bluetoothService.parseHeartRate(base64Value);
                                if (bpm !== null && bpm > 0) {
                                    console.log(`[DataContext] Proprietary HR (FEA2) parsed: ${bpm}`);
                                    updateRingData({ heart: { bpm: bpm } as any });
                                }
                            }
                        }
                    );

                    // Log services/characteristics once for debugging
                    // await bluetoothService.logAllServicesAndCharacteristics();

                    // Start live monitoring immediately (activate green/red lights)
                    await bluetoothService.startLiveMonitoring();
                } catch (error) {
                    console.error('[DataContext] BLE Sync Error:', error);
                } finally {
                    setIsSyncing(false);
                }
            }
        };

        if (isRingBound && isConnected) {
            startSync();
        }

        return () => {
            if (hrSubscription) hrSubscription.remove();
            if (batterySubscription) batterySubscription.remove();
            if (proprietarySubscription) proprietarySubscription.remove();
            // Cleanup for FEE7 subscription would need to be handled, but for now we focus on getting data
            setIsSyncing(false);
        };
    }, [isConnected, isRingBound]);

    // Check goals whenever data changes
    useEffect(() => {
        if (data && data.goals && data.notificationsEnabled) {
            notificationService.checkDailyGoals(data, data.goals);
        }
    }, [data]);

    const connectRing = async () => {
        if (isConnected) return;
        if (!user) return;

        setIsSyncing(true);

        // Actual connection happens via BLE scan in ProfileScreen
        // This is a placeholder for context-level state preparation
        setTimeout(async () => {
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, { isRingBound: true }, { merge: true });
            setIsRingBound(true);
            setIsSyncing(false);
        }, 800);
    };

    const disconnectRing = async () => {
        if (!user) return;
        setIsSyncing(true);
        try {
            await bluetoothService.disconnect();
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, { isRingBound: false }, { merge: true });
            setIsRingBound(false);
        } catch (error) {
            console.error('[DataContext] Disconnect error:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    const updateRingData = async (updates: Partial<RingData>) => {
        if (!user) return;

        // Set ring bound status
        setIsRingBound(true);

        setData(prev => {
            if (!prev) return null;

            // Deep merge logic for heart to preserve trend
            const newHeart = updates.heart ? {
                ...prev.heart,
                ...updates.heart,
                trend: updates.heart.bpm
                    ? [...(prev.heart.trend || []), updates.heart.bpm].slice(-10)
                    : prev.heart.trend
            } : prev.heart;

            const updated = {
                ...prev,
                ...updates,
                heart: newHeart as any
            };

            // Sync to Firestore
            const userDocRef = doc(db, 'users', user.uid);
            setDoc(userDocRef, updates, { merge: true }).catch(e =>
                console.error('[DataContext] Firestore Sync Error:', e)
            );

            console.log('[DataContext] Updated ring data:', updates);
            return updated;
        });
    };



    const toggleUnitSystem = async () => {
        if (!user || !data) return;
        const newSystem = data.unitSystem === 'metric' ? 'imperial' : 'metric';

        // Optimistic update
        setData(prev => prev ? { ...prev, unitSystem: newSystem } : null);

        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { unitSystem: newSystem }, { merge: true });
    };

    const toggleNotifications = async (enabled: boolean) => {
        if (!user || !data) return;

        // Optimistic update
        setData(prev => prev ? { ...prev, notificationsEnabled: enabled } : null);

        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { notificationsEnabled: enabled }, { merge: true });
    };

    const toggleAppleHealth = async (enabled: boolean) => {
        if (!user || !data) return;

        // Optimistic update
        setData(prev => prev ? { ...prev, appleHealthEnabled: enabled } : null);

        if (enabled) {
            try {
                const authorized = await appleHealthService.init();
                if (!authorized) {
                    Alert.alert(
                        t('appleHealth') || 'Apple Health',
                        'Unable to connect to Apple Health. Please check your permissions in the Health app.',
                        [{ text: 'OK' }]
                    );
                    // Reset state if failed dramatically, but usually we should stick to user's choice
                }
            } catch (error) {
                console.error('[DataContext] Apple Health Toggle Error:', error);
            }
        }

        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { appleHealthEnabled: enabled }, { merge: true });
    };

    const updateUserProfile = async (profile: RingData['userProfile']) => {
        if (!user) return;
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { userProfile: profile }, { merge: true });
    };

    const addGoal = async (goalData: Omit<Goal, 'id'>) => {
        if (!user || !data) return;
        const newGoal: Goal = {
            ...goalData,
            id: Date.now().toString(), // Simple ID generation
        };
        const updatedGoals = [...(data.goals || []), newGoal];

        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { goals: updatedGoals }, { merge: true });
    };

    const removeGoal = async (id: string) => {
        if (!user || !data) return;
        const updatedGoals = (data.goals || []).filter(g => g.id !== id);

        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { goals: updatedGoals }, { merge: true });
    };

    const updateGoal = async (id: string, progress: number) => {
        if (!user || !data) return;
        const updatedGoals = (data.goals || []).map(g => {
            if (g.id === id) {
                return { ...g, current: progress };
            }
            return g;
        });

        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { goals: updatedGoals }, { merge: true });
    };

    const saveWorkout = async (workoutData: Omit<Workout, 'id'>) => {
        if (!user || !data) return;
        const newWorkout: Workout = {
            ...workoutData,
            id: Date.now().toString(),
        };
        const updatedHistory = [newWorkout, ...(data.history || [])];

        // Optimistic update
        setData(prev => prev ? { ...prev, history: updatedHistory } : null);

        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { history: updatedHistory }, { merge: true });
    };

    const triggerHeartRateScan = async () => {
        if (!isConnected) {
            throw new Error('Ring is not connected');
        }
        await bluetoothService.triggerManualHeartRateScan();
    };

    return (
        <DataContext.Provider value={{
            isConnected,
            isRingBound,
            isSyncing,
            data,
            connectRing,
            disconnectRing,
            updateRingData,
            toggleUnitSystem,
            toggleNotifications,
            toggleAppleHealth,
            updateUserProfile,
            addGoal,
            removeGoal,
            updateGoal,
            saveWorkout,
            triggerHeartRateScan
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
