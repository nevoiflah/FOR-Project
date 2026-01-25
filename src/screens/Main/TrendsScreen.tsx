import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GlassCard } from '../../components/GlassCard';
import { GlassChart } from '../../components/GlassChart';
import { COLORS, SPACING, FONTS } from '../../constants/theme';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
// @ts-ignore
import { TrendingUp, Activity, Zap } from 'lucide-react-native';

export const TrendsScreen = () => {
    const { data } = useData();
    const { t, isRTL } = useLanguage();
    const { colors, isDark } = useTheme();

    const styles = React.useMemo(() => createStyles(colors, isDark), [colors, isDark]);

    const screenWidth = Dimensions.get('window').width;

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <Text style={[styles.pageTitle, isRTL && { textAlign: 'right' }]}>{t('healthTrends') || 'Health Trends'}</Text>

                {data ? (
                    <>
                        {/* Readiness Trend */}
                        <View style={styles.section}>
                            <View style={[styles.sectionHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                                <TrendingUp size={20} color={colors.primary} />
                                <Text style={styles.sectionTitle}>{t('readinessTrend') || 'Readiness Trend'}</Text>
                            </View>
                            <GlassCard style={styles.chartCard} contentContainerStyle={{ padding: 0 }}>
                                <GlassChart
                                    data={data.readiness.weekly}
                                    height={150}
                                    width={screenWidth - 48}
                                    color={colors.primary}
                                    gradientId="trend-ready-grad"
                                />
                                <View style={styles.chartFooter}>
                                    <Text style={styles.chartFooterText}>{t('last7Days') || 'Last 7 Days'}</Text>
                                </View>
                            </GlassCard>
                        </View>

                        {/* Activity Level */}
                        <View style={styles.section}>
                            <View style={[styles.sectionHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                                <Activity size={20} color={colors.accent} />
                                <Text style={styles.sectionTitle}>{t('activityTrend') || 'Activity Trend'}</Text>
                            </View>
                            <GlassCard style={styles.chartCard} contentContainerStyle={{ padding: 0 }}>
                                <GlassChart
                                    data={[1200, 1500, 1100, 1800, 2200, 1900, 2500]}
                                    height={150}
                                    width={screenWidth - 48}
                                    color={colors.accent}
                                    gradientId="trend-active-grad"
                                />
                                <View style={styles.chartFooter}>
                                    <Text style={styles.chartFooterText}>{t('caloriesBurned') || 'Avg Calories Burned'}</Text>
                                </View>
                            </GlassCard>
                        </View>

                        {/* Insight Card */}
                        <GlassCard style={styles.insightCard} contentContainerStyle={{ padding: SPACING.l }}>
                            <View style={[styles.insightHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                                <Zap size={24} color={colors.warning} />
                                <Text style={styles.insightTitle}>{t('monthlyInsight') || 'Monthly Insight'}</Text>
                            </View>
                            <Text style={[styles.insightBody, isRTL && { textAlign: 'right' }]}>
                                {t('monthlyInsightBody')}
                            </Text>
                        </GlassCard>
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
        paddingBottom: 100,
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
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginLeft: 10,
    },
    chartCard: {
        overflow: 'hidden',
    },
    chartFooter: {
        padding: SPACING.m,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.divider,
    },
    chartFooterText: {
        color: colors.textSecondary,
        fontSize: 12,
        textTransform: 'uppercase',
    },
    insightCard: {
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        color: colors.textSecondary,
        fontSize: 16,
    }
});
