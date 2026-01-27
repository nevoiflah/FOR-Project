import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Play, Pause, Square, Activity, Heart, Flame, Timer } from 'lucide-react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GlassCard } from '../../components/GlassCard';
import { COLORS, SPACING, FONT_SIZE } from '../../constants/theme';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { WorkoutType } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';

export const WorkoutScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { colors } = useTheme();
    const { t } = useLanguage();
    const { saveWorkout, data } = useData();
    const { type } = route.params as { type: WorkoutType } || { type: 'run' };

    const [isActive, setIsActive] = useState(true);
    const [seconds, setSeconds] = useState(0);
    const [calories, setCalories] = useState(0);
    const [heartRate, setHeartRate] = useState(data?.heart.bpm || 75);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive) {
            interval = setInterval(() => {
                setSeconds(s => s + 1);
                setCalories(c => c + (type === 'hiit' ? 0.2 : 0.1));
                setHeartRate(prev => Math.max(60, Math.min(180, prev + (Math.random() > 0.5 ? 2 : -2))));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, type]);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleEndWorkout = async () => {
        setIsActive(false);
        try {
            await saveWorkout({
                type,
                duration: seconds,
                calories: Math.floor(calories),
                date: new Date().toISOString(),
                heartRateAvg: heartRate,
            });
            Alert.alert(t('workoutSaved'), t('workoutSavedMsg'), [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error("Failed to save workout", error);
        }
    };

    const styles = createStyles(colors);

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>{t('workoutTitle', { type: t(type).toUpperCase() })}</Text>
                    <View style={styles.statusBadge}>
                        <Activity size={16} color={colors.primary} />
                        <Text style={styles.statusText}>{isActive ? t('live') : t('paused')}</Text>
                    </View>
                </View>

                <View style={styles.timerContainer}>
                    <Text style={styles.timerText}>{formatTime(seconds)}</Text>
                    <Text style={styles.timerLabel}>{t('duration')}</Text>
                </View>

                <View style={styles.statsGrid}>
                    <GlassCard style={styles.statCard}>
                        <Heart size={24} color={COLORS.danger} />
                        <Text style={styles.statValue}>{heartRate}</Text>
                        <Text style={styles.statLabel}>{t('bpm')}</Text>
                    </GlassCard>
                    <GlassCard style={styles.statCard}>
                        <Flame size={24} color={COLORS.warning} />
                        <Text style={styles.statValue}>{Math.floor(calories)}</Text>
                        <Text style={styles.statLabel}>{t('calories')}</Text>
                    </GlassCard>
                </View>

                <View style={styles.controls}>
                    <TouchableOpacity
                        style={[styles.controlButton, { backgroundColor: colors.cardBackground }]}
                        onPress={() => setIsActive(!isActive)}
                    >
                        {isActive ? <Pause size={32} color={colors.textPrimary} /> : <Play size={32} color={colors.textPrimary} />}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.controlButton, { backgroundColor: COLORS.danger }]}
                        onPress={handleEndWorkout}
                        onLongPress={handleEndWorkout}
                        delayLongPress={1000}
                    >
                        <Square size={32} color="#FFF" fill="#FFF" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.instruction}>{t('tapToEnd')}</Text>
            </View>
        </ScreenWrapper>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        padding: SPACING.l,
        justifyContent: 'space-between',
    },
    header: {
        alignItems: 'center',
        marginTop: SPACING.xl,
    },
    title: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: 'bold',
        color: colors.textPrimary,
        letterSpacing: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.xs,
        borderRadius: 20,
        marginTop: SPACING.s,
        gap: 6,
    },
    statusText: {
        color: colors.primary,
        fontWeight: 'bold',
        fontSize: FONT_SIZE.s,
    },
    timerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 200,
    },
    timerText: {
        fontSize: 80,
        fontWeight: 'bold',
        color: colors.textPrimary,
        fontVariant: ['tabular-nums'],
    },
    timerLabel: {
        color: colors.textSecondary,
        fontSize: FONT_SIZE.m,
        letterSpacing: 3,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: SPACING.m,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: SPACING.l,
    },
    statValue: {
        fontSize: FONT_SIZE.xl,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginVertical: SPACING.xs,
    },
    statLabel: {
        color: colors.textSecondary,
        fontSize: FONT_SIZE.xs,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: SPACING.xl,
        marginBottom: SPACING.l,
    },
    controlButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    instruction: {
        textAlign: 'center',
        color: colors.textSecondary,
        fontSize: FONT_SIZE.s,
        marginBottom: SPACING.m,
    }
});
