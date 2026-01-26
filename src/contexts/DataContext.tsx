import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { bluetoothService } from '../services/BluetoothService';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { COLORS } from '../constants/theme';

export interface Goal {
    id: string;
    title: string;
    target: number;
    current: number;
    unit: string;
    color: string;
    type: 'boolean' | 'numeric';
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
    unitSystem?: 'metric' | 'imperial';
    notificationsEnabled?: boolean;
}



interface DataContextType {
    isConnected: boolean;
    isSyncing: boolean;
    data: RingData | null;
    connectRing: () => Promise<void>;
    simulateData: (scenario: 'default' | 'poor_sleep' | 'high_stress' | 'perfect_day') => void;
    toggleUnitSystem: () => Promise<void>;
    toggleNotifications: (enabled: boolean) => Promise<void>;
    updateUserProfile: (profile: RingData['userProfile']) => void;
    addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
    removeGoal: (id: string) => Promise<void>;
    updateGoal: (id: string, progress: number) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DEFAULT_DATA: RingData = {
    sleep: {
        duration: '7h 42m',
        score: 88,
        deep: '1h 20m',
        rem: '2h 10m',
        weekly: [6.8, 7.2, 7.5, 6.4, 8.0, 7.8, 7.6],
    },
    steps: {
        count: 0,
        goal: 10000,
        calories: 0,
    },
    heart: {
        bpm: 0,
        resting: 54,
        variability: 45,
        trend: [58, 62, 60, 65, 59, 56, 55, 61, 64, 60],
    },
    readiness: {
        score: 85,
        status: 'Good',
        weekly: [82, 85, 88, 84, 86, 85, 87],
    },
    goals: [
        { id: '1', title: 'Daily Steps', target: 10000, current: 0, unit: 'steps', color: COLORS.primary, type: 'numeric' },
        { id: '2', title: 'Sleep Quality', target: 90, current: 0, unit: '/ 100', color: '#B0FB54', type: 'numeric' },
        { id: '3', title: 'Active Minutes', target: 60, current: 0, unit: 'min', color: '#FBBF24', type: 'numeric' },
    ],
    unitSystem: 'metric',
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [data, setData] = useState<RingData | null>(null);

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
                setIsConnected(true);
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

    const connectRing = async () => {
        if (isConnected && data?.steps.count !== 0) return; // Already "connected" and has data
        if (!user) return;

        setIsSyncing(true);
        bluetoothService.scanAndConnect();

        setTimeout(async () => {
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, DEFAULT_DATA, { merge: true });
            setIsConnected(true);
            setIsSyncing(false);
        }, 1500);
    };

    const simulateData = async (scenario: 'default' | 'poor_sleep' | 'high_stress' | 'perfect_day') => {
        if (!user) return;
        setIsSyncing(true);

        let newData: Partial<RingData> = {};

        switch (scenario) {
            case 'poor_sleep':
                newData = {
                    sleep: {
                        duration: '4h 20m', score: 45, deep: '0h 40m', rem: '1h 00m',
                        weekly: [6.8, 7.2, 7.5, 6.4, 8.0, 5.0, 4.2]
                    },
                    readiness: { score: 55, status: 'Rest Required', weekly: [82, 85, 88, 84, 86, 60, 55] }
                };
                break;
            case 'high_stress':
                newData = {
                    heart: {
                        bpm: 88, resting: 75, variability: 25,
                        trend: [65, 70, 72, 75, 78, 80, 82, 75, 78, 85]
                    },
                    readiness: { score: 60, status: 'Stressed', weekly: [82, 80, 78, 75, 72, 68, 60] }
                };
                break;
            case 'perfect_day':
                newData = {
                    sleep: { duration: '8h 10m', score: 95, deep: '2h 10m', rem: '2h 30m', weekly: [8, 8.2, 8.1, 7.9, 8.5, 8.3, 8.1] },
                    readiness: { score: 98, status: 'Peak Performance', weekly: [90, 92, 94, 95, 96, 97, 98] },
                    heart: { ...data?.heart, variability: 85, resting: 50, bpm: 52 } as any
                };
                break;
            case 'default':
            default:
                newData = DEFAULT_DATA;
                break;
        }

        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, newData, { merge: true });
        setIsSyncing(false);
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

    return (
        <DataContext.Provider value={{ isConnected, isSyncing, data, connectRing, simulateData, toggleUnitSystem, toggleNotifications, updateUserProfile, addGoal, removeGoal, updateGoal }}>
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
