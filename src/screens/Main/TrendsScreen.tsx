import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GlassCard } from '../../components/GlassCard';
import { GlassChart } from '../../components/GlassChart';
import { LoadingRing } from '../../components/LoadingRing';
import { COLORS, SPACING, FONTS, LAYOUT } from '../../constants/theme';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { TranslationKey } from '../../i18n/translations';
import { useTheme } from '../../contexts/ThemeContext';
// @ts-ignore
import {
    TrendingUp, Activity, Zap, Timer, Dumbbell, MapPin,
    Footprints, Bike, Waves, Mountain, Music, Trophy, Droplet
} from 'lucide-react-native';
import { ActivitySelectionModal } from '../../components/ActivitySelectionModal';

export const TrendsScreen = () => {
    const navigation = useNavigation<any>();
    const { data, logWater } = useData();
    const { t, isRTL } = useLanguage();
    const { colors, isDark } = useTheme();
    const [isMounted, setIsMounted] = useState(false);
    const [selectedActivityTab, setSelectedActivityTab] = useState('Day');
    const [selectedStepsTab, setSelectedStepsTab] = useState('Day');
    const [activityModalVisible, setActivityModalVisible] = useState(false);

    const styles = React.useMemo(() => createStyles(colors, isDark), [colors, isDark]);

    // Wait for initial data to be ready before showing content
    useEffect(() => {
        if (data) {
            const timer = setTimeout(() => setIsMounted(true), 100);
            return () => clearTimeout(timer);
        }
    }, [data]);

    const screenWidth = Dimensions.get('window').width;

    // --- Calculate Workout Totals ---
    const workoutStats = useMemo(() => {
        if (!data?.history) return { count: 0, calories: 0, duration: '0h 0m' };

        const count = data.history.length;
        const totalCals = data.history.reduce((sum, w) => sum + w.calories, 0);
        const totalSeconds = data.history.reduce((sum, w) => sum + w.duration, 0);

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        return {
            count,
            calories: totalCals,
            duration: `${hours}h ${minutes}m`
        };
    }, [data?.history]);

    // --- Helpers for Graphs ---

    const getActivityGraphData = () => {
        if (!data?.steps?.history) return [];
        switch (selectedActivityTab) {
            case 'Week': return data.steps.history.week.map(d => d.steps + (d.calories * 2));
            case 'Month': return data.steps.history.month.map(d => d.steps + (d.calories * 2));
            case 'Day': default: return data.steps.history.day.map(d => d.steps + (d.calories * 2));
        }
    };

    const getStepsGraphData = () => {
        if (!data?.steps?.history) return [];
        switch (selectedStepsTab) {
            case 'Week': return data.steps.history.week.map(d => d.steps);
            case 'Month': return data.steps.history.month.map(d => d.steps);
            case 'Day': default: return data.steps.history.day.map(d => d.steps);
        }
    };

    const activityGraphData = getActivityGraphData();
    const stepsGraphData = getStepsGraphData();

    // --- Activity Menu Items ---
    // Moved to src/constants/activities.ts

    const handleStartActivity = (activity: any) => {
        const start = () => {
            console.log(`Starting activity: ${activity.id}`);
            // Pass only the ID to avoid non-serializable warning
            navigation.navigate('ActiveSession', { activityId: activity.id });
        };

        if (activity.gps) {
            Alert.alert(
                t('startActivityTitle'),
                `${t(activity.label as any)}\n\n${t('gpsWarning')}`,
                [
                    { text: t('cancel'), style: 'cancel' },
                    { text: t('accept'), onPress: start }
                ]
            );
        } else {
            start();
        }
    };

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <Text style={[styles.pageTitle, isRTL && { textAlign: 'right' }]}>{t('activity') || 'Activity'}</Text>

                {data ? (
                    <>
                        {/* 1. Workout Records Summary */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, isRTL && { textAlign: 'right' }]}>{t('workoutRecords')}</Text>
                            <GlassCard style={styles.recordCard}>
                                <View style={styles.recordRow}>
                                    <View style={styles.recordItem}>
                                        <Dumbbell size={24} color={colors.primary} style={{ marginBottom: 4 }} />
                                        <Text style={styles.recordValue}>{workoutStats.count}</Text>
                                        <Text style={styles.recordLabel}>{t('totalWorkouts')}</Text>
                                    </View>
                                    <View style={styles.divider} />
                                    <View style={styles.recordItem}>
                                        <Zap size={24} color={colors.accent} style={{ marginBottom: 4 }} />
                                        <Text style={styles.recordValue}>{workoutStats.calories.toLocaleString()}</Text>
                                        <Text style={styles.recordLabel}>{t('totalCalories')}</Text>
                                    </View>
                                    <View style={styles.divider} />
                                    <View style={styles.recordItem}>
                                        <Timer size={24} color={colors.warning} style={{ marginBottom: 4 }} />
                                        <Text style={styles.recordValue}>{workoutStats.duration}</Text>
                                        <Text style={styles.recordLabel}>{t('totalDuration')}</Text>
                                    </View>
                                </View>
                            </GlassCard>
                        </View>

                        {/* 2. Activity Level Graph */}
                        <View style={styles.section}>
                            <View style={[styles.sectionHeader, isRTL && { flexDirection: 'row-reverse' }, { justifyContent: 'space-between' }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <TrendingUp size={20} color={colors.accent} />
                                    <Text style={styles.sectionHeaderTitle}>{t('activityLevel') || 'Activity Level'}</Text>
                                </View>
                            </View>

                            <GlassCard style={styles.chartCard} contentContainerStyle={{ padding: SPACING.m, alignItems: 'center' }}>
                                <View style={styles.tabContainer}>
                                    {['Day', 'Week', 'Month'].map((tab) => (
                                        <TouchableOpacity
                                            key={tab}
                                            onPress={() => setSelectedActivityTab(tab)}
                                            style={[styles.tabButton, selectedActivityTab === tab && { backgroundColor: colors.primary }]}
                                        >
                                            <Text style={[styles.tabText, selectedActivityTab === tab && { color: '#FFF' }]}>
                                                {t(tab.toLowerCase() as any) || tab}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <GlassChart
                                    data={activityGraphData}
                                    height={180}
                                    width={screenWidth - 64}
                                    color={colors.accent}
                                    gradientId="activity-grad"
                                />
                            </GlassCard>
                        </View>

                        {/* 3. Steps Graph */}
                        <View style={styles.section}>
                            <View style={[styles.sectionHeader, isRTL && { flexDirection: 'row-reverse' }, { justifyContent: 'space-between' }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Footprints size={20} color={colors.primary} />
                                    <Text style={styles.sectionHeaderTitle}>{t('stepsHistory')}</Text>
                                </View>
                            </View>

                            <GlassCard style={styles.chartCard} contentContainerStyle={{ padding: SPACING.m, alignItems: 'center' }}>
                                <View style={styles.tabContainer}>
                                    {['Day', 'Week', 'Month'].map((tab) => (
                                        <TouchableOpacity
                                            key={tab}
                                            onPress={() => setSelectedStepsTab(tab)}
                                            style={[styles.tabButton, selectedStepsTab === tab && { backgroundColor: colors.primary }]}
                                        >
                                            <Text style={[styles.tabText, selectedStepsTab === tab && { color: '#FFF' }]}>
                                                {t(tab.toLowerCase() as any) || tab}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <GlassChart
                                    data={stepsGraphData}
                                    height={180}
                                    width={screenWidth - 64}
                                    color={colors.primary}
                                    gradientId="steps-grad"
                                />
                            </GlassCard>
                        </View>

                        {/* 4. Hydration Section */}
                        <View style={styles.section}>
                            <View style={[styles.sectionHeader, isRTL && { flexDirection: 'row-reverse' }, { justifyContent: 'space-between' }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Droplet size={20} color="#3b82f6" style={{ marginRight: 8 }} />
                                    <Text style={styles.sectionHeaderTitle}>{t('hydrationTitle')}</Text>
                                </View>
                            </View>

                            <View style={[styles.hydrationCard, { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 24 }]}>
                                <View style={[styles.hydrationRow, isRTL && { flexDirection: 'row-reverse' }]}>
                                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={styles.hydrationCount}>{data.hydration?.intake || 0}</Text>
                                        <Text style={styles.hydrationUnit}>{t('glasses')}</Text>
                                    </View>

                                    <View style={styles.hydrationControls}>
                                        <TouchableOpacity
                                            style={[styles.controlButton, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#3b82f6' }]}
                                            onPress={() => logWater && logWater(-1)}
                                        >
                                            <Text style={[styles.controlText, { marginTop: -2 }]}>-</Text>
                                        </TouchableOpacity>

                                        <View style={styles.dropletsContainer}>
                                            {Array.from({ length: 8 }).map((_, i) => (
                                                <View
                                                    key={i}
                                                    style={[
                                                        styles.droplet,
                                                        i < (data.hydration?.intake || 0) ? styles.dropletFilled : {}
                                                    ]}
                                                />
                                            ))}
                                        </View>

                                        <TouchableOpacity
                                            style={[styles.controlButton, { backgroundColor: '#3b82f6' }]}
                                            onPress={() => logWater && logWater(1)}
                                        >
                                            <Text style={[styles.controlText, { color: '#FFF', marginTop: -2 }]}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <Text style={styles.hydrationMessage}>
                                    {(data.hydration?.intake || 0) >= (data.hydration?.goal || 8)
                                        ? t('hydrationGoalHit')
                                        : t('hydrationMore').replace('%d', ((data.hydration?.goal || 8) - (data.hydration?.intake || 0)).toString())}
                                </Text>
                            </View>
                        </View>

                        {/* 5. Start Activity Menu */}
                        <View style={styles.section}>
                            <TouchableOpacity
                                style={[
                                    styles.startActivityCard,
                                    {
                                        width: '100%',
                                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
                                        borderWidth: 1,
                                        borderColor: colors.divider
                                    }
                                ]}
                                onPress={() => setActivityModalVisible(true)}
                            >
                                <View style={styles.startActivityContent}>
                                    <View style={styles.startIconContainer}>
                                        <Activity size={32} color="#FFF" />
                                    </View>
                                    <View style={styles.startTextContainer}>
                                        <Text style={styles.startActivityTitle}>{t('startActivityTitle')}</Text>
                                        <Text style={[styles.startActivitySubtitle, { color: colors.textSecondary }]}>{t('startActivitySubtitle')}</Text>
                                    </View>
                                    <View style={styles.startArrowContainer}>
                                        <Text style={{ color: colors.textSecondary, fontSize: 24 }}>›</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <ActivitySelectionModal
                            visible={activityModalVisible}
                            onClose={() => setActivityModalVisible(false)}
                            onSelectActivity={handleStartActivity}
                        />

                        {/* 5. Dynamic Insight Card */}
                        <View style={styles.section}>
                            <GlassCard style={styles.insightCard} contentContainerStyle={{ padding: SPACING.l }}>
                                <View style={[styles.insightHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                                    <Zap size={24} color={colors.warning} />
                                    <Text style={styles.insightTitle}>{t('tipTitle')}</Text>
                                </View>
                                <Text style={[styles.insightBody, isRTL && { textAlign: 'right' }]}>
                                    {t(
                                        useMemo(() => {
                                            const steps = data.steps?.count || 0;
                                            const calories = data.steps?.calories || 0;
                                            if (steps > 10000) return 'tipHighActivity';
                                            if (calories > 800) return 'tipRecovery';
                                            if (steps < 3000) return 'tipLowActivity';
                                            return 'tipConsistency';
                                        }, [data.steps?.count, data.steps?.calories]) as TranslationKey
                                    )}
                                </Text>
                            </GlassCard>
                        </View>

                    </>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>{t('connectToSee') || 'Sync your data to see trends'}</Text>
                    </View>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    container: {
        padding: SPACING.l,
        paddingBottom: 120, // Extra padding for scrolling
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: SPACING.l,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: SPACING.m,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    sectionHeaderTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginLeft: 10,
    },
    // Records
    recordCard: {
        padding: SPACING.m,
    },
    recordRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    recordItem: {
        flex: 1,
        alignItems: 'center',
    },
    recordValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 2,
    },
    recordLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    divider: {
        width: 1,
        height: '80%',
        backgroundColor: colors.divider,
    },
    // Charts
    chartCard: {
        overflow: 'hidden',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 20,
        padding: 4,
        marginBottom: SPACING.l
    },
    tabButton: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 16,
        backgroundColor: 'transparent'
    },
    tabText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    // Grid
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    activityButton: {
        width: '31%', // 3 columns
        marginBottom: SPACING.m,
    },
    activityCard: {
        height: 100,
        borderRadius: 16,
    },
    activityContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.s,
    },
    activityLabel: {
        marginTop: 8,
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    emptyContainer: {
        marginTop: 100,
        alignItems: 'center',
    },
    emptyText: {
        color: colors.textSecondary,
        fontSize: 16,
    },
    insightCard: {
        marginTop: SPACING.m,
    },
    insightHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    insightTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginLeft: 10,
    },
    insightBody: {
        fontSize: 16,
        color: colors.textSecondary,
        lineHeight: 24,
    },
    // Hydration
    hydrationCard: {
        padding: SPACING.l,
    },
    hydrationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.m,
    },
    hydrationCount: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#3b82f6', // Water blue
    },
    hydrationUnit: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    hydrationControls: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        marginLeft: SPACING.l,
    },
    controlButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    controlText: {
        fontSize: 20,
        color: '#3b82f6',
        fontWeight: 'bold',
        marginTop: -2,
    },
    dropletsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: 120,
        marginHorizontal: SPACING.m,
        gap: 4,
    },
    droplet: {
        width: 10,
        height: 14,
        borderRadius: 5,
        backgroundColor: colors.divider,
    },
    dropletFilled: {
        backgroundColor: '#3b82f6',
    },
    hydrationMessage: {
        textAlign: 'center',
        color: colors.textSecondary,
        fontSize: 14,
    },
    // Start Activity Button
    startActivityButton: {
        width: '100%',
        marginTop: SPACING.xs,
    },
    startActivityCard: {
        padding: SPACING.l,
        borderRadius: 24,
    },
    startActivityContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    startIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    startTextContainer: {
        flex: 1,
        marginLeft: SPACING.l,
    },
    startActivityTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    startActivitySubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    startArrowContainer: {
        marginLeft: SPACING.m,
    }
});
