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

export const DashboardScreen = () => {
    const { isConnected, isSyncing, data } = useData();
    const { t, isRTL } = useLanguage();
    const [showSuccess, setShowSuccess] = useState(false);



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
                                <Moon size={24} color={COLORS.primary} />
                            </View>
                            <Text style={styles.metricValue}>{data.sleep.duration}</Text>
                            <Text style={styles.metricLabel}>{t('sleepScore')} {data.sleep.score}</Text>
                        </GlassCard>

                        {/* Steps Card */}
                        <GlassCard style={styles.metricCard} contentContainerStyle={{ padding: SPACING.m, alignItems: 'center' }}>
                            <View style={styles.iconContainer}>
                                <Activity size={24} color={COLORS.accent} />
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
                                <Circle size={24} color={COLORS.success} />
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
                            { color: COLORS.textSecondary, marginBottom: SPACING.l },
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
                                color={data.readiness.score >= 80 ? COLORS.success : COLORS.accent}
                                gradientId="dash-ready-grad"
                            />
                        </View>
                    </GlassCard>
                )}

            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: SPACING.l,
        paddingBottom: 100,
    },
    header: {
        marginBottom: SPACING.l,
    },
    greeting: {
        fontSize: FONTS.subHeaderSize,
        color: COLORS.textSecondary,
    },
    username: {
        fontSize: FONTS.headerSize,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    ringContainer: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
        height: 160,
        justifyContent: 'center',
    },
    syncText: {
        marginTop: SPACING.m,
        color: COLORS.primary,
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
        // padding: SPACING.m,
        // alignItems: 'center',
    },
    largeCard: {
        width: '100%',
        padding: 0, // Removed padding to allow full-width chart
        marginBottom: SPACING.m,
        overflow: 'hidden', // Ensure chart clipped at rounded corners
    },
    iconContainer: {
        marginBottom: SPACING.s,
        padding: SPACING.s,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 50,
    },
    metricValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    metricLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SPACING.m,
    },
    chartPlaceholder: {
        padding: SPACING.m,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    insightHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.l, // Added individual padding
        paddingTop: SPACING.l,        // Added individual padding
    },
    insightText: {
        fontSize: 14,
        lineHeight: 22,
        paddingHorizontal: SPACING.l, // Added individual padding
    },
    sourceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 255, 157, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        marginTop: 8,
    },
    sourceText: {
        fontSize: 10,
        color: COLORS.primary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    syncButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        marginLeft: 8,
    },
    syncButtonText: {
        fontSize: 10,
        color: COLORS.textPrimary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginLeft: 4,
    },
});
