import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GlassCard } from '../../components/GlassCard';
import { GlassChart } from '../../components/GlassChart';
import { LoadingRing } from '../../components/LoadingRing';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
// @ts-ignore
import { Circle, Activity, Moon, RefreshCcw, CheckCircle2, Target, CheckCircle, Plus, X } from 'lucide-react-native';
import { HapticFeedback } from '../../utils/haptics';
import { useTheme } from '../../contexts/ThemeContext';
import { Goal } from '../../contexts/DataContext';

export const DashboardScreen = () => {
    const { isConnected, isSyncing, data, addGoal, removeGoal, updateGoal } = useData();
    const { t, isRTL } = useLanguage();
    const { colors, isDark } = useTheme();
    const [showSuccess, setShowSuccess] = useState(false);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newTarget, setNewTarget] = useState('');
    const [newUnit, setNewUnit] = useState('');

    const styles = React.useMemo(() => createStyles(colors, isDark), [colors, isDark]);



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
        setModalVisible(false);
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



    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={[styles.header, isRTL && { alignItems: 'flex-end' }]}>
                    <Text style={styles.greeting}>{t('greeting')}</Text>
                    <Text style={styles.username}>{data?.userProfile?.name || 'User'}</Text>
                </View>

                {/* Ring Connection / Health Sync Status */}
                <View style={styles.ringContainer}>
                    <LoadingRing success={showSuccess} />
                    <View style={{ alignItems: 'center' }}>
                        <Text style={styles.syncText}>
                            {isSyncing ? t('syncing') : (isConnected ? t('ringConnected') : t('connecting'))}
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
                            <Text style={styles.metricValue}>{data.heart.bpm} bpm</Text>
                            <Text style={styles.metricLabel}>{t('avgHr')}</Text>
                        </GlassCard>

                        {/* Readiness Card */}
                        <GlassCard style={styles.metricCard} contentContainerStyle={{ padding: SPACING.m, alignItems: 'center' }}>
                            <View style={styles.iconContainer}>
                                <Circle size={24} color={colors.primary} />
                            </View>
                            <Text style={styles.metricValue}>{data.readiness.score}</Text>
                            <Text style={styles.metricLabel}>{data.readiness.status}</Text>
                        </GlassCard>
                    </View>
                ) : (
                    // Placeholder while loading data
                    <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
                        {/* Empty view, waiting for data */}
                    </View>
                )}

                {/* Daily Insight */}
                {data && (
                    <GlassCard style={styles.largeCard} contentContainerStyle={{ padding: 0 }}>
                        <View style={[styles.insightHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                            <Text style={[styles.cardTitle, isRTL && { textAlign: 'right' }]}>{t('dailyInsight')}</Text>
                        </View>

                        <Text style={[
                            styles.insightText,
                            { color: colors.textSecondary, marginBottom: SPACING.l },
                            isRTL && { textAlign: 'right' }
                        ]}>
                            {data.readiness.score >= 80
                                ? t('readinessTipHigh')
                                : t('readinessTipLow')
                            }
                        </Text>

                        <View style={{ marginTop: 0 }}>
                            <GlassChart
                                data={[70, 75, 78, 85, 82, 90, data.readiness.score]}
                                height={120}
                                width={Dimensions.get('window').width - 48}
                                color={data.readiness.score >= 80 ? colors.primary : colors.accent}
                                gradientId="dash-ready-grad"
                            />
                        </View>
                    </GlassCard>
                )}

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
                                setModalVisible(true)
                            }}
                        >
                            <Plus size={20} color={colors.background} />
                            <Text style={styles.addButtonText}>{t('addNewGoal') || 'Add New Goal'}</Text>
                        </TouchableOpacity>
                    </>
                )}

                {/* Add Goal Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.modalOverlay}
                    >
                        <View style={styles.modalContent}>
                            <View style={[styles.modalHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                                <Text style={styles.modalTitle}>{t('newGoalTitle')}</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
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
                        </View>
                    </KeyboardAvoidingView>
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
        marginTop: SPACING.l,
        marginBottom: SPACING.m,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        // No bottom margin to ensure alignment with icon
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
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
