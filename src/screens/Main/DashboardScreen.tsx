import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GlassCard } from '../../components/GlassCard';
import { GlassChart } from '../../components/GlassChart';
import { LoadingRing } from '../../components/LoadingRing';
import { COLORS, FONTS, FONT_SIZE, SPACING, LAYOUT } from '../../constants/theme';
import { useLanguage } from '../../contexts/LanguageContext';
// @ts-ignore
import { Bell, Battery, CheckCircle, Target, Plus, X, Play, Zap, Wind, Moon, Sun, CloudRain, Flame, Activity, Circle, Footprints, PersonStanding, Sparkles, Trophy, Brain } from 'lucide-react-native';
import { HapticFeedback } from '../../utils/haptics';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useData, WorkoutType } from '../../contexts/DataContext';
import { Goal } from '../../contexts/DataContext';

export const DashboardScreen = () => {
    const navigation = useNavigation<any>();
    const { isConnected, isSyncing, data, addGoal, removeGoal, updateGoal } = useData();
    const { t, isRTL } = useLanguage();
    const { colors, isDark } = useTheme();
    const [showSuccess, setShowSuccess] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newTarget, setNewTarget] = useState('');
    const [newUnit, setNewUnit] = useState('');

    // Animation Values
    const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const openModal = () => {
        setModalVisible(true);
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                speed: 12,
                bounciness: 4,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const closeModal = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: Dimensions.get('window').height,
                duration: 250,
                useNativeDriver: true,
                easing: Easing.in(Easing.cubic),
            }),
        ]).start(() => setModalVisible(false));
    };

    const styles = React.useMemo(() => createStyles(colors, isDark), [colors, isDark]);

    // Wait for initial data to be ready before showing content
    useEffect(() => {
        if (data) {
            // Small delay to ensure smooth mount
            const timer = setTimeout(() => setIsMounted(true), 100);
            return () => clearTimeout(timer);
        }
    }, [data]);

    useEffect(() => {
        if (isConnected && !isSyncing) {
            setShowSuccess(true);
        } else {
            setShowSuccess(false);
        }
    }, [isConnected, isSyncing]);

    const handleAddGoal = async () => {
        if (!newTitle || !newTarget || !newUnit) {
            Alert.alert(t('missingFields'), t('missingFieldsMsg'));
            return;
        }

        HapticFeedback.success();
        await addGoal({
            title: newTitle,
            target: parseInt(newTarget) || 10,
            current: 0,
            unit: newUnit,
            color: colors.primary,
            type: 'numeric'
        });

        // Reset and close
        setNewTitle('');
        setNewTarget('');
        setNewUnit('');
        closeModal();
    };

    const handleDelete = (id: string) => {
        HapticFeedback.warning();
        Alert.alert(t('delete'), "Are you sure you want to delete this goal?", [
            { text: t('cancel'), style: "cancel" },
            { text: t('delete'), style: "destructive", onPress: () => removeGoal(id) }
        ]);
    };

    const handleIncrement = (id: string, current: number, target: number) => {
        HapticFeedback.selection();
        const step = Math.max(1, Math.round(target / 10));
        updateGoal(id, Math.min(current + step, target));
    };

    const GoalItem = ({ item }: { item: Goal }) => {
        const progress = Math.min(item.current / item.target, 1);
        const isComplete = progress >= 1;

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleIncrement(item.id, item.current, item.target)}
                onLongPress={() => handleDelete(item.id)}
            >
                <GlassCard style={styles.goalItem} contentContainerStyle={{ padding: SPACING.l }}>
                    <View style={[styles.goalHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                        <Text style={styles.goalTitle}>{item.title}</Text>
                        {isComplete ? (
                            <CheckCircle size={20} color={colors.primary} />
                        ) : (
                            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{t('tapToUpdate')}</Text>
                        )}
                    </View>

                    <View style={[styles.progressBackground, { borderColor: item.color + '33' }]}>
                        <View style={[styles.progressBar, { width: `${progress * 100}%`, backgroundColor: item.color }]} />
                    </View>

                    <View style={[styles.goalFooter, isRTL && { flexDirection: 'row-reverse' }]}>
                        <Text style={styles.goalProgress}>
                            <Text style={{ color: item.color, fontWeight: 'bold' }}>{item.current}</Text> / {item.target} {item.unit}
                        </Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{Math.round(progress * 100)}%</Text>
                    </View>
                </GlassCard>
            </TouchableOpacity>
        );
    };



    // Show loading state if no data
    if (!data) {
        return (
            <ScreenWrapper bgContext="dashboard">
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <LoadingRing size={60} />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper bgContext="dashboard">
            <ScrollView contentContainerStyle={styles.container}>
                <View style={[styles.header, isRTL && { alignItems: 'flex-end' }]}>
                    <Text style={styles.greeting}>
                        {(() => {
                            const hours = new Date().getHours();
                            if (hours >= 5 && hours < 12) return t('goodMorning');
                            if (hours >= 12 && hours < 17) return t('goodAfternoon');
                            if (hours >= 17 && hours < 21) return t('goodEvening');
                            return t('goodNight');
                        })()}
                    </Text>
                    <Text style={styles.username}>{data?.userProfile?.name || 'User'}</Text>
                </View>

                {/* Ring Connection / Health Sync Status */}
                <View style={styles.ringContainer}>
                    <LoadingRing success={showSuccess} />
                    <View style={{ alignItems: 'center' }}>
                        <Text style={styles.syncText}>
                            {isSyncing ? t('syncing') : (isConnected ? t('ringConnected') : t('notConnected'))}
                        </Text>

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                            {/* Removed Health Sync Badge and Button */}
                        </View>
                    </View>
                </View>

                {/* Key Metrics */}
                {data ? (
                    <View style={[styles.metricsGrid, isRTL && { flexDirection: 'row-reverse' }]}>
                        {/* Sleep Card */}
                        <GlassCard style={styles.metricCard} contentContainerStyle={{ padding: SPACING.m, alignItems: 'center' }}>
                            <View style={styles.iconContainer}>
                                <Moon size={24} color={colors.primary} />
                            </View>
                            <Text style={styles.metricValue}>{data.sleep.duration}</Text>
                            <Text style={styles.metricLabel}>{t('sleepScore')} {data.sleep.score}</Text>
                        </GlassCard>

                        {/* Steps Card */}
                        <GlassCard style={styles.metricCard} contentContainerStyle={{ padding: SPACING.m, alignItems: 'center' }}>
                            <View style={styles.iconContainer}>
                                <Activity size={24} color={colors.accent} />
                            </View>
                            <Text style={styles.metricValue}>{data.steps.count.toLocaleString()}</Text>
                            <Text style={styles.metricLabel}>{t('steps')}</Text>
                        </GlassCard>

                        {/* Heart Rate Card */}
                        <GlassCard style={styles.metricCard} contentContainerStyle={{ padding: SPACING.m, alignItems: 'center' }}>
                            <View style={styles.iconContainer}>
                                <Circle size={24} color="#FF6B6B" />
                            </View>
                            <Text style={styles.metricValue}>{data.heart.bpm} {t('bpm')}</Text>
                            <Text style={styles.metricLabel}>{t('avgHr')}</Text>
                        </GlassCard>

                        {/* Readiness Card */}
                        <GlassCard style={styles.metricCard} contentContainerStyle={{ padding: SPACING.m, alignItems: 'center' }}>
                            <View style={styles.iconContainer}>
                                <Circle size={24} color={colors.primary} />
                            </View>
                            <Text style={styles.metricValue}>{data.readiness.score}</Text>
                            <Text style={styles.metricLabel}>
                                {data.readiness.status === 'Good' ? t('goodStatus') :
                                    data.readiness.status === 'Fair' ? t('fairStatus') :
                                        data.readiness.status === 'Poor' ? t('poorStatus') :
                                            data.readiness.status}
                            </Text>
                        </GlassCard>
                    </View>
                ) : (
                    // Placeholder while loading data
                    <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
                        {/* Empty view, waiting for data */}
                    </View>
                )}

                {/* Mindfulness Zone */}
                <View style={[styles.sectionHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Brain size={20} color={colors.primary} style={isRTL ? { marginLeft: 10 } : { marginRight: 10 }} />
                    <Text style={styles.sectionTitle}>{t('mindfulnessZone')}</Text>
                </View>

                <View style={styles.milestonesGrid}>
                    <TouchableOpacity
                        style={[styles.milestoneCard, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#E3F2FD', width: '31%' }]}
                        onPress={() => navigation.navigate('Mindfulness', { type: 'morning_focus' })}
                    >
                        <Wind size={20} color="#3b82f6" style={{ marginBottom: 8 }} />
                        <Text style={[styles.milestoneTitle, { color: isDark ? '#93c5fd' : '#1565C0', fontSize: 12, textAlign: 'center' }]}>{t('morningFocus')}</Text>
                        <Text style={[styles.milestoneValue, { color: isDark ? colors.textPrimary : '#1976D2', fontSize: 14 }]}>10{t('mins')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.milestoneCard, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FFEBEE', width: '31%' }]}
                        onPress={() => navigation.navigate('Mindfulness', { type: 'stress_relief' })}
                    >
                        <Zap size={20} color="#ef4444" style={{ marginBottom: 8 }} />
                        <Text style={[styles.milestoneTitle, { color: isDark ? '#fca5a5' : '#C62828', fontSize: 12, textAlign: 'center' }]}>{t('stressRelief')}</Text>
                        <Text style={[styles.milestoneValue, { color: isDark ? colors.textPrimary : '#D32F2F', fontSize: 14 }]}>15{t('mins')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.milestoneCard, { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : '#E8F5E9', width: '31%' }]}
                        onPress={() => navigation.navigate('Mindfulness', { type: 'deep_sleep' })}
                    >
                        <Moon size={20} color="#22c55e" style={{ marginBottom: 8 }} />
                        <Text style={[styles.milestoneTitle, { color: isDark ? '#86efac' : '#2E7D32', fontSize: 12, textAlign: 'center' }]}>{t('powerNap')}</Text>
                        <Text style={[styles.milestoneValue, { color: isDark ? colors.textPrimary : '#388E3C', fontSize: 14 }]}>20{t('mins')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Key Milestones Section */}
                <View style={[styles.sectionHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Trophy size={20} color={colors.primary} style={isRTL ? { marginLeft: 10 } : { marginRight: 10 }} />
                    <Text style={styles.sectionTitle}>{t('keyMilestones')}</Text>
                </View>

                <View style={styles.milestonesGrid}>
                    <View style={[styles.milestoneCard, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#E3F2FD' }]}>
                        <Moon size={24} color="#3b82f6" />
                        <Text style={[styles.milestoneTitle, { color: isDark ? '#93c5fd' : '#1565C0' }]}>{t('sleepStreak')}</Text>
                        <Text style={[styles.milestoneValue, { color: isDark ? colors.textPrimary : '#1976D2' }]}>5 {t('day')}</Text>
                    </View>
                    <View style={[styles.milestoneCard, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FFEBEE' }]}>
                        <Activity size={24} color="#ef4444" />
                        <Text style={[styles.milestoneTitle, { color: isDark ? '#fca5a5' : '#C62828' }]}>{t('rhrLowBadge')}</Text>
                        <Text style={[styles.milestoneValue, { color: isDark ? colors.textPrimary : '#D32F2F' }]}>58 {t('bpm')}</Text>
                    </View>
                    <View style={[styles.milestoneCard, { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : '#E8F5E9' }]}>
                        <Trophy size={24} color="#22c55e" />
                        <Text style={[styles.milestoneTitle, { color: isDark ? '#86efac' : '#2E7D32' }]}>{t('recoveryChamp')}</Text>
                        <Text style={[styles.milestoneValue, { color: isDark ? colors.textPrimary : '#388E3C' }]}>{t('topPercent', { percent: '5' })}</Text>
                    </View>
                </View>

                {/* Biological Clock Section */}
                {data && (() => {
                    // 13 points for 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24 hours
                    const clockData = [30, 40, 50, 65, 80, 95, 85, 75, 60, 50, 40, 35, 30];
                    const clockLabels = ["00:00", "06:00", "12:00", "18:00", "24:00"];
                    const now = new Date();
                    // Each index is 2 hours. Index = H / 2.
                    const liveIndex = (now.getHours() + now.getMinutes() / 60) / 2;

                    return (
                        <GlassCard style={styles.largeCard} contentContainerStyle={{ padding: 0 }}>
                            <View style={[styles.insightHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Sparkles size={20} color={colors.primary} style={{ marginRight: 8 }} />
                                    <Text style={[styles.cardTitle, { marginBottom: 0 }]}>{t('biologicalClock')}</Text>
                                </View>
                                <Text style={styles.sourceText}>{t('energyForecast')}</Text>
                            </View>

                            <Text style={[
                                styles.insightText,
                                { color: colors.textSecondary, marginBottom: SPACING.l, marginTop: SPACING.s },
                                isRTL && { textAlign: 'right' }
                            ]}>
                                {data.readiness.score >= 80 ? t('energyHigh') : t('energyModerate')} - {t('biologicalClockMsg')}
                            </Text>

                            <View style={{ marginTop: 0, paddingBottom: SPACING.l }}>
                                <GlassChart
                                    data={clockData}
                                    height={140}
                                    width={Dimensions.get('window').width - 48}
                                    color={colors.primary}
                                    gradientId="energy-wave-grad"
                                    labels={clockLabels}
                                    liveIndex={liveIndex}
                                />
                            </View>
                        </GlassCard>
                    );
                })()}

                {/* Daily Goals Section */}
                {data && (
                    <>
                        <View style={[styles.sectionHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                            <Target size={20} color={colors.primary} style={isRTL ? { marginLeft: 10 } : { marginRight: 10 }} />
                            <Text style={styles.sectionTitle}>{t('dailyGoals') || 'Daily Goals'}</Text>
                        </View>
                        {(data.goals || []).map((goal) => (
                            <GoalItem key={goal.id} item={goal} />
                        ))}

                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => {
                                HapticFeedback.light();
                                openModal();
                            }}
                        >
                            <Plus size={20} color={colors.background} />
                            <Text style={styles.addButtonText}>{t('addNewGoal') || 'Add New Goal'}</Text>
                        </TouchableOpacity>
                    </>
                )}

                {/* Add Goal Modal */}
                <Modal
                    animationType="none"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={closeModal}
                >
                    <View style={styles.modalOverlay}>
                        <Animated.View
                            style={[
                                StyleSheet.absoluteFill,
                                { backgroundColor: 'rgba(0,0,0,0.5)', opacity: fadeAnim }
                            ]}
                        >
                            <TouchableOpacity style={{ flex: 1 }} onPress={closeModal} activeOpacity={1} />
                        </Animated.View>

                        <KeyboardAvoidingView
                            behavior={Platform.OS === "ios" ? "padding" : "height"}
                            style={{ width: '100%' }}
                        >
                            <Animated.View
                                style={[
                                    styles.modalContent,
                                    { transform: [{ translateY: slideAnim }] }
                                ]}
                            >
                                <View style={[styles.modalHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                                    <Text style={styles.modalTitle}>{t('newGoalTitle')}</Text>
                                    <TouchableOpacity onPress={closeModal}>
                                        <X size={24} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>{t('goalLabelTitle')}</Text>
                                    <TextInput
                                        style={[styles.input, isRTL && { textAlign: 'right' }]}
                                        placeholder={t('goalTitlePlaceholder')}
                                        placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
                                        value={newTitle}
                                        onChangeText={setNewTitle}
                                    />
                                </View>

                                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between' }}>
                                    <View style={[styles.inputGroup, { width: '48%' }]}>
                                        <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>{t('goalLabelTarget')}</Text>
                                        <TextInput
                                            style={[styles.input, isRTL && { textAlign: 'right' }]}
                                            placeholder={t('goalTargetPlaceholder')}
                                            placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
                                            keyboardType="numeric"
                                            value={newTarget}
                                            onChangeText={setNewTarget}
                                        />
                                    </View>
                                    <View style={[styles.inputGroup, { width: '48%' }]}>
                                        <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>{t('goalLabelUnit')}</Text>
                                        <TextInput
                                            style={[styles.input, isRTL && { textAlign: 'right' }]}
                                            placeholder={t('goalUnitPlaceholder')}
                                            placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
                                            value={newUnit}
                                            onChangeText={setNewUnit}
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity style={styles.createButton} onPress={handleAddGoal}>
                                    <Text style={styles.createButtonText}>{t('createGoalBtn')}</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        </KeyboardAvoidingView>
                    </View>
                </Modal>

            </ScrollView>
        </ScreenWrapper>
    );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    container: {
        padding: SPACING.l,
        paddingBottom: 100,
    },
    header: {
        marginBottom: SPACING.l,
    },
    greeting: {
        fontSize: FONTS.subHeaderSize,
        color: colors.textSecondary,
    },
    username: {
        fontSize: FONTS.headerSize,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    ringContainer: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
        height: 160,
        justifyContent: 'center',
    },
    syncText: {
        marginTop: SPACING.m,
        color: colors.primary,
        fontSize: 14,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: SPACING.l,
    },
    metricCard: {
        width: '48%',
        marginBottom: SPACING.m,
    },
    largeCard: {
        width: '100%',
        padding: 0,
        marginBottom: SPACING.m,
        overflow: 'hidden',
    },
    iconContainer: {
        marginBottom: SPACING.s,
        padding: SPACING.s,
        backgroundColor: colors.cardBackground,
        borderRadius: 50,
    },
    metricValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    metricLabel: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: SPACING.m,
    },
    insightHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.l,
        paddingTop: SPACING.l,
    },
    insightText: {
        fontSize: 14,
        lineHeight: 22,
        paddingHorizontal: SPACING.l,
    },
    sourceText: {
        fontSize: 10,
        color: colors.primary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    // Goals Styles
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.s,
        marginTop: SPACING.xl, // Increased from l to xl
        marginBottom: SPACING.m,
        paddingHorizontal: SPACING.xs,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.l,
        fontWeight: '600',
        color: colors.textPrimary,
        letterSpacing: 0.5,
        // No bottom margin to ensure alignment with icon
    },
    actionScroll: {
        gap: SPACING.m,
        paddingRight: SPACING.l, // Add padding for last item
        marginBottom: SPACING.l, // Add bottom margin for spacing between sections
    },
    actionCard: {
        width: 100,
        height: 110,
        borderRadius: LAYOUT.borderRadius,
        padding: SPACING.m,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.s,
    },
    actionText: {
        fontSize: FONT_SIZE.s,
        fontWeight: '600',
    },
    mindfulnessCard: {
        width: 140,
        height: 100,
        borderRadius: LAYOUT.borderRadius,
        padding: SPACING.m,
        justifyContent: 'flex-end',
        borderWidth: 1,
        borderColor: colors.cardBorder,
        position: 'relative',
        overflow: 'hidden',
    },
    playIconOverlay: {
        position: 'absolute',
        top: SPACING.s,
        right: SPACING.s,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mindfulnessTitle: {
        fontSize: FONT_SIZE.m,
        fontWeight: '700',
        marginBottom: 2,
    },
    mindfulnessSubtitle: {
        fontSize: FONT_SIZE.xs,
    },
    goalItem: {
        marginBottom: SPACING.m,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    goalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    progressBackground: {
        height: 12,
        backgroundColor: colors.cardBackground,
        borderRadius: 6,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.divider,
        marginBottom: SPACING.s,
    },
    progressBar: {
        height: '100%',
        borderRadius: 6,
    },
    goalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    goalProgress: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    addButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.m,
        borderRadius: 12,
        marginTop: SPACING.s,
        marginBottom: SPACING.xl,
    },
    addButtonText: {
        color: colors.background,
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 10,
    },
    milestonesGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.l,
    },
    milestoneCard: {
        width: '31%',
        padding: SPACING.m,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.divider,
    },
    milestoneTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 8,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    milestoneValue: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: SPACING.l,
        paddingBottom: 40,
        borderTopWidth: 1,
        borderTopColor: colors.divider,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    inputGroup: {
        marginBottom: SPACING.m,
    },
    label: {
        color: colors.textSecondary,
        marginBottom: 8,
        fontSize: 14,
        textTransform: 'uppercase',
    },
    input: {
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        padding: 16,
        color: colors.textPrimary,
        fontSize: 16,
        borderWidth: 1,
        borderColor: colors.divider,
    },
    createButton: {
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: SPACING.m,
    },
    createButtonText: {
        color: colors.background,
        fontWeight: 'bold',
        fontSize: 16,
    },
});
