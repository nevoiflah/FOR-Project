import { db } from '../config/firebase';
import { doc, setDoc, collection, writeBatch } from 'firebase/firestore';

const MINDFULNESS_DATA = [
    {
        id: 'morning_focus',
        title: 'Morning Focus',
        description: 'Start your day with awareness and clarity.',
        tracks: [
            {
                id: 'awareness_breathing_10',
                title: 'Awareness of Breathing',
                duration: 600, // 10:00
                url: 'https://www.mindfulnessinaction.ca/wp-content/uploads/2022/12/Awareness-of-Breathing-10-minutes.mp3'
            }
        ]
    },
    {
        id: 'deep_sleep',
        title: 'Deep Sleep',
        description: 'Guided body scans to prepare you for restful sleep.',
        tracks: [
            {
                id: 'full_body_scan_37',
                title: 'Full Body Scan for Sleep',
                duration: 2220, // 37:00
                url: 'https://www.mindfulnessinaction.ca/wp-content/uploads/2022/12/BodyScan.mp3'
            },
            {
                id: 'quick_body_scan_10',
                title: 'Quick Body Scan',
                duration: 600, // 10:00
                url: 'https://www.mindfulnessinaction.ca/wp-content/uploads/2024/08/Body-Scan-10-mins.mp3'
            }
        ]
    },
    {
        id: 'stress_relief',
        title: 'Stress Relief',
        description: 'Quick exercises to find calm in the middle of your day.',
        tracks: [
            {
                id: '3_stage_breathing',
                title: '3-Stage Breathing Space',
                duration: 180, // 3:00
                url: 'https://changes.org.uk/wp-content/uploads/2022/05/3-Stage-Breathing-Space.mp3'
            }
        ]
    }
];

export const seedMindfulnessData = async () => {
    try {
        console.log('🌱 Starting Seeding Process (Simplified Content)...');
        const batch = writeBatch(db);

        MINDFULNESS_DATA.forEach((zone) => {
            const docRef = doc(db, 'mindfulness_zones', zone.id);
            batch.set(docRef, zone);
        });

        await batch.commit();
        console.log('✅ Mindfulness Data Seeded Successfully!');
        return true;
    } catch (error) {
        console.error('❌ Error Seeding Data:', error);
        return false;
    }
};
