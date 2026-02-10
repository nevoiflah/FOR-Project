import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GlassCard } from '../../components/GlassCard';
import { GlassChart } from '../../components/GlassChart';
import { LoadingRing } from '../../components/LoadingRing';
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
    const [isMounted, setIsMounted] = useState(false);
    const [selectedTab, setSelectedTab] = useState('Day');

    const styles = React.useMemo(() => createStyles(colors, isDark), [colors, isDark]);

    // Wait for initial data to be ready before showing content
    useEffect(() => {
        if (data) {
            const timer = setTimeout(() => setIsMounted(true), 100);
            return () => clearTimeout(timer);
        }
    }, [data]);

    const screenWidth = Dimensions.get('window').width;

    // Show loading state until mounted
    if (!isMounted || !data) {
        return (
            <ScreenWrapper>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <LoadingRing size={60} />
                </View>
            </ScreenWrapper>
        );
    }

    // Helper to get graph data based on tab
    const getGraphData = () => {
        if (!data.steps?.history) return [];

        switch (selectedTab) {
            case 'Week':
                // Calculate Activity Score: Steps + (Calories / 20)
                return data.steps.history.week.map(d => d.steps + (d.calories * 2));
            case 'Month':
                return data.steps.history.month.map(d => d.steps + (d.calories * 2));
            case 'Day':
            default:
                // For Day view (hourly), show activity level
                return data.steps.history.day.map(d => d.steps + (d.calories * 2));
        }
    };

    const graphData = getGraphData();

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <Text style={[styles.pageTitle, isRTL && { textAlign: 'right' }]}>{t('activity') || 'Activity'}</Text>

                {data ? (
                    <>
                        {/* 1. Steps & Calories Cards */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xl }}>
                            {/* Steps Card */}
                            <GlassCard style={{ flex: 0.48, padding: SPACING.m }} contentContainerStyle={{ alignItems: 'center' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                    <Activity size={24} color={colors.primary} />
                                    <Text style={{ marginLeft: 8, color: colors.textSecondary, fontSize: 14 }}>{t('steps') || 'Steps'}</Text>
                                </View>
                                <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.textPrimary }}>
                                    {data.steps.count.toLocaleString()}
                                </Text>
                            </GlassCard>

                            {/* Calories Card */}
                            <GlassCard style={{ flex: 0.48, padding: SPACING.m }} contentContainerStyle={{ alignItems: 'center' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                    <Zap size={24} color={colors.accent} />
                                    <Text style={{ marginLeft: 8, color: colors.textSecondary, fontSize: 14 }}>{t('calories') || 'Kcal'}</Text>
                                </View>
                                <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.textPrimary }}>
                                    {data.steps.calories.toLocaleString()}
                                </Text>
                            </GlassCard>
                        </View>

                        {/* 2. Activity Level Graph */}
                        <View style={styles.section}>
                            <View style={[styles.sectionHeader, isRTL && { flexDirection: 'row-reverse' }, { justifyContent: 'space-between' }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <TrendingUp size={20} color={colors.accent} />
                                    <Text style={styles.sectionTitle}>{t('activityLevel') || 'Activity Level'}</Text>
                                </View>
                            </View>

                            <GlassCard style={styles.chartCard} contentContainerStyle={{ padding: SPACING.m, alignItems: 'center' }}>
                                {/* Tab Selector */}
                                <View style={{ flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20, padding: 4, marginBottom: SPACING.l }}>
                                    {['Day', 'Week', 'Month'].map((tab) => (
                                        <TouchableOpacity
                                            key={tab}
                                            onPress={() => setSelectedTab(tab)}
                                            style={{
                                                paddingVertical: 6,
                                                paddingHorizontal: 16,
                                                borderRadius: 16,
                                                backgroundColor: selectedTab === tab ? colors.primary : 'transparent'
                                            }}
                                        >
                                            <Text style={{ color: selectedTab === tab ? '#FFF' : colors.textSecondary, fontSize: 12, fontWeight: '600' }}>
                                                {t(tab.toLowerCase() as any) || tab}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* The Graph */}
                                <GlassChart
                                    data={graphData}
                                    height={180}
                                    width={screenWidth - 64}
                                    color={colors.accent}
                                    gradientId="activity-grad"
                                />
                                <View style={styles.chartFooter}>
                                    <Text style={styles.chartFooterText}>
                                        {selectedTab === 'Day' ? 'Today' : selectedTab === 'Week' ? 'Last 7 Days' : 'Last 30 Days'}
                                    </Text>
                                </View>
                            </GlassCard>
                        </View>

                        {/* Insight Card (Kept as requested) */}
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
