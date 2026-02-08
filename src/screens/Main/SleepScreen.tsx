import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GlassCard } from '../../components/GlassCard';
import { GlassChart } from '../../components/GlassChart';
import { LoadingRing } from '../../components/LoadingRing';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
// @ts-ignore
import { Moon, Clock, BarChart2 } from 'lucide-react-native';

export const SleepScreen = () => {
    const { data } = useData();
    const { t, isRTL } = useLanguage();
    const { colors, isDark } = useTheme();
    const [isMounted, setIsMounted] = useState(false);

    const styles = React.useMemo(() => createStyles(colors, isDark), [colors, isDark]);

    // Wait for initial data to be ready before showing content
    useEffect(() => {
        if (data) {
            const timer = setTimeout(() => setIsMounted(true), 100);
            return () => clearTimeout(timer);
        }
    }, [data]);

    // Show loading state until mounted
    if (!isMounted || !data) {
        return (
            <ScreenWrapper bgContext="sleep">
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <LoadingRing size={60} />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper bgContext="sleep">
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={[styles.pageTitle, isRTL && { textAlign: 'right' }]}>{t('sleepAnalysis')}</Text>

                {data ? (
                    <>
                        {/* Main Sleep Score */}
                        <GlassCard style={[styles.scoreCard, isRTL && { flexDirection: 'row-reverse' }]} contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', padding: SPACING.l, justifyContent: 'space-around' }}>
                            <View style={styles.scoreCircle}>
                                <Text style={styles.scoreValue}>{data.sleep.score}</Text>
                                <Text style={styles.scoreLabel}>{t('score')}</Text>
                            </View>
                            <View style={[styles.textContainer, isRTL && { alignItems: 'flex-end', marginRight: SPACING.xl, marginLeft: 0 }]}>
                                <Text style={styles.sleepDuration}>{data.sleep.duration}</Text>
                                <Text style={styles.sleepSubtitle}>{t('totalSleep')}</Text>
                            </View>
                        </GlassCard>

                        {/* Weekly Trend Graph */}
                        <View style={{ marginBottom: SPACING.xl }}>
                            <Text style={[styles.sectionTitle, isRTL && { textAlign: 'right' }]}>{t('weeklyDuration')}</Text>
                            <GlassCard
                                style={{ alignItems: 'center', overflow: 'hidden' }}
                                contentContainerStyle={{ padding: 0, alignItems: 'center', width: '100%' }}
                            >
                                <GlassChart
                                    data={data.sleep.weekly}
                                    height={120}
                                    width={Dimensions.get('window').width - 48} // Full width of card (Screen - ScreenPadding)
                                    color={colors.primary}
                                    gradientId="sleep-weekly-grad"
                                />
                                <View style={{ padding: SPACING.m, width: '100%', alignItems: 'center' }}>
                                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{t('last7Days')}</Text>
                                </View>
                            </GlassCard>
                        </View>

                        {/* Sleep Stages */}
                        <Text style={[styles.sectionTitle, isRTL && { textAlign: 'right' }]}>{t('sleepStages')}</Text>
                        <GlassCard style={styles.detailsCard} contentContainerStyle={{ padding: SPACING.m }}>
                            <View style={[styles.detailRow, isRTL && { flexDirection: 'row-reverse' }]}>
                                <Text style={styles.detailLabel}>{t('deepSleep')}</Text>
                                <Text style={styles.detailValue}>1h 45m</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={[styles.detailRow, isRTL && { flexDirection: 'row-reverse' }]}>
                                <Text style={styles.detailLabel}>{t('remSleep')}</Text>
                                <Text style={styles.detailValue}>2h 10m</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={[styles.detailRow, isRTL && { flexDirection: 'row-reverse' }]}>
                                <Text style={styles.detailLabel}>{t('lightSleep')}</Text>
                                <Text style={styles.detailValue}>4h 05m</Text>
                            </View>
                        </GlassCard>

                        {/* Insight */}
                        <GlassCard style={[styles.insightCard, isRTL && { alignItems: 'flex-end' }]} contentContainerStyle={{ padding: SPACING.l }}>
                            <Text style={{
                                color: colors.accent,
                                fontWeight: 'bold',
                                marginBottom: 4,
                                textTransform: 'uppercase',
                                fontSize: 12
                            }}>
                                {t('coachStart')}
                            </Text>
                            <Text style={[styles.insightText, isRTL && { textAlign: 'right' }]}>
                                {data.sleep.score >= 80 ? t('sleepTipHigh') : t('sleepTipLow')}
                            </Text>
                        </GlassCard>
                    </>
                ) : (
                    <Text style={{ color: COLORS.textSecondary, textAlign: 'center' }}>{t('connectToSee')}</Text>
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
    pageTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: SPACING.l,
    },
    scoreCard: {
        marginBottom: SPACING.xl,
    },
    scoreCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 8,
        borderColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scoreValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    scoreLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        textTransform: 'uppercase',
    },
    textContainer: {
        marginLeft: SPACING.xl,
    },
    sleepDuration: {
        fontSize: 36,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    sleepSubtitle: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: SPACING.m,
    },
    detailsCard: {
        marginBottom: SPACING.xl,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: SPACING.m,
    },
    detailLabel: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    divider: {
        height: 1,
        backgroundColor: colors.divider,
    },
    insightCard: {
    },
    insightText: {
        color: colors.textPrimary,
        fontSize: 16,
        lineHeight: 24,
    },
});
