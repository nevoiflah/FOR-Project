import { auth } from '../config/firebase';

const BASE_URL = 'https://for-project-8ris.onrender.com';

export interface SleepData {
    date: string;
    timestamp: Date;
    duration: number;
    score: number;
    efficiency: number;
    stages: {
        deep: number;
        rem: number;
        light: number;
        awake: number;
    };
    heartRateAvg: number;
    hrvAvg: number;
}

export interface ReadinessData {
    date: string;
    score: number;
    contributors: {
        sleepBalance: number;
        previousDayActivity: number;
        activityBalance: number;
        restingHeartRate: number;
        hrvBalance: number;
        temperature: number;
    };
}

export interface WorkoutData {
    type: 'run' | 'walk' | 'cycle' | 'yoga' | 'hiit' | 'mindfulness';
    duration: number; // seconds
    calories: number;
    heartRateAvg?: number;
    distance?: number;
    date: string; // ISO
}

class VitalsService {
    private async getHeaders() {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');
        const token = await user.getIdToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    // --- Vitals History ---
    async getHistory(start: Date, end: Date) {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${BASE_URL}/vitals/history?start=${start.toISOString()}&end=${end.toISOString()}`, {
                headers
            });

            if (!response.ok) throw new Error('Failed to fetch history');
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('[VitalsService] getHistory error:', error);
            return [];
        }
    }

    // --- Sleep Data ---
    async syncSleepData(sleepLog: SleepData) {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${BASE_URL}/vitals/sleep`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    date: sleepLog.date,
                    data: sleepLog
                })
            });

            if (!response.ok) throw new Error('Failed to sync sleep data');
            return true;
        } catch (error) {
            console.error('[VitalsService] syncSleepData error:', error);
            return false;
        }
    }

    async getSleepHistory(start: string, end: string) {
        try {
            // start/end should be YYYY-MM-DD
            const headers = await this.getHeaders();
            const response = await fetch(`${BASE_URL}/vitals/sleep/history?start=${start}&end=${end}`, {
                headers
            });

            if (!response.ok) throw new Error('Failed to fetch sleep history');
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('[VitalsService] getSleepHistory error:', error);
            return [];
        }
    }

    // --- Readiness Data ---
    async syncReadinessData(readinessLog: ReadinessData) {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${BASE_URL}/vitals/readiness`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    date: readinessLog.date,
                    data: readinessLog
                })
            });

            if (!response.ok) throw new Error('Failed to sync readiness data');
            return true;
        } catch (error) {
            console.error('[VitalsService] syncReadinessData error:', error);
            return false;
        }
    }

    async getReadinessHistory(start: string, end: string) {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${BASE_URL}/vitals/readiness/history?start=${start}&end=${end}`, {
                headers
            });

            if (!response.ok) throw new Error('Failed to fetch readiness history');
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('[VitalsService] getReadinessHistory error:', error);
            return [];
        }
    }

    // --- Workouts ---
    async syncWorkout(workout: WorkoutData) {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${BASE_URL}/vitals/workouts`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ workout })
            });

            if (!response.ok) throw new Error('Failed to sync workout');
            return true;
        } catch (error) {
            console.error('[VitalsService] syncWorkout error:', error);
            return false;
        }
    }

    async getWorkoutHistory(start: string, end: string) {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(`${BASE_URL}/vitals/workouts/history?start=${start}&end=${end}`, {
                headers
            });

            if (!response.ok) throw new Error('Failed to fetch workout history');
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('[VitalsService] getWorkoutHistory error:', error);
            return [];
        }
    }
}

export const vitalsService = new VitalsService();
