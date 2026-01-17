import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GlassCard } from '../../components/GlassCard';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';
// @ts-ignore
import { Target, Moon, Activity, Edit2 } from 'lucide-react-native';

const ProgressBar = ({ progress, color }: { progress: number; color: string }) => {
    // Clamp progress between 0 and 1
    const clamped = Math.min(Math.max(progress, 0), 1);
    return (
        <View style={{
            height: 8,
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 4,
            marginTop: SPACING.m,
            overflow: 'hidden'
        }}>
            <View style={{
                height: '100%',
                width: `${clamped * 100}%`,
                backgroundColor: color,
                borderRadius: 4
            }} />
        </View>
    );
};

export const GoalsScreen = () => {
    const { t, isRTL } = useLanguage();
    const { data } = useData();

    // Mock Targets (Simulating user settings)
    const targets = {
        sleep: 8, // hours
        steps: 10000,
        readiness: 85
    };

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Text style={styles.title}>{t('yourGoals')}</Text>
                    <TouchableOpacity style={styles.editButton}>
                        <Edit2 size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                {/* Sleep Goal */}
                <GlassCard style={styles.goalCard}>
                    <View style={[styles.cardHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Moon size={24} color={COLORS.textPrimary} style={{ marginRight: 8 }} />
                            <Text style={styles.goalTitle}>{t('goalSleep')}</Text>
                        </View>
                        <Text style={styles.targetValue}>{targets.sleep}h</Text>
                    </View>

                    <View style={[styles.progressRow, isRTL && { flexDirection: 'row-reverse' }]}>
                        <Text style={styles.currentLabel}>{t('currentProgress')}</Text>
                        <Text style={styles.currentValue}>{data?.sleep.duration || '0'}</Text>
                    </View>

                    {/* Calculate mock progress: 7.2 / 8 */}
                    <ProgressBar
                        progress={data ? (parseFloat(data.sleep.duration) / targets.sleep) : 0}
                        color={COLORS.primary}
                    />
                </GlassCard>

                {/* Steps Goal */}
                <GlassCard style={styles.goalCard}>
                    <View style={[styles.cardHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Activity size={24} color={COLORS.accent} style={{ marginRight: 8 }} />
                            <Text style={styles.goalTitle}>{t('goalStep')}</Text>
                        </View>
                        <Text style={styles.targetValue}>{targets.steps.toLocaleString()}</Text>
                    </View>

                    <View style={[styles.progressRow, isRTL && { flexDirection: 'row-reverse' }]}>
                        <Text style={styles.currentLabel}>{t('currentProgress')}</Text>
                        <Text style={styles.currentValue}>{data?.steps.count.toLocaleString() || '0'}</Text>
                    </View>

                    <ProgressBar
                        progress={data ? (data.steps.count / targets.steps) : 0}
                        color={COLORS.accent}
                    />
                </GlassCard>

                {/* Readiness Goal */}
                <GlassCard style={styles.goalCard}>
                    <View style={[styles.cardHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Target size={24} color={COLORS.success} style={{ marginRight: 8 }} />
                            <Text style={styles.goalTitle}>{t('goalReadiness')}</Text>
                        </View>
                        <Text style={styles.targetValue}>{targets.readiness}</Text>
                    </View>

                    <View style={[styles.progressRow, isRTL && { flexDirection: 'row-reverse' }]}>
                        <Text style={styles.currentLabel}>{t('currentProgress')}</Text>
                        <Text style={styles.currentValue}>{data?.readiness.score || '0'}</Text>
                    </View>

                    <ProgressBar
                        progress={data ? (data.readiness.score / targets.readiness) : 0}
                        color={COLORS.success}
                    />
                </GlassCard>

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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    editButton: {
        padding: SPACING.s,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 50,
    },
    goalCard: {
        padding: SPACING.l,
        marginBottom: SPACING.l,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    goalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginLeft: 8,
    },
    targetValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    currentLabel: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    currentValue: {
        color: COLORS.textPrimary,
        fontWeight: 'bold',
        fontSize: 16,
    }
});
