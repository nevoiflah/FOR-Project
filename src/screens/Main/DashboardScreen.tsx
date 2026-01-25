import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GlassCard } from '../../components/GlassCard';
import { GlassChart } from '../../components/GlassChart';
import { LoadingRing } from '../../components/LoadingRing';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
// @ts-ignore
import { Circle, Activity, Moon, RefreshCcw, CheckCircle2 } from 'lucide-react-native';
import { TouchableOpacity, Alert } from 'react-native';
import { HapticFeedback } from '../../utils/haptics';
import { useTheme } from '../../contexts/ThemeContext';

export const DashboardScreen = () => {
    const { isConnected, isSyncing, data } = useData();
    const { t, isRTL } = useLanguage();
    const { colors, isDark } = useTheme();
    const [showSuccess, setShowSuccess] = useState(false);

    const styles = React.useMemo(() => createStyles(colors, isDark), [colors, isDark]);



    useEffect(() => {
        if (isConnected && !isSyncing) {
            setShowSuccess(true);
        } else {
            setShowSuccess(false);
        }
    }, [isConnected, isSyncing]);



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
                                <Circle size={24} color={colors.success} />
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
                                color={data.readiness.score >= 80 ? colors.success : colors.accent}
                                gradientId="dash-ready-grad"
                            />
                        </View>
                    </GlassCard>
                )}

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
});
