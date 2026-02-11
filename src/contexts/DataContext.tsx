import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
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
        avgHeartRate: number;
        temperatureTrend: number[];
        history: {
            day: { duration: number; score: number; date: string };
            day_hourly: { time: string; duration: number; score: number; date: string }[];
            week: { date: string; duration: number; score: number }[];
            month: { date: string; duration: number; score: number }[];
        };
    };
    steps: {
        count: number;
        goal: number;
        calories: number;
        distance: number; // New: Distance in km/miles
        history: {
            day: { time: string, steps: number, calories: number }[];
            week: { date: string, steps: number, calories: number }[];
            month: { date: string, steps: number, calories: number }[];
        };
    };
    heart: {
        bpm: number;
        resting: number;
        variability: number;
        spo2: number;        // New: Blood Oxygen %
        stress: number;      // New: Stress Score (0-100)
        trend: number[];
        hrvTrend: number[];  // New: HRV History
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
    triggerSpO2Scan: () => Promise<void>;
    triggerStressScan: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DEFAULT_DATA: RingData = {
    sleep: {
        duration: '7h 12m',
        score: 85,
        deep: '1h 45m',
        rem: '2h 10m',
        weekly: [6.5, 7.2, 5.8, 8.1, 7.5, 6.9, 7.2],
        avgHeartRate: 58,
        temperatureTrend: [0.1, -0.2, 0.0, 0.3, -0.1, 0.2, -0.3],
        history: {
            day: { duration: 7.2, score: 85, date: 'Today' },
            day_hourly: [
                { time: '23:00', duration: 55, score: 90, date: '23:00' },
                { time: '00:00', duration: 58, score: 85, date: '00:00' },
                { time: '01:00', duration: 60, score: 75, date: '01:00' },
                { time: '02:00', duration: 60, score: 72, date: '02:00' },
                { time: '03:00', duration: 52, score: 65, date: '03:00' },
                { time: '04:00', duration: 58, score: 78, date: '04:00' },
                { time: '05:00', duration: 60, score: 88, date: '05:00' },
                { time: '06:00', duration: 55, score: 92, date: '06:00' },
                { time: '07:00', duration: 30, score: 95, date: '07:00' }
            ],
            week: [
                { date: 'Mon', duration: 6.5, score: 78 },
                { date: 'Tue', duration: 7.2, score: 85 },
                { date: 'Wed', duration: 5.8, score: 62 },
                { date: 'Thu', duration: 8.1, score: 92 },
                { date: 'Fri', duration: 7.5, score: 88 },
                { date: 'Sat', duration: 6.9, score: 80 },
                { date: 'Sun', duration: 7.2, score: 85 },
            ],
            month: Array.from({ length: 30 }, (_, i) => ({
                date: `${i + 1}`,
                duration: 5 + Math.random() * 4,
                score: 50 + Math.random() * 50
            }))
        }
    },
    steps: {
        count: 8432,
        goal: 10000,
        calories: 420,
        distance: 5.2,
        history: {
            day: [
                { time: '06:00', steps: 0, calories: 0 },
                { time: '07:00', steps: 150, calories: 10 },
                { time: '08:00', steps: 800, calories: 45 },
                { time: '09:00', steps: 1200, calories: 65 },
                { time: '10:00', steps: 500, calories: 30 },
                { time: '11:00', steps: 300, calories: 20 },
                { time: '12:00', steps: 1500, calories: 80 },
                { time: '13:00', steps: 600, calories: 35 },
                { time: '14:00', steps: 400, calories: 25 },
                { time: '15:00', steps: 900, calories: 50 },
                { time: '16:00', steps: 1100, calories: 60 },
                { time: '17:00', steps: 200, calories: 15 }
            ],
            week: [
                { date: 'Mon', steps: 6500, calories: 320 },
                { date: 'Tue', steps: 8200, calories: 410 },
                { date: 'Wed', steps: 7800, calories: 390 },
                { date: 'Thu', steps: 9500, calories: 480 },
                { date: 'Fri', steps: 10200, calories: 510 },
                { date: 'Sat', steps: 11500, calories: 580 },
                { date: 'Sun', steps: 5400, calories: 270 },
            ],
            month: Array.from({ length: 30 }, (_, i) => ({
                date: `${i + 1}`,
                steps: 5000 + Math.floor(Math.random() * 7000),
                calories: 250 + Math.floor(Math.random() * 350)
            }))
        }
    },
    heart: {
        bpm: 0,
        resting: 0,
        variability: 0,
        spo2: 0,
        stress: 0,
        trend: Array(24).fill(0),
        hrvTrend: Array(24).fill(0),
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
                const firestoreData = docSnap.data() as RingData;

                // Ensure sleep history exists (migration for existing users)
                // This prevents crashes if the new 'history' field hasn't been synced to Firestore yet
                if (!firestoreData.sleep?.history) {
                    firestoreData.sleep = {
                        ...DEFAULT_DATA.sleep,
                        ...(firestoreData.sleep || {}),
                        history: DEFAULT_DATA.sleep.history
                    };
                } else if (!firestoreData.sleep.history.day_hourly) {
                    // Patch for day_hourly if history exists but is old
                    firestoreData.sleep.history.day_hourly = DEFAULT_DATA.sleep.history.day_hourly;
                }

                setData(firestoreData);
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
                                const parsed = bluetoothService.parseHeartRate(base64Value);
                                if (parsed && parsed.bpm > 0) {
                                    const updates: any = {
                                        heart: {
                                            bpm: parsed.bpm,
                                        }
                                    };

                                    // If HRV is available, calculate stress
                                    if (parsed.hrv) {
                                        updates.heart.variability = parsed.hrv;
                                        updates.heart.stress = bluetoothService.calculateStress(parsed.hrv);
                                    }

                                    updateRingData(updates);
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
                                // console.log(`[DataContext] FDD1 Raw: ${base64Value}`); // Reduce log spam

                                // Try HR with HRV
                                const parsed = bluetoothService.parseHeartRate(base64Value);
                                if (parsed && parsed.bpm > 0) {
                                    const updates: any = { heart: { bpm: parsed.bpm } };
                                    if (parsed.hrv) {
                                        updates.heart.variability = parsed.hrv;
                                        updates.heart.stress = bluetoothService.calculateStress(parsed.hrv);
                                    }
                                    updateRingData(updates);
                                }

                                // Try SpO2
                                const spo2 = bluetoothService.parseSpO2(base64Value);
                                if (spo2 !== null && spo2 > 80) {
                                    console.log(`[DataContext] Proprietary SpO2 (FDD1) parsed: ${spo2}`);
                                    updateRingData({ heart: { spo2: spo2 } as any });
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
                                // console.log(`[DataContext] FEA2 Raw: ${base64Value}`); // Reduce log spam

                                // Try HR
                                const parsed = bluetoothService.parseHeartRate(base64Value);
                                if (parsed && parsed.bpm > 0) {
                                    const updates: any = { heart: { bpm: parsed.bpm } };
                                    // FDD/FEA protocols usually don't carry HRV here but worth checking
                                    if (parsed.hrv) {
                                        updates.heart.variability = parsed.hrv;
                                        updates.heart.stress = bluetoothService.calculateStress(parsed.hrv);
                                    }
                                    updateRingData(updates);
                                }

                                // Try SpO2
                                const spo2 = bluetoothService.parseSpO2(base64Value);
                                if (spo2 !== null && spo2 > 80) {
                                    console.log(`[DataContext] Proprietary SpO2 (FEA2) parsed: ${spo2}`);
                                    updateRingData({ heart: { spo2: spo2 } as any });
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


    // Vitals Buffer for Batch Upload
    const vitalsBuffer = useRef<any[]>([]);
    const lastUploadTime = useRef<number>(Date.now());

    const flushVitalsBuffer = async () => {
        if (vitalsBuffer.current.length === 0) return;
        if (!user) return;

        const logsToUpload = [...vitalsBuffer.current];
        vitalsBuffer.current = []; // Clear immediately to prevent double send
        lastUploadTime.current = Date.now();

        try {
            console.log(`[DataContext] Uploading ${logsToUpload.length} vitals logs to Backend...`);
            const token = await user.getIdToken();

            // Allow dev loopback for Android (10.0.2.2) or localhost for iOS
            // Replace with your actual machine IP if testing on real device!
            // const API_URL = 'http://localhost:3000/vitals/batch'; 
            // For now assuming iOS simulator or local web
            const API_URL = 'http://localhost:3000/vitals/batch';

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ logs: logsToUpload })
            });

            if (!response.ok) {
                console.error('[DataContext] Upload Failed:', await response.text());
                // Optional: Re-queue failed logs? For now we drop to avoid memory leaks
            } else {
                console.log('[DataContext] Batch upload successful.');
            }
        } catch (e) {
            console.error('[DataContext] Upload Error:', e);
        }
    };

    // Auto-flush every 5 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            flushVitalsBuffer();
        }, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [user]);

    const updateRingData = async (updates: Partial<RingData>) => {
        if (!user) return;

        // Set ring bound status
        setIsRingBound(true);

        // 1. Add to Vitals Buffer (MongoDB)
        // We only buffer if we have "Sense" data (HR, Steps, etc.)
        if (updates.heart || updates.steps) {
            const logEntry = {
                timestamp: new Date().toISOString(),
                data: {
                    heartRate: updates.heart?.bpm,
                    hrv: updates.heart?.variability,
                    spo2: updates.heart?.spo2,
                    stress: updates.heart?.stress,
                    steps: updates.steps?.count
                    // Add others as needed
                }
            };
            vitalsBuffer.current.push(logEntry);

            // Optional: Flush immediately if buffer gets too big
            if (vitalsBuffer.current.length >= 60) { // e.g. 1 hour of minute-data
                flushVitalsBuffer();
            }
        }

        setData(prev => {
            if (!prev) return null;

            // 2. Update Local State (React) - Purely for UI display
            const newHeart = updates.heart ? {
                ...prev.heart,
                ...updates.heart,
                trend: updates.heart.bpm
                    ? [...(prev.heart.trend || []), updates.heart.bpm].slice(-24) // Keep simple 24-pt trend for UI
                    : prev.heart.trend,
                hrvTrend: updates.heart.variability
                    ? [...(prev.heart.hrvTrend || []), updates.heart.variability].slice(-24)
                    : prev.heart.hrvTrend
            } : prev.heart;

            // Handle Sleep History Accumulation (Mocking Sleep Data from Real-time HR)
            let newSleep = { ...prev.sleep };
            if (updates.heart?.bpm) {
                const now = new Date();
                const currentHourStr = `${now.getHours().toString().padStart(2, '0')}:00`;
                const bpm = updates.heart.bpm;

                // Simple score calculation: Lower HR = Higher Sleep Score (inverted from 100)
                const calculatedScore = Math.max(0, Math.min(100, 140 - bpm));

                // Initialize hourly array if missing
                if (!newSleep.history) {
                    newSleep.history = { ...DEFAULT_DATA.sleep.history };
                }
                if (!newSleep.history.day_hourly) {
                    newSleep.history.day_hourly = [];
                }

                const existingEntryIndex = newSleep.history.day_hourly.findIndex(h => h.time === currentHourStr);

                if (existingEntryIndex >= 0) {
                    // Update existing hour
                    const entry = newSleep.history.day_hourly[existingEntryIndex];
                    const outputScore = Math.round((entry.score + calculatedScore) / 2);

                    newSleep.history.day_hourly[existingEntryIndex] = {
                        ...entry,
                        score: outputScore,
                        duration: 60
                    };
                } else {
                    // Add new hour
                    newSleep.history.day_hourly.push({
                        time: currentHourStr,
                        date: currentHourStr,
                        score: calculatedScore,
                        duration: 60
                    });
                }
            }

            const updated = {
                ...prev,
                ...updates,
                heart: newHeart as any,
                sleep: newSleep
            };

            // 3. Sync "Latest State" to Firestore (Profile, Settings, Current Status)
            // We NO LONGER sync the massive history arrays to Firestore here to save costs.
            // We only merge the "top level" current values.
            const userDocRef = doc(db, 'users', user.uid);

            // Create a "lean" update object for Firestore (exclude massive arrays)
            const persistenceUpdates: any = { ...updates };

            // If updating heart, only save the *current* metrics to Firestore, not the full history trend
            if (updates.heart) {
                persistenceUpdates.heart = {
                    bpm: updates.heart.bpm,
                    hrv: updates.heart.variability,
                    spo2: updates.heart.spo2,
                    stress: updates.heart.stress
                    // timestamp: ... 
                };
            }

            // Keep Sleep history in Firestore for now as it's low frequency (hourly/daily chunks)
            // or move it to MongoDB too. For now let's keep it to ensure UI works.
            persistenceUpdates.sleep = newSleep;

            setDoc(userDocRef, persistenceUpdates, { merge: true }).catch(e =>
                console.error('[DataContext] Firestore Sync Error:', e)
            );

            console.log('[DataContext] Updated ring data (Buffered for Mongo):', updates);
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

    const triggerSpO2Scan = async () => {
        if (!isConnected) throw new Error('Ring is not connected');
        // Re-use the manual trigger for now as it activates all sensors (HR + SpO2)
        await bluetoothService.triggerManualHeartRateScan();
    };

    const triggerStressScan = async () => {
        if (!isConnected) throw new Error('Ring is not connected');
        // Stress is usually derived from HRV, so we trigger the same scan
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
            triggerHeartRateScan,
            triggerSpO2Scan,
            triggerStressScan,
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
