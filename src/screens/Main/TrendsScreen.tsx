import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GlassCard } from '../../components/GlassCard';
import { GlassChart } from '../../components/GlassChart'; // Using our new mock chart
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { useLanguage } from '../../contexts/LanguageContext';

export const TrendsScreen = () => {
    const { t, isRTL } = useLanguage();

    // Mock Weekly Data
    const readinessData = [70, 75, 72, 80, 85, 82, 88];
    const sleepData = [6.5, 7.0, 7.2, 6.8, 7.5, 7.8, 7.5];
    const hrData = [60, 58, 59, 57, 56, 55, 54];

    const TrendSection = ({ title, data, color, postfix = '' }: any) => (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, isRTL && { textAlign: 'right' }]}>{title}</Text>
            <GlassCard style={styles.chartCard}>
                <View style={[styles.chartHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Text style={styles.chartPeriod}>{t('last7DaysRange')}</Text>
                    <Text style={styles.chartAverage}>{t('avg')}: {data[6]}{postfix}</Text>
                </View>

                {/* Visual Placeholder for Graph */}
                <View style={styles.graphContainer}>
                    <GlassChart
                        data={data}
                        height={100}
                        color={color}
                        strokeWidth={4}
                    />
                </View>
            </GlassCard>
        </View>
    );

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={[styles.pageTitle, isRTL && { textAlign: 'right' }]}>{t('trends')}</Text>

                <TrendSection
                    title={t('readiness')}
                    data={readinessData}
                    color={COLORS.success}
                />

                <TrendSection
                    title={t('sleepDuration')}
                    data={sleepData}
                    color={COLORS.primary}
                    postfix="h"
                />

                <TrendSection
                    title={t('restingHr')}
                    data={hrData}
                    color="#FF6B6B"
                    postfix=" bpm"
                />

            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: SPACING.l,
        paddingBottom: 100,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SPACING.l,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SPACING.m,
    },
    chartCard: {
        padding: SPACING.m,
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.l,
    },
    chartPeriod: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    chartAverage: {
        color: COLORS.textPrimary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    graphContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
