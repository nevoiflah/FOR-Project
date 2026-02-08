import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Calendar, ChevronLeft, Clock, Flame, Activity, Footprints, PersonStanding, Sparkles, Moon, Heart, TrendingUp } from 'lucide-react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GlassCard } from '../../components/GlassCard';
import { GlassChart } from '../../components/GlassChart';
import { COLORS, SPACING, FONT_SIZE, LAYOUT } from '../../constants/theme';
import { useData, Workout } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { HapticFeedback } from '../../utils/haptics';

export const HistoryScreen = () => {
    const navigation = useNavigation();
    const { colors } = useTheme();
    const { data } = useData();
    const { t, isRTL } = useLanguage();
    const history = data?.history || [];

    const [activeTab, setActiveTab] = useState<'workouts' | 'stats'>('workouts');
    const [timePeriod, setTimePeriod] = useState<'7' | '30'>('7');

    const styles = createStyles(colors);

    const handleTabChange = (tab: 'workouts' | 'stats') => {
        HapticFeedback.selection();
        setActiveTab(tab);
    };

    const handlePeriodChange = (period: '7' | '30') => {
        HapticFeedback.light();
        setTimePeriod(period);
    };

    const getActivityIcon = (type: string) => {
        const iconProps = { size: 20, color: colors.primary };
        switch (type) {
            case 'run':
                return <Footprints {...iconProps} />;
            case 'walk':
                return <PersonStanding {...iconProps} />;
            case 'hiit':
                return <Flame {...iconProps} color="#FF6B6B" />;
            case 'yoga':
                return <Sparkles {...iconProps} color="#FFD93D" />;
            default:
                return <Activity {...iconProps} />;
        }
    };

    const renderItem = ({ item }: { item: Workout }) => (
        <GlassCard style={styles.historyCard} contentContainerStyle={{ padding: SPACING.m }}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: colors.cardBackground }]}>
                    {getActivityIcon(item.type)}
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.workoutType}>{item.type.toUpperCase()}</Text>
                    <Text style={styles.workoutDate}>{new Date(item.date).toLocaleDateString()}</Text>
                </View>
                <Text style={styles.calories}>{item.calories} kcal</Text>
            </View>
            <View style={styles.cardStats}>
                <View style={styles.statItem}>
                    <Clock size={16} color={colors.textSecondary} />
                    <Text style={styles.statText}>{Math.floor(item.duration / 60)} min {item.duration % 60} sec</Text>
                </View>
                {item.heartRateAvg && (
                    <View style={styles.statItem}>
                        <Activity size={16} color={colors.textSecondary} />
                        <Text style={styles.statText}>{item.heartRateAvg} bpm</Text>
                    </View>
                )}
            </View>
        </GlassCard>
    );

    const renderStatsView = () => {
        if (!data) return null;

        const screenWidth = Dimensions.get('window').width;

        return (
            <View style={styles.statsContainer}>
                {/* Time Period Selector */}
                <View style={[styles.periodSelector, isRTL && { flexDirection: 'row-reverse' }]}>
                    <TouchableOpacity
                        style={[styles.periodButton, timePeriod === '7' && styles.periodButtonActive]}
                        onPress={() => handlePeriodChange('7')}
                    >
                        <Text style={[styles.periodText, timePeriod === '7' && styles.periodTextActive]}>
                            {t('last7Days')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.periodButton, timePeriod === '30' && styles.periodButtonActive]}
                        onPress={() => handlePeriodChange('30')}
                    >
                        <Text style={[styles.periodText, timePeriod === '30' && styles.periodTextActive]}>
                            {t('last30Days')}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Sleep Stats */}
                <GlassCard style={styles.statCard} contentContainerStyle={{ padding: SPACING.m }}>
                    <View style={[styles.statHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                        <Moon size={20} color={colors.primary} />
                        <Text style={styles.statTitle}>{t('averageSleep')}</Text>
                    </View>
                    <Text style={styles.statValue}>{data.sleep.duration}</Text>
                    <Text style={styles.statSubtext}>{t('score')}: {data.sleep.score}</Text>
                    <GlassChart
                        data={data.sleep.weekly}
                        height={100}
                        width={screenWidth - 80}
                        color={colors.primary}
                        gradientId="history-sleep-grad"
                    />
                </GlassCard>

                {/* Heart Rate Stats */}
                <GlassCard style={styles.statCard} contentContainerStyle={{ padding: SPACING.m }}>
                    <View style={[styles.statHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                        <Heart size={20} color="#FF6B6B" />
                        <Text style={styles.statTitle}>{t('averageHR')}</Text>
                    </View>
                    <Text style={styles.statValue}>{data.heart.resting} {t('bpm')}</Text>
                    <Text style={styles.statSubtext}>{t('hrv')}: {data.heart.variability} ms</Text>
                    <GlassChart
                        data={data.heart.trend}
                        height={100}
                        width={screenWidth - 80}
                        color="#FF6B6B"
                        gradientId="history-heart-grad"
                    />
                </GlassCard>

                {/* Readiness Stats */}
                <GlassCard style={styles.statCard} contentContainerStyle={{ padding: SPACING.m }}>
                    <View style={[styles.statHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                        <TrendingUp size={20} color={colors.accent} />
                        <Text style={styles.statTitle}>{t('averageReadiness')}</Text>
                    </View>
                    <Text style={styles.statValue}>{data.readiness.score}</Text>
                    <GlassChart
                        data={data.readiness.weekly}
                        height={100}
                        width={screenWidth - 80}
                        color={colors.accent}
                        gradientId="history-readiness-grad"
                    />
                </GlassCard>
            </View>
        );
    };

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>History</Text>
                </View>

                {/* Tab Toggle */}
                <View style={[styles.tabContainer, isRTL && { flexDirection: 'row-reverse' }]}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'workouts' && styles.tabActive]}
                        onPress={() => handleTabChange('workouts')}
                    >
                        <Text style={[styles.tabText, activeTab === 'workouts' && styles.tabTextActive]}>
                            {t('workouts')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'stats' && styles.tabActive]}
                        onPress={() => handleTabChange('stats')}
                    >
                        <Text style={[styles.tabText, activeTab === 'stats' && styles.tabTextActive]}>
                            {t('stats')}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Conditional Rendering */}
                {activeTab === 'workouts' ? (
                    history.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Calendar size={64} color={colors.textSecondary} opacity={0.5} />
                            <Text style={styles.emptyText}>No workouts recorded yet.</Text>
                            <Text style={styles.emptySubText}>Start a workout from the Dashboard!</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={history}
                            renderItem={renderItem}
                            keyExtractor={item => item.id}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                        />
                    )
                ) : (
                    renderStatsView()
                )}
            </View>
        </ScreenWrapper >
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        padding: SPACING.m,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    backButton: {
        padding: SPACING.s,
        marginRight: SPACING.s,
    },
    title: {
        fontSize: FONT_SIZE.xl,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    listContent: {
        paddingBottom: SPACING.xl,
    },
    historyCard: {
        marginBottom: SPACING.m,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.m,
    },
    headerText: {
        flex: 1,
    },
    workoutType: {
        fontSize: FONT_SIZE.m,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    workoutDate: {
        fontSize: FONT_SIZE.s,
        color: colors.textSecondary,
    },
    calories: {
        fontSize: FONT_SIZE.m,
        fontWeight: 'bold',
        color: colors.primary,
    },
    cardStats: {
        flexDirection: 'row',
        gap: SPACING.l,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    statText: {
        color: colors.textSecondary,
        fontSize: FONT_SIZE.s,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: SPACING.xl * 2,
    },
    emptyText: {
        fontSize: FONT_SIZE.l,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginTop: SPACING.m,
    },
    emptySubText: {
        color: colors.textSecondary,
        marginTop: SPACING.s,
    },
    // Tab Toggle Styles
    tabContainer: {
        flexDirection: 'row',
        marginBottom: SPACING.l,
        backgroundColor: colors.cardBackground,
        borderRadius: LAYOUT.borderRadius,
        padding: SPACING.xs,
    },
    tab: {
        flex: 1,
        paddingVertical: SPACING.s,
        paddingHorizontal: SPACING.m,
        borderRadius: LAYOUT.borderRadius - 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabActive: {
        backgroundColor: colors.primary,
    },
    tabText: {
        fontSize: FONT_SIZE.m,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    tabTextActive: {
        color: '#FFFFFF',
    },
    // Stats View Styles
    statsContainer: {
        flex: 1,
    },
    periodSelector: {
        flexDirection: 'row',
        marginBottom: SPACING.l,
        gap: SPACING.m,
    },
    periodButton: {
        flex: 1,
        paddingVertical: SPACING.s,
        paddingHorizontal: SPACING.m,
        borderRadius: LAYOUT.borderRadius,
        backgroundColor: colors.cardBackground,
        alignItems: 'center',
        justifyContent: 'center',
    },
    periodButtonActive: {
        backgroundColor: colors.accent,
    },
    periodText: {
        fontSize: FONT_SIZE.s,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    periodTextActive: {
        color: '#FFFFFF',
    },
    statCard: {
        marginBottom: SPACING.l,
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.s,
        marginBottom: SPACING.m,
    },
    statTitle: {
        fontSize: FONT_SIZE.m,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    statValue: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: SPACING.xs,
    },
    statSubtext: {
        fontSize: FONT_SIZE.s,
        color: colors.textSecondary,
        marginBottom: SPACING.m,
    },
});
