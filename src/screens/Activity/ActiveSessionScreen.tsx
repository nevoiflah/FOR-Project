import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import MapView, { Polyline, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { Play, Pause, Square, MapPin, Activity, Flame, Timer as TimerIcon, ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';
import { GlassCard } from '../../components/GlassCard';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { COLORS, SPACING, FONTS } from '../../constants/theme';

import { getActivityById } from '../../constants/activities';

const { width, height } = Dimensions.get('window');

export const ActiveSessionScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { activityId } = route.params as { activityId: string };
    const activity = getActivityById(activityId);

    const context = useData();
    const saveWorkout = context?.saveWorkout; // Safely access saveWorkout
    const { colors, isDark } = useTheme();
    const { t, isRTL } = useLanguage();

    if (!activity) {
        navigation.goBack();
        return null;
    }

    const [status, setStatus] = useState<'idle' | 'running' | 'paused'>('idle');
    const [seconds, setSeconds] = useState(0);
    const [distance, setDistance] = useState(0); // in meters
    const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
    const [currentLocation, setCurrentLocation] = useState<any>(null);
    const [heartRate, setHeartRate] = useState(0);

    const mapRef = useRef<MapView>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const locationSubscription = useRef<Location.LocationSubscription | null>(null);

    // Initial Location Check for GPS activities
    useEffect(() => {
        if (activity.gps) {
            (async () => {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission to access location was denied');
                    return;
                }

                let location = await Location.getCurrentPositionAsync({});
                setCurrentLocation(location.coords);
            })();
        }
    }, [activity.gps]);

    // Timer Logic
    useEffect(() => {
        if (status === 'running') {
            timerRef.current = setInterval(() => {
                setSeconds(prev => prev + 1);
                // Simulate Heart Rate
                setHeartRate(Math.floor(Math.random() * (160 - 100) + 100));
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [status]);

    // Track Location when Running
    useEffect(() => {
        if (status === 'running' && activity.gps) {
            const startTracking = async () => {
                locationSubscription.current = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.High,
                        timeInterval: 5000,
                        distanceInterval: 5,
                    },
                    (newLocation) => {
                        const { latitude, longitude } = newLocation.coords;
                        const newCoordinte = { latitude, longitude };

                        setCurrentLocation(newLocation.coords);
                        setRouteCoordinates(prev => [...prev, newCoordinte]);

                        // Calculate distance (simplified)
                        // In a real app, use haversine formula
                        // Here we just increment for demo purpose if needed, or rely on coords length
                        setDistance(prev => prev + 5); // Mock accumulation
                    }
                );
            };
            startTracking();
        } else {
            if (locationSubscription.current) {
                locationSubscription.current.remove();
            }
        }
        return () => {
            if (locationSubscription.current) {
                locationSubscription.current.remove();
            }
        };
    }, [status, activity.gps]);

    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const ActivityIcon = activity.icon;

    const handleStop = () => {
        Alert.alert(
            t('endSession') || 'End Session',
            t('confirmEndSession') || 'Are you sure you want to end this workout?',
            [
                { text: t('cancel') || 'Cancel', style: 'cancel' },
                {
                    text: t('end') || 'End',
                    style: 'destructive',
                    onPress: async () => {
                        setStatus('idle');
                        // Save Data
                        if (saveWorkout) {
                            await saveWorkout({
                                type: activity.id as any,
                                duration: seconds,
                                calories: Math.floor(seconds * 0.15), // Mock calorie math
                                date: new Date().toISOString(),
                                distance: distance,
                            });
                        }
                        navigation.goBack();
                    }
                }
            ]
        );
    };

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <ChevronLeft size={24} color={colors.textPrimary} />
                    </TouchableOpacity>

                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text style={[styles.activityTitle, { color: colors.textPrimary }]}>
                            {t(activity.label as any) || activity.label}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                            <ActivityIcon size={16} color={colors.textSecondary} />
                            <Text style={{ color: colors.textSecondary, marginLeft: 6, fontSize: 12 }}>
                                {activity.gps ? t('gps') : t('nonGps')}
                            </Text>
                        </View>
                    </View>

                    {/* Placeholder for balance */}
                    <View style={{ width: 40 }} />
                </View>

                {/* Main Content: Map or Visuals */}
                <View style={styles.content}>
                    {activity.gps ? (
                        <View style={styles.mapContainer}>
                            {currentLocation ? (
                                <MapView
                                    ref={mapRef}
                                    style={styles.map}
                                    provider={PROVIDER_DEFAULT} // Apple Maps on iOS
                                    showsUserLocation={true}
                                    followsUserLocation={true}
                                    region={{
                                        latitude: currentLocation.latitude,
                                        longitude: currentLocation.longitude,
                                        latitudeDelta: 0.005,
                                        longitudeDelta: 0.005,
                                    }}
                                >
                                    <Polyline
                                        coordinates={routeCoordinates}
                                        strokeColor="#3b82f6"
                                        strokeWidth={4}
                                    />
                                </MapView>
                            ) : (
                                <View style={styles.mapPlaceholder}>
                                    <Text style={{ color: colors.textSecondary }}>{t('gettingLocation')}</Text>
                                </View>
                            )}
                            {/* Overlay Timer for GPS */}
                            <View style={styles.gpsTimerOverlay}>
                                <Text style={[styles.timerText, { color: '#FFF', fontSize: 32 }]}>
                                    {formatTime(seconds)}
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.indoorVisual}>
                            <View style={[styles.ringContainer, { borderColor: activity.gps ? colors.primary : colors.accent }]}>
                                <Text style={[styles.caloriesText, { color: colors.textPrimary, fontSize: 48 }]}>
                                    {formatTime(seconds)}
                                </Text>
                                <Text style={{ color: colors.textSecondary, marginTop: 4 }}>{t('durTitle')}</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Stats Grid */}
                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.5)', borderWidth: 1, borderColor: colors.divider }]}>
                        <Activity size={24} color="#ef4444" style={{ marginBottom: 4 }} />
                        <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                            {heartRate > 0 ? heartRate : '--'}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('bpm')}</Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.5)', borderWidth: 1, borderColor: colors.divider }]}>
                        <Flame size={24} color="#eab308" style={{ marginBottom: 4 }} />
                        <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                            {Math.floor(seconds * 0.15)}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('kcal')}</Text>
                    </View>

                    {activity.gps && (
                        <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.5)', borderWidth: 1, borderColor: colors.divider }]}>
                            <MapPin size={24} color="#3b82f6" style={{ marginBottom: 4 }} />
                            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                                {(distance / 1000).toFixed(2)}
                            </Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('km') || 'km'}</Text>
                        </View>
                    )}
                </View>

                {/* Controls */}
                <View style={styles.controls}>
                    {status === 'idle' ? (
                        <TouchableOpacity
                            style={[styles.playButton, { backgroundColor: '#22c55e' }]}
                            onPress={() => setStatus('running')}
                        >
                            <Play size={32} color="#FFF" fill="#FFF" />
                            <Text style={styles.controlText}>{t('start')}</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={{ flexDirection: 'row', gap: 24 }}>
                            {status === 'running' ? (
                                <TouchableOpacity
                                    style={[styles.controlButton, { backgroundColor: '#eab308' }]}
                                    onPress={() => setStatus('paused')}
                                >
                                    <Pause size={32} color="#FFF" fill="#FFF" />
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.controlButton, { backgroundColor: '#22c55e' }]}
                                    onPress={() => setStatus('running')}
                                >
                                    <Play size={32} color="#FFF" fill="#FFF" />
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={[styles.controlButton, { backgroundColor: '#ef4444' }]}
                                onPress={handleStop}
                            >
                                <Square size={32} color="#FFF" fill="#FFF" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: SPACING.l,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.m,
        paddingHorizontal: SPACING.s,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    activityTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    gpsTimerOverlay: {
        position: 'absolute',
        top: 20,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },

    timerText: {
        fontSize: 24,
        fontWeight: 'bold',
        fontVariant: ['tabular-nums'],
    },
    content: {
        flex: 1,
        marginBottom: SPACING.l,
        borderRadius: 24,
        overflow: 'hidden',
    },
    mapContainer: {
        flex: 1,
        backgroundColor: '#1f2937',
        borderRadius: 24,
        overflow: 'hidden',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    mapPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    indoorVisual: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ringContainer: {
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 10,
        borderColor: 'rgba(234, 179, 8, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    caloriesText: {
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.xl,
        gap: SPACING.s,
    },
    statCard: {
        flex: 1,
        padding: SPACING.m,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 4,
    },
    statLabel: {
        fontSize: 12,
        textTransform: 'uppercase',
    },
    controls: {
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    playButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 48,
        borderRadius: 40,
        gap: 12,
        shadowColor: "#22c55e",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    controlButton: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    controlText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    }
});
