import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GlassCard } from '../../components/GlassCard';
import { GlassChart } from '../../components/GlassChart';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
// @ts-ignore
import { Heart, Activity } from 'lucide-react-native';

export const HeartScreen = () => {
    const { data } = useData();
    const { t, isRTL } = useLanguage();

    // Mock HR Trend Data


    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={[styles.pageTitle, isRTL && { textAlign: 'right' }]}>{t('heartHealth')}</Text>

                {data ? (
                    <>
                        <View style={[styles.grid, isRTL && { flexDirection: 'row-reverse' }]}>
                            <GlassCard style={styles.mainCard}>
                                <Heart size={32} color="#FF6B6B" style={{ marginBottom: 10 }} />
                                <Text style={styles.bigValue}>{data.heart.resting}</Text>
                                <Text style={styles.label}>{t('restingHr')}</Text>
                            </GlassCard>

                            <GlassCard style={styles.mainCard}>
                                <Activity size={32} color={COLORS.accent} style={{ marginBottom: 10 }} />
                                <Text style={styles.bigValue}>{data.heart.variability} ms</Text>
                                <Text style={styles.label}>{t('hrv')}</Text>
                            </GlassCard>
                        </View>

                        {/* HR Trend Graph */}
                        <View style={{ marginBottom: SPACING.l }}>
                            <Text style={[styles.sectionTitle, isRTL && { textAlign: 'right' }]}>{t('hrTrend')}</Text>
                            <GlassCard
                                style={{ alignItems: 'center', overflow: 'hidden' }}
                                contentContainerStyle={{ padding: 0, alignItems: 'center', width: '100%' }}
                            >
                                <GlassChart
                                    data={data.heart.trend}
                                    height={120}
                                    width={Dimensions.get('window').width - 48} // Full width of card
                                    color="#FF6B6B"
                                />
                            </GlassCard>
                        </View>

                        <Text style={[styles.sectionTitle, isRTL && { textAlign: 'right' }]}>{t('todaysRange')}</Text>
                        <GlassCard style={styles.rangeCard}>
                            <View style={styles.rangeBar}>
                                <View style={[styles.rangeFill, { left: '20%', width: '40%' }]} />
                                {/* Simulated range bar */}
                            </View>
                            <View style={[styles.rangeLabels, isRTL && { flexDirection: 'row-reverse' }]}>
                                <Text style={styles.rangeText}>{t('min')} 48</Text>
                                <Text style={styles.rangeText}>{t('max')} 112</Text>
                            </View>
                        </GlassCard>

                        {/* HRV Insight */}
                        <GlassCard style={[
                            styles.insightCard,
                            { marginTop: SPACING.l },
                            isRTL && { alignItems: 'flex-end' }
                        ]}>
                            <Text style={{
                                color: COLORS.accent,
                                fontWeight: 'bold',
                                marginBottom: 4,
                                textTransform: 'uppercase',
                                fontSize: 12
                            }}>
                                {t('coachStart')}
                            </Text>
                            <Text style={[styles.insightText, isRTL && { textAlign: 'right' }]}>
                                {data.heart.variability >= 40 ? t('hrvTipHigh') : t('hrvTipLow')}
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
    grid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.l,
    },
    mainCard: {
        width: '48%',
        padding: SPACING.l,
        alignItems: 'center',
        justifyContent: 'center',
        height: 160,
    },
    bigValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SPACING.s,
    },
    label: {
        fontSize: 12,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SPACING.m,
        marginTop: SPACING.m,
    },
    rangeCard: {
        padding: SPACING.l,
    },
    rangeBar: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 4,
        marginBottom: SPACING.s,
        position: 'relative',
    },
    rangeFill: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        backgroundColor: '#FF6B6B',
        borderRadius: 4,
    },
    rangeLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    rangeText: {
        color: COLORS.textSecondary,
        fontWeight: 'bold',
    },
    insightCard: {
        padding: SPACING.l,
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        borderColor: COLORS.primary,
        borderWidth: 1,
    },
    insightText: {
        color: COLORS.textPrimary,
        fontSize: 16,
        lineHeight: 24,
    },
});
