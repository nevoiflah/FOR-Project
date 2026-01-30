import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Play, Pause, SkipBack, SkipForward, X } from 'lucide-react-native';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { seedMindfulnessData } from '../../utils/seedData';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { COLORS, SPACING, FONT_SIZE } from '../../constants/theme';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';

// Map legacy dashboard types to Firestore IDs
const ZONE_MAPPING: Record<string, string> = {
    'focus': 'morning_focus',
    'morning_focus': 'morning_focus',
    'deep_sleep': 'deep_sleep',
    'stress': 'stress_relief',
    'stress_relief': 'stress_relief'
};

const BACKGROUND_IMAGES: Record<string, any> = {
    'morning_focus': require('../../assets/images/mindfulness/morning.png'),
    'deep_sleep': require('../../assets/images/mindfulness/sleep.png'),
    'stress_relief': require('../../assets/images/mindfulness/stress.png'),
};

interface Track {
    id: string;
    title: string;
    duration: number; // seconds
    url: string;
}

interface ZoneData {
    id: string;
    title: string;
    description: string;
    tracks: Track[];
}

export const MindfulnessScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { colors, isDark } = useTheme();
    const { saveWorkout } = useData();

    // Route params
    const params = route.params as { type: string };
    const zoneId = ZONE_MAPPING[params.type] || 'morning_focus';

    // State
    const [zoneData, setZoneData] = useState<ZoneData | null>(null);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const soundRef = useRef<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0); // seconds
    const [duration, setDuration] = useState(0); // seconds
    const [isLoading, setIsLoading] = useState(true);
    const [isSeeding, setIsSeeding] = useState(false);

    // Load Data from Firestore
    const loadZoneData = async () => {
        setIsLoading(true);
        try {
            const docRef = doc(db, 'mindfulness_zones', zoneId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setZoneData(docSnap.data() as ZoneData);
            } else {
                setZoneData(null); // Empty state -> Show seed button
            }
        } catch (error) {
            console.error("Error fetching mindfulness data:", error);
            Alert.alert("Error", "Failed to load content.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadZoneData();

        // Audio Setup
        Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: true,
            interruptionModeIOS: InterruptionModeIOS.DoNotMix,
            interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        });

        return () => {
            if (soundRef.current) {
                console.log('Unloading sound on unmount');
                soundRef.current.unloadAsync();
            }
        };
    }, []);

    // Load Audio Track when data or index changes
    useEffect(() => {
        if (!zoneData || !zoneData.tracks[currentTrackIndex]) return;
        loadTrack(zoneData.tracks[currentTrackIndex].url);
    }, [zoneData, currentTrackIndex]);

    const loadTrack = async (url: string) => {
        try {
            // Unload previous sound
            if (soundRef.current) {
                await soundRef.current.unloadAsync();
                soundRef.current = null;
            }

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: url },
                { shouldPlay: false }, // Don't auto-play immediately on load to prevent jarring
                onPlaybackStatusUpdate
            );

            soundRef.current = newSound;
            setSound(newSound);
            // Optionally auto-play if user was already playing? 
            // For now, let's require explicit play, or auto-play if switching tracks mid-session?
            // Let's keep it manual start for first track, auto for next.
        } catch (error) {
            console.error("Error loading track:", error);
        }
    };

    const onPlaybackStatusUpdate = (status: any) => {
        if (status.isLoaded) {
            setDuration(status.durationMillis / 1000);
            setPosition(status.positionMillis / 1000);
            setIsPlaying(status.isPlaying);

            if (status.didJustFinish) {
                handleNextTrack();
            }
        }
    };

    const handlePlayPause = async () => {
        if (!soundRef.current) return;
        if (isPlaying) {
            await soundRef.current.pauseAsync();
        } else {
            await soundRef.current.playAsync();
        }
    };

    const handleNextTrack = async () => {
        if (!zoneData) return;
        if (currentTrackIndex < zoneData.tracks.length - 1) {
            setCurrentTrackIndex(prev => prev + 1);
        } else {
            // End of playlist
            setIsPlaying(false);
            if (soundRef.current) await soundRef.current.stopAsync();
            handleSessionEnd();
        }
    };

    const handlePrevTrack = async () => {
        if (!soundRef.current) return;

        // If > 3 seconds in, restart track
        if (position > 3) {
            await soundRef.current.setPositionAsync(0);
        } else {
            // Go to prev track
            if (currentTrackIndex > 0) {
                setCurrentTrackIndex(prev => prev - 1);
            }
        }
    };

    const handleSessionEnd = async () => {
        // Log workout logic here if needed
        navigation.goBack();
    };

    const handleSeed = async () => {
        setIsSeeding(true);
        const success = await seedMindfulnessData();
        if (success) {
            Alert.alert("Success", "Content initialized! Reloading...", [
                { text: "OK", onPress: loadZoneData }
            ]);
        } else {
            Alert.alert("Error", "Failed to initialize content.");
        }
        setIsSeeding(false);
    };

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const styles = createStyles(colors, isDark);

    // ------------------------------------------------------------------
    // RENDER
    // ------------------------------------------------------------------

    if (isLoading) {
        return (
            <ScreenWrapper bgContext="mindfulness">
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </ScreenWrapper>
        );
    }

    if (!zoneData) {
        return (
            <ScreenWrapper bgContext="mindfulness">
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={[styles.title, { textAlign: 'center', marginBottom: 20 }]}>
                        No Content Found
                    </Text>
                    <Text style={[styles.subtitle, { textAlign: 'center', marginBottom: 40 }]}>
                        Initialize the database with default tracks?
                    </Text>

                    <TouchableOpacity
                        style={styles.seedButton}
                        onPress={handleSeed}
                        disabled={isSeeding}
                    >
                        {isSeeding ? <ActivityIndicator color="#FFF" /> : (
                            <Text style={styles.seedButtonText}>Initialize Content</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.headerIconButton, { position: 'absolute', top: 60, right: 20 }]} onPress={() => navigation.goBack()}>
                        <X size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </ScreenWrapper>
        );
    }

    const currentTrack = zoneData.tracks[currentTrackIndex];
    const progress = duration > 0 ? (position / duration) : 0;
    const bgImage = BACKGROUND_IMAGES[zoneId] || BACKGROUND_IMAGES['morning_focus'];

    return (
        <ScreenWrapper bgContext="mindfulness">
            <View style={styles.container}>
                <View style={styles.headerControls}>
                    <TouchableOpacity style={styles.headerIconButton} onPress={handleSessionEnd}>
                        <X size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.artContainer}>
                    <View style={styles.albumArt}>
                        {/* Dynamic Image */}
                        <Image
                            source={bgImage}
                            style={styles.artImage}
                            resizeMode="cover"
                        />
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.title}>{currentTrack?.title || zoneData.title}</Text>
                    <Text style={styles.subtitle}>{zoneData.title} • Track {currentTrackIndex + 1} of {zoneData.tracks.length}</Text>
                </View>

                <View style={styles.progressContainer}>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                    </View>
                    <View style={styles.timeRow}>
                        <Text style={styles.timeText}>{formatTime(position)}</Text>
                        <Text style={styles.timeText}>{formatTime(duration)}</Text>
                    </View>
                </View>

                <View style={styles.controls}>
                    <TouchableOpacity
                        onPress={handlePrevTrack}
                        disabled={currentTrackIndex === 0 && position < 3}
                        style={{ opacity: (currentTrackIndex === 0 && position < 3) ? 0.3 : 1 }}
                    >
                        <SkipBack size={32} color={colors.textPrimary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.playButton}
                        onPress={handlePlayPause}
                    >
                        {isPlaying ? (
                            <Pause size={32} color="#FFF" fill="#FFF" />
                        ) : (
                            <Play size={32} color="#FFF" fill="#FFF" />
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleNextTrack}
                        disabled={currentTrackIndex === zoneData.tracks.length - 1}
                        style={{ opacity: (currentTrackIndex === zoneData.tracks.length - 1) ? 0.3 : 1 }}
                    >
                        <SkipForward size={32} color={colors.textPrimary} />
                    </TouchableOpacity>
                </View>
            </View>
        </ScreenWrapper>
    );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        padding: SPACING.l,
        justifyContent: 'space-around',
    },
    headerControls: {
        position: 'absolute',
        top: SPACING.l + 40,
        right: SPACING.l,
        flexDirection: 'row',
        gap: SPACING.m,
        zIndex: 10,
    },
    headerIconButton: {
        padding: SPACING.s,
        backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    artContainer: {
        alignItems: 'center',
        marginTop: SPACING.xl,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    albumArt: {
        width: 280,
        height: 280,
        borderRadius: 40,
        backgroundColor: colors.cardBackground,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.cardBorder,
        overflow: 'hidden',
    },
    artImage: {
        width: '100%',
        height: '100%',
    },
    infoContainer: {
        alignItems: 'center',
        marginTop: SPACING.m,
    },
    title: {
        fontSize: 24, // Larger title
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: SPACING.xs,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: FONT_SIZE.m,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    progressContainer: {
        width: '100%',
        marginTop: SPACING.l,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: colors.cardBackground,
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: SPACING.s,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.primary,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    timeText: {
        color: colors.textSecondary,
        fontSize: FONT_SIZE.xs,
        fontVariant: ['tabular-nums'],
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: SPACING.xl,
        marginTop: SPACING.m,
    },
    playButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },
    seedButton: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    seedButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
