import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { HapticFeedback } from '../../utils/haptics';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GlassCard } from '../../components/GlassCard';
import { GlassChart } from '../../components/GlassChart';
import { LoadingRing } from '../../components/LoadingRing';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
// @ts-ignore
import { Heart, Activity } from 'lucide-react-native';

export const HeartScreen = () => {
    const { data, isConnected, triggerHeartRateScan, triggerSpO2Scan, triggerStressScan } = useData();
    const { t, isRTL } = useLanguage();
    const { colors, isDark } = useTheme();
    const [isMounted, setIsMounted] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    const styles = React.useMemo(() => createStyles(colors, isDark), [colors, isDark]);

    // Wait for initial data to be ready before showing content
    useEffect(() => {
        if (data) {
            const timer = setTimeout(() => setIsMounted(true), 100);
            return () => clearTimeout(timer);
        }
    }, [data]);

    const handleManualScan = async () => {
        if (!isConnected) {
            Alert.alert(t('connectRing'), t('connectToSee'));
            return;
        }

        try {
            HapticFeedback.light();
            setIsScanning(true);
            await triggerHeartRateScan();

            // Show scanning state for at least 5 seconds to match ring measurement time
            setTimeout(() => {
                setIsScanning(false);
                HapticFeedback.success();
            }, 5000);
        } catch (error) {
            console.error('[HeartScreen] Manual scan failed:', error);
            setIsScanning(false);
            Alert.alert('Scan Failed', 'Could not start heart rate measurement. Please ensure your ring is snug on your finger.');
        }
    };


    // Show loading state until mounted
    if (!isMounted || !data) {
        return (
            <ScreenWrapper bgContext="heart">
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <LoadingRing size={60} />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper bgContext="heart">
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={[styles.pageTitle, isRTL && { textAlign: 'right' }]}>{t('heartHealth')}</Text>

                {data ? (
                    <>
                        <View style={[styles.grid, isRTL && { flexDirection: 'row-reverse' }]}>
                            <GlassCard
                                style={styles.mainCard}
                                contentContainerStyle={{ padding: SPACING.l }}
                            >
                                <TouchableOpacity
                                    style={{ alignItems: 'center', width: '100%' }}
                                    onPress={handleManualScan}
                                    disabled={isScanning}
                                >
                                    <View style={styles.iconWrapper}>
                                        {isScanning ? (
                                            <ActivityIndicator size="small" color="#FF6B6B" />
                                        ) : (
                                            <Heart size={32} color="#FF6B6B" />
                                        )}
                                    </View>
                                    <Text style={styles.bigValue}>{isScanning ? data.heart.bpm || '--' : (data.heart.bpm || data.heart.resting || '--')}</Text>
                                    <Text style={styles.label}>{isScanning ? 'LIVE HR' : t('restingHr')}</Text>
                                </TouchableOpacity>
                            </GlassCard>

                            <GlassCard style={styles.mainCard} contentContainerStyle={{ padding: SPACING.l }}>
                                <TouchableOpacity
                                    style={{ alignItems: 'center', width: '100%' }}
                                    onPress={triggerStressScan}
                                    activeOpacity={0.7}
                                >
                                    <Activity size={32} color={colors.accent} style={{ marginBottom: 10 }} />
                                    <Text style={styles.bigValue}>{data.heart.variability} ms</Text>
                                    <Text style={styles.label}>{t('hrv')}</Text>
                                    <Text style={{ fontSize: 10, color: colors.textSecondary, marginTop: 4 }}>Tap to Measure</Text>
                                </TouchableOpacity>
                            </GlassCard>
                        </View>

                        {/* HR Trend Graph */}
                        <View style={{ marginBottom: SPACING.l }}>
                            <Text style={[styles.sectionTitle, isRTL && { textAlign: 'right' }]}>Heart Rate</Text>
                            <GlassCard
                                style={{ alignItems: 'center', overflow: 'hidden' }}
                                contentContainerStyle={{ padding: 0, alignItems: 'center', width: '100%' }}
                            >
                                <GlassChart
                                    data={data.heart.trend}
                                    height={150}
                                    width={Dimensions.get('window').width - 48}
                                    color="#FF6B6B"
                                    gradientId="heart-hr-grad"
                                    // @ts-ignore
                                    showXAxis={true}
                                />
                            </GlassCard>
                        </View>

                        {/* HRV Trend Graph */}
                        <View style={{ marginBottom: SPACING.l }}>
                            <Text style={[styles.sectionTitle, isRTL && { textAlign: 'right' }]}>HRV</Text>
                            <GlassCard
                                style={{ alignItems: 'center', overflow: 'hidden' }}
                                contentContainerStyle={{ padding: 0, alignItems: 'center', width: '100%' }}
                            >
                                <GlassChart
                                    data={data.heart.hrvTrend || [0, 0, 0, 0, 0]}
                                    height={120}
                                    width={Dimensions.get('window').width - 48}
                                    color={colors.accent}
                                    gradientId="heart-hrv-grad"
                                />
                            </GlassCard>
                        </View>

                        {/* SpO2 Card */}
                        <Text style={[styles.sectionTitle, isRTL && { textAlign: 'right' }]}>Blood Oxygen</Text>
                        <GlassCard style={styles.fullWidthCard} contentContainerStyle={{ padding: SPACING.l, width: '100%' }}>
                            <View style={{ width: '100%' }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <View>
                                        <Text style={styles.bigValue}>{data.heart.spo2 > 0 ? `${data.heart.spo2}%` : '--'}</Text>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>LIVE SpO2</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={triggerSpO2Scan}
                                    >
                                        <Text style={styles.actionButtonText}>Measure</Text>
                                    </TouchableOpacity>
                                </View>
                                {/* SpO2 Bar (90-100% normal range visualization) */}
                                <View style={styles.rangeBar}>
                                    <View style={[
                                        styles.rangeFill,
                                        {
                                            left: 0,
                                            width: data.heart.spo2 > 0 ? `${data.heart.spo2}%` : '0%',
                                            backgroundColor: data.heart.spo2 < 90 ? '#FFC107' : '#4CAF50'
                                        }
                                    ]} />
                                </View>
                                <View style={[styles.rangeLabels, isRTL && { flexDirection: 'row-reverse' }]}>
                                    <Text style={styles.rangeText}>0%</Text>
                                    <Text style={styles.rangeText}>100%</Text>
                                </View>
                            </View>
                        </GlassCard>

                        {/* Stress Card */}
                        <Text style={[styles.sectionTitle, isRTL && { textAlign: 'right' }]}>Stress</Text>
                        <GlassCard style={styles.fullWidthCard} contentContainerStyle={{ padding: SPACING.l, width: '100%' }}>
                            <View style={{ width: '100%' }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <View>
                                        <Text style={styles.bigValue}>{data.heart.stress > 0 ? data.heart.stress : '--'}</Text>
                                        <Text style={[styles.label, { textAlign: 'left' }]}>Stress Level</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={triggerStressScan}
                                    >
                                        <Text style={styles.actionButtonText}>Measure</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Stress Bar Visual */}
                                <View style={styles.rangeBar}>
                                    <View style={[
                                        styles.rangeFill,
                                        {
                                            width: `${data.heart.stress}%`,
                                            backgroundColor: data.heart.stress < 40 ? '#4CAF50' : data.heart.stress < 70 ? '#FFC107' : '#F44336'
                                        }
                                    ]} />
                                </View>
                                <View style={[styles.rangeLabels, isRTL && { flexDirection: 'row-reverse' }]}>
                                    <Text style={styles.rangeText}>Relaxed</Text>
                                    <Text style={styles.rangeText}>High</Text>
                                </View>
                            </View>
                        </GlassCard>

                        {/* HRV Insight */}
                        <GlassCard style={[
                            styles.insightCard,
                            { marginTop: SPACING.l },
                            isRTL && { alignItems: 'flex-end' }
                        ]} contentContainerStyle={{ padding: SPACING.l }}>
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
                                {data.heart.variability === 0
                                    ? t('awaitingData') || 'Awaiting ring metrics...'
                                    : (data.heart.variability >= 40 ? t('hrvTipHigh') : t('hrvTipLow'))
                                }
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
    grid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.l,
    },
    mainCard: {
        width: '48%',
        alignItems: 'center',
        justifyContent: 'center',
        height: 160,
    },
    fullWidthCard: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.l,
        minHeight: 120, // Give it some height but let content drive it
    },
    bigValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: SPACING.s,
    },
    label: {
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    iconWrapper: {
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: SPACING.m,
        marginTop: SPACING.m,
    },
    rangeCard: {
    },
    rangeBar: {
        height: 8,
        backgroundColor: colors.divider,
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
        color: colors.textSecondary,
        fontWeight: 'bold',
    },
    insightCard: {
    },
    insightText: {
        color: colors.textPrimary,
        fontSize: 16,
        lineHeight: 24,
    },
    actionButton: {
        backgroundColor: 'rgba(255, 107, 107, 0.2)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FF6B6B',
    },
    actionButtonText: {
        color: '#FF6B6B',
        fontWeight: 'bold',
        fontSize: 14,
    },
    stressBarContainer: {
        height: 6,
        width: 120,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 3,
        marginTop: 8,
        overflow: 'hidden',
    },
    stressBarFill: {
        height: '100%',
        borderRadius: 3,
    }
});
