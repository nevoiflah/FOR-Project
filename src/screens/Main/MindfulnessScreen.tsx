import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Play, Pause, SkipBack, SkipForward, X } from 'lucide-react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GlassCard } from '../../components/GlassCard';
import { COLORS, SPACING, FONT_SIZE } from '../../constants/theme';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';

export const MindfulnessScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { colors } = useTheme();
    const { saveWorkout } = useData();
    const { title, duration } = route.params as { title: string, duration: number } || { title: 'Mindfulness', duration: 10 };

    const [isPlaying, setIsPlaying] = useState(false);
    const [timeLeft, setTimeLeft] = useState(duration * 60);
    const [sessionComplete, setSessionComplete] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(t => {
                    if (t <= 1) {
                        setSessionComplete(true);
                        setIsPlaying(false);
                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, timeLeft]);

    const handleSessionEnd = async () => {
        const timeSpent = (duration * 60) - timeLeft;
        if (timeSpent > 30) { // Only save if more than 30 seconds
            await saveWorkout({
                type: 'mindfulness',
                duration: timeSpent,
                calories: 0,
                date: new Date().toISOString(),
            });
        }
        navigation.goBack();
    };

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = 1 - (timeLeft / (duration * 60));

    const styles = createStyles(colors);

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <TouchableOpacity style={styles.closeButton} onPress={handleSessionEnd}>
                    <X size={24} color={colors.textSecondary} />
                </TouchableOpacity>

                <View style={styles.artContainer}>
                    <View style={styles.albumArt}>
                        <Text style={styles.artText}>{title.charAt(0)}</Text>
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>Meditation • {duration} min</Text>
                </View>

                <View style={styles.progressContainer}>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                    </View>
                    <View style={styles.timeRow}>
                        <Text style={styles.timeText}>{formatTime((duration * 60) - timeLeft)}</Text>
                        <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
                    </View>
                </View>

                <View style={styles.controls}>
                    <TouchableOpacity><SkipBack size={32} color={colors.textPrimary} /></TouchableOpacity>

                    <TouchableOpacity
                        style={styles.playButton}
                        onPress={() => {
                            if (sessionComplete) handleSessionEnd();
                            else setIsPlaying(!isPlaying);
                        }}
                    >
                        {sessionComplete ? <X size={32} color="#FFF" /> : (isPlaying ? <Pause size={32} color="#FFF" fill="#FFF" /> : <Play size={32} color="#FFF" fill="#FFF" />)}
                    </TouchableOpacity>

                    <TouchableOpacity><SkipForward size={32} color={colors.textPrimary} /></TouchableOpacity>
                </View>
            </View>
        </ScreenWrapper>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        padding: SPACING.l,
        justifyContent: 'space-around',
    },
    closeButton: {
        position: 'absolute',
        top: SPACING.l,
        right: SPACING.l,
        zIndex: 10,
        padding: SPACING.s,
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
        width: 250,
        height: 250,
        borderRadius: 40,
        backgroundColor: colors.cardBackground,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    artText: {
        fontSize: 80,
        color: colors.primary,
        fontWeight: 'bold',
    },
    infoContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: FONT_SIZE.xl,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: FONT_SIZE.m,
        color: colors.textSecondary,
    },
    progressContainer: {
        width: '100%',
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
});
