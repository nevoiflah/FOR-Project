import {
    Activity, Footprints, Bike, Mountain, Trophy,
    Waves, Music, Dumbbell, MapPin
} from 'lucide-react-native';

export interface ActivityType {
    id: string;
    label: string;
    icon: any;
    gps: boolean;
}

export const ACTIVITIES: ActivityType[] = [
    // GPS Activities
    { id: 'gpsWalking', icon: MapPin, label: 'gpsWalking', gps: true },
    { id: 'gpsRunning', icon: MapPin, label: 'gpsRunning', gps: true },
    { id: 'gpsCycling', icon: MapPin, label: 'gpsCycling', gps: true },
    { id: 'trailRunning', icon: Mountain, label: 'trailRunning', gps: true },
    { id: 'gpsHiking', icon: Mountain, label: 'gpsHiking', gps: true },

    // Non-GPS Activities
    { id: 'walking', icon: Footprints, label: 'walking', gps: false },
    { id: 'running', icon: Activity, label: 'running', gps: false },
    { id: 'cycling', icon: Bike, label: 'cycling', gps: false },
    { id: 'skipping', icon: Activity, label: 'skipping', gps: false },
    { id: 'badminton', icon: Trophy, label: 'badminton', gps: false },
    { id: 'basketball', icon: Trophy, label: 'basketball', gps: false },
    { id: 'football', icon: Trophy, label: 'football', gps: false },
    { id: 'swimming', icon: Waves, label: 'swimming', gps: false },
    { id: 'climbing', icon: Mountain, label: 'climbing', gps: false },
    { id: 'tennis', icon: Trophy, label: 'tennis', gps: false },
    { id: 'padel', icon: Trophy, label: 'padel', gps: false },
    { id: 'dancing', icon: Music, label: 'dancing', gps: false },
    { id: 'cardio', icon: Activity, label: 'cardio', gps: false },
    { id: 'gym', icon: Dumbbell, label: 'gym', gps: false },
    { id: 'yoga', icon: Activity, label: 'yoga', gps: false },
    { id: 'treadmill', icon: Activity, label: 'treadmill', gps: false },
    { id: 'indoorWalk', icon: Footprints, label: 'indoorWalk', gps: false },
];

export const getActivityById = (id: string): ActivityType | undefined => {
    return ACTIVITIES.find(a => a.id === id);
};

export const getGpsActivities = () => ACTIVITIES.filter(a => a.gps);
export const getNonGpsActivities = () => ACTIVITIES.filter(a => !a.gps);
