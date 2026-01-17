import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { bluetoothService } from '../services/BluetoothService';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    };
    userProfile?: {
        name: string;
        age: string;
        weight: string; // stored as string for input ease, convert when needed
        height: string;
        gender: 'male' | 'female' | 'other';
    };
}

interface DataContextType {
    isConnected: boolean;
    isSyncing: boolean;
    data: RingData | null;
    connectRing: () => Promise<void>;
    simulateData: (scenario: 'default' | 'poor_sleep' | 'high_stress' | 'perfect_day') => void;
    updateUserProfile: (profile: RingData['userProfile']) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Initial Mock Data
const MOCK_DATA: RingData = {
    sleep: {
        duration: '7h 42m',
        score: 88,
        deep: '1h 20m',
        rem: '2h 10m',
        weekly: [6.8, 7.2, 7.5, 6.4, 8.0, 7.8, 7.6],
    },
    steps: {
        count: 8432,
        goal: 10000,
        calories: 420,
    },
    heart: {
        bpm: 68,
        resting: 54,
        variability: 45,
        trend: [58, 62, 60, 65, 59, 56, 55, 61, 64, 60],
    },
    readiness: {
        score: 92,
        status: 'Excellent',
    },
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [data, setData] = useState<RingData | null>(null);

    // Auto-connect simulation on mount
    // Load Data on Mount
    useEffect(() => {
        loadData();
    }, []);

    // Save Data on Change
    useEffect(() => {
        if (data) {
            saveData(data);
        }
    }, [data]);

    const loadData = async () => {
        try {
            const saved = await AsyncStorage.getItem('app_data');
            if (saved) {
                setData(JSON.parse(saved));
                setIsConnected(true); // Assume connected if we have data
            } else {
                connectRing(); // Fallback to auto-connect simulation
            }
        } catch (e) {
            connectRing();
        }
    };

    const saveData = async (newData: RingData) => {
        try {
            await AsyncStorage.setItem('app_data', JSON.stringify(newData));
        } catch (e) {
            console.log('Failed to save data');
        }
    };

    const connectRing = async () => {
        if (isConnected) return;

        setIsSyncing(true);
        bluetoothService.scanAndConnect(); // Trigger the service mock

        // Simulate network/bluetooth delay
        setTimeout(() => {
            setIsConnected(true);
            setIsSyncing(false);
            setData(MOCK_DATA);
        }, 1500);
    };

    // Simulation Helper
    const simulateData = (scenario: 'default' | 'poor_sleep' | 'high_stress' | 'perfect_day') => {
        setIsSyncing(true);
        setTimeout(() => {
            switch (scenario) {
                case 'poor_sleep':
                    setData({
                        ...MOCK_DATA,
                        sleep: {
                            ...MOCK_DATA.sleep,
                            score: 45,
                            duration: '4h 20m',
                            weekly: [6.8, 7.2, 7.5, 6.4, 8.0, 5.0, 4.2] // Drop in last day
                        },
                        readiness: { score: 55, status: 'Rest Required' }
                    });
                    break;
                case 'high_stress':
                    setData({
                        ...MOCK_DATA,
                        heart: {
                            ...MOCK_DATA.heart,
                            variability: 25,
                            resting: 75,
                            trend: [65, 70, 72, 75, 78, 80, 82, 75, 78, 85] // High trend
                        },
                        readiness: { score: 60, status: 'Stressed' }
                    });
                    break;
                case 'perfect_day':
                    setData({
                        ...MOCK_DATA,
                        sleep: { ...MOCK_DATA.sleep, score: 95, duration: '8h 10m' },
                        readiness: { score: 98, status: 'Peak Performance' },
                        heart: { ...MOCK_DATA.heart, variability: 85 }
                    });
                    break;
                case 'default':
                default:
                    setData(MOCK_DATA);
                    break;
            }
            setIsSyncing(false);
        }, 800); // Small delay for realism
    };

    const updateUserProfile = (profile: RingData['userProfile']) => {
        if (!data) return;
        const newData = { ...data, userProfile: profile };
        setData(newData);
    };

    return (
        <DataContext.Provider value={{ isConnected, isSyncing, data, connectRing, simulateData, updateUserProfile }}>
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
