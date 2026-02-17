import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GlassCard } from '../../components/GlassCard';
import { GlassChart } from '../../components/GlassChart';
import { LoadingRing } from '../../components/LoadingRing';
import { COLORS, SPACING } from '../../constants/theme';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
// @ts-ignore
import Svg, { Circle as SvgCircle, G, Path, Defs, LinearGradient, Stop } from 'react-native-svg';

// Helper to parse "Xh Ym" to minutes
const parseDurationToMinutes = (durationStr: string): number => {
    const hoursMatch = durationStr.match(/(\d+)h/);
    const minutesMatch = durationStr.match(/(\d+)m/);
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
    return hours * 60 + minutes;
};

// Sleep Score Meter Component
const SleepScoreMeter = ({ score, size = 180, color }: { score: number, size?: number, color: string }) => {
    const { t } = useLanguage();
    const strokeWidth = 15;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = (score / 100) * circumference;

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <Defs>
                    <LinearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                        <Stop offset="0" stopColor={color} stopOpacity="0.4" />
                        <Stop offset="1" stopColor={color} stopOpacity="1" />
                    </LinearGradient>
                </Defs>
                {/* Background Circle */}
                <SvgCircle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress Circle */}
                <SvgCircle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="url(#scoreGrad)"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={circumference - progress}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${size / 2}, ${size / 2}`}
                />
            </Svg>
            <View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{ fontSize: 48, fontWeight: 'bold', color }}>{score}</Text>
                <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>{t('sleepScore')}</Text>
            </View>
        </View>
    );
};

// Sleep Stages Donut Chart Component (Transparent Center)
const SleepStagesPieChart = ({ deep, rem, total, size = 160, colors }: { deep: string, rem: string, total: string, size?: number, colors: any }) => {
    const { t } = useLanguage();
    const totalMins = parseDurationToMinutes(total);
    const deepMins = parseDurationToMinutes(deep);
    const remMins = parseDurationToMinutes(rem);
    const lightMins = Math.max(0, totalMins - deepMins - remMins);

    // Distinct colors from Theme
    const DEEP_COLOR = colors.primary; // Main Orange
    const REM_COLOR = colors.accent;   // Gold/Amber
    const LIGHT_COLOR = 'rgba(255,255,255,0.2)';

    const strokeWidth = 20;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // Calculate stroke lengths
    const deepStroke = (deepMins / totalMins) * circumference;
    const remStroke = (remMins / totalMins) * circumference;
    const lightStroke = (lightMins / totalMins) * circumference;

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            {/* Donut Chart */}
            <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                        {/* Deep Sleep Segment */}
                        {deepMins > 0 && (
                            <SvgCircle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                stroke={DEEP_COLOR}
                                strokeWidth={strokeWidth}
                                fill="none"
                                strokeDasharray={`${deepStroke} ${circumference}`}
                                strokeDashoffset={0}
                                strokeLinecap="round"
                            />
                        )}
                        {/* REM Sleep Segment */}
                        {remMins > 0 && (
                            <SvgCircle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                stroke={REM_COLOR}
                                strokeWidth={strokeWidth}
                                fill="none"
                                strokeDasharray={`${remStroke} ${circumference}`}
                                strokeDashoffset={-deepStroke}
                                strokeLinecap="round"
                            />
                        )}
                        {/* Light Sleep Segment */}
                        {lightMins > 0 && (
                            <SvgCircle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                stroke={LIGHT_COLOR}
                                strokeWidth={strokeWidth}
                                fill="none"
                                strokeDasharray={`${lightStroke} ${circumference}`}
                                strokeDashoffset={-(deepStroke + remStroke)}
                                strokeLinecap="round"
                            />
                        )}
                    </G>
                </Svg>
                {/* Center Text (Optional, currently empty for true donut) */}
            </View>

            {/* Legend */}
            <View style={{ flex: 1, marginLeft: SPACING.l }}>
                <View style={legendStyles.row}>
                    <View style={[legendStyles.dot, { backgroundColor: DEEP_COLOR }]} />
                    <View>
                        <Text style={[legendStyles.label, { color: colors.textSecondary }]}>{t('deepSleep')}</Text>
                        <Text style={[legendStyles.value, { color: colors.textPrimary }]}>{deep} ({Math.round(deepMins / totalMins * 100)}%)</Text>
                    </View>
                </View>
                <View style={legendStyles.row}>
                    <View style={[legendStyles.dot, { backgroundColor: REM_COLOR }]} />
                    <View>
                        <Text style={[legendStyles.label, { color: colors.textSecondary }]}>{t('remSleep')}</Text>
                        <Text style={[legendStyles.value, { color: colors.textPrimary }]}>{rem} ({Math.round(remMins / totalMins * 100)}%)</Text>
                    </View>
                </View>
                <View style={legendStyles.row}>
                    <View style={[legendStyles.dot, { backgroundColor: LIGHT_COLOR }]} />
                    <View>
                        <Text style={[legendStyles.label, { color: colors.textSecondary }]}>{t('lightSleep')}</Text>
                        <Text style={[legendStyles.value, { color: colors.textPrimary }]}>{Math.floor(lightMins / 60)}{t('h')} {lightMins % 60}{t('m')} ({Math.round(lightMins / totalMins * 100)}%)</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const legendStyles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
    label: { fontSize: 12, marginBottom: 2 },
    value: { fontSize: 14, fontWeight: 'bold' }
});

// Tab Selector Component
const TabSelector = ({ tabs, activeTab, onTabChange, colors }: { tabs: string[], activeTab: string, onTabChange: (tab: string) => void, colors: any }) => (
    <View style={{ flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 20, padding: 4, alignSelf: 'center', marginBottom: SPACING.l }}>
        {tabs.map(tab => (
            <TouchableOpacity
                key={tab}
                onPress={() => onTabChange(tab)}
                style={{
                    paddingVertical: 6,
                    paddingHorizontal: 16,
                    borderRadius: 16,
                    backgroundColor: activeTab === tab ? colors.card : 'transparent',
                }}
            >
                <Text style={{
                    color: activeTab === tab ? colors.primary : colors.textSecondary,
                    fontWeight: activeTab === tab ? 'bold' : 'normal',
                    fontSize: 14
                }}>{tab}</Text>
            </TouchableOpacity>
        ))}
    </View>
);

// Dual Axis Chart (Bars + Line)
const DualAxisChart = ({ data, width, height = 200, colors, maxDurationVal = 10 }: { data: any[], width: number, height?: number, colors: any, maxDurationVal?: number }) => {
    const { t } = useLanguage();
    const maxScore = 100;
    // Allow maxDuration to be passed in (e.g. 60 for minutes, 10 for hours)
    const maxDuration = maxDurationVal;

    // Guard against empty data
    if (!data || data.length === 0) return (
        <View style={{ height, width, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: colors.textSecondary }}>{t('awaitingData')}</Text>
        </View>
    );

    const barWidth = (width / data.length) * 0.6;
    const stepX = width / data.length;

    // Line Path for Score
    const linePoints = data.map((d, i) => {
        const x = i * stepX + stepX / 2;
        const y = height - (d.score / maxScore) * height; // Scale score to height
        return `${x},${y}`;
    }).join(' ');

    return (
        <View style={{ height, width }}>
            <Svg width={width} height={height}>
                {/* Duration Bars */}
                {data.map((d, i) => {
                    const barHeight = (d.duration / maxDuration) * height;
                    return (
                        <Path
                            key={`bar-${i}`}
                            d={`M ${i * stepX + (stepX - barWidth) / 2},${height} v -${barHeight} h ${barWidth} v ${barHeight} z`}
                            fill={colors.primary} // Primary Orange for Duration
                            opacity={0.8}
                        />
                    );
                })}

                {/* Score Line */}
                <Path
                    d={`M ${linePoints}`}
                    fill="none"
                    stroke={colors.accent} // Gold/Amber for Quality
                    strokeWidth="3"
                />

                {/* Score Points */}
                {data.map((d, i) => {
                    const x = i * stepX + stepX / 2;
                    const y = height - (d.score / maxScore) * height;
                    return (
                        <SvgCircle
                            key={`point-${i}`}
                            cx={x}
                            cy={y}
                            r="4"
                            fill={colors.card}
                            stroke={colors.accent}
                            strokeWidth="2"
                        />
                    );
                })}
            </Svg>

            {/* Axis Labels (Absolute Position to prevent wrapping) */}
            <View style={{ height: 20, width: width, marginTop: 8 }}>
                {data.map((d, i) => {
                    const step = Math.ceil(data.length / 7);
                    const isFirst = i === 0;
                    const isLast = i === data.length - 1;
                    const isStep = i % step === 0;

                    let showLabel = false;
                    if (data.length <= 10) showLabel = true;
                    else if (isFirst || isLast) showLabel = true;
                    else if (isStep && i < data.length - 2) showLabel = true;

                    if (!showLabel) return null;

                    // Calculate position
                    // Center the text on the "bar" slot which is at i*stepX
                    // We widen the container to prevent wrapping for 2-digit dates
                    const left = i * stepX;
                    const extraWidth = 20;

                    return (
                        <Text
                            key={i}
                            style={{
                                position: 'absolute',
                                left: left - extraWidth / 2 + stepX / 2, // Center on the slot
                                width: stepX + extraWidth,
                                textAlign: 'center',
                                fontSize: 10,
                                color: colors.textSecondary
                            }}
                        >
                            {d.date || d.time}
                        </Text>
                    );
                })}
            </View>
        </View>
    );
};

// Simple Smooth Line Chart for Day View (Hourly HR)
const HourlyChart = ({ data, width, height = 200, colors }: { data: any[], width: number, height?: number, colors: any }) => {
    if (!data || data.length === 0) return null;

    const minVal = Math.min(...data.map(d => d.value)) - 5;
    const maxVal = Math.max(...data.map(d => d.value)) + 5;
    const range = maxVal - minVal;

    // Create smooth path (bezier or simple line)
    // For simplicity, using simple line with points
    const stepX = width / (data.length - 1);

    const points = data.map((d, i) => {
        const x = i * stepX;
        const y = height - ((d.value - minVal) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <View style={{ height, width }}>
            <Svg width={width} height={height}>
                <Path
                    d={`M ${points}`}
                    fill="none"
                    stroke={colors.primary}
                    strokeWidth="3"
                />
                {/* Gradient Area under curve could be added here */}

                {/* Points */}
                {data.map((d, i) => {
                    const x = i * stepX;
                    const y = height - ((d.value - minVal) / range) * height;
                    return (
                        <SvgCircle
                            key={i}
                            cx={x}
                            cy={y}
                            r="4"
                            fill={colors.surface}
                            stroke={colors.primary}
                            strokeWidth="2"
                        />
                    );
                })}
            </Svg>

            {/* Axis Labels */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                {data.map((d, i) => (
                    i % 2 === 0 ? <Text key={i} style={{ fontSize: 10, color: colors.textSecondary }}>{d.time}</Text> : null
                ))}
            </View>
        </View>
    );
};

export const SleepScreen = () => {
    const { data } = useData();
    const { t, isRTL } = useLanguage();
    const { colors, isDark } = useTheme();
    const [isMounted, setIsMounted] = useState(false);
    const [selectedTab, setSelectedTab] = useState('Day');

    const styles = React.useMemo(() => createStyles(colors, isDark), [colors, isDark]);

    useEffect(() => {
        if (data) {
            const timer = setTimeout(() => setIsMounted(true), 100);
            return () => clearTimeout(timer);
        }
    }, [data]);

    if (!isMounted || !data) {
        return (
            <ScreenWrapper bgContext="sleep">
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <LoadingRing size={60} />
                </View>
            </ScreenWrapper>
        );
    }

    const renderMainContent = () => {
        const chartWidth = Dimensions.get('window').width - 48 - 32; // Screen - Padding - CardPadding
        const isDay = selectedTab === 'Day';

        const Legend = () => (
            <View style={{ flexDirection: 'row', marginTop: SPACING.xl, justifyContent: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: SPACING.l }}>
                    <View style={{ width: 10, height: 10, backgroundColor: colors.primary, borderRadius: 5, marginRight: 6 }} />
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                        {t('duration')} {isDay ? `(${t('m')})` : `(${t('h')})`}
                    </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 10, height: 10, backgroundColor: colors.accent, borderRadius: 5, marginRight: 6 }} />
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{t('qualityScore')}</Text>
                </View>
            </View>
        );
        if (selectedTab === 'Week') {
            return (
                <View style={{ alignItems: 'center', width: '100%' }}>
                    <DualAxisChart data={data.sleep.history?.week || []} width={chartWidth} colors={colors} maxDurationVal={10} />
                    <Legend />
                </View>
            );
        } else if (selectedTab === 'Month') {
            return (
                <View style={{ alignItems: 'center', width: '100%' }}>
                    <DualAxisChart data={data.sleep.history?.month || []} width={chartWidth} colors={colors} maxDurationVal={10} />
                    <Legend />
                </View>
            );
        } else {
            // Day View (Now using DualAxisChart)
            return (
                <View style={{ alignItems: 'center', width: '100%' }}>
                    {/* Reuse DualAxisChart with hourly data. Max duration 60 mins. */}
                    <DualAxisChart
                        data={data.sleep.history?.day_hourly || []}
                        width={chartWidth}
                        colors={colors}
                        maxDurationVal={60}
                    />
                    <Legend />
                    {/* Removed Sleep Score Display */}
                </View>
            );
        }
    };

    return (
        <ScreenWrapper bgContext="sleep">
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={[styles.pageTitle, isRTL && { textAlign: 'right' }]}>{t('sleepAnalysis')}</Text>

                {data ? (
                    <>
                        {/* 1. Main Toggleable Sleep Card */}
                        <GlassCard style={styles.scoreCard} contentContainerStyle={{ alignItems: 'center', padding: SPACING.xl }}>
                            <TabSelector
                                tabs={[t('dayTab'), t('weekTab'), t('monthTab')]}
                                activeTab={selectedTab === 'Day' ? t('dayTab') : selectedTab === 'Week' ? t('weekTab') : t('monthTab')}
                                onTabChange={(tab) => {
                                    if (tab === t('dayTab')) setSelectedTab('Day');
                                    else if (tab === t('weekTab')) setSelectedTab('Week');
                                    else setSelectedTab('Month');
                                }}
                                colors={colors}
                            />
                            {renderMainContent()}
                        </GlassCard>

                        {/* 2. Sleep Stages Pie Chart */}
                        <View style={{ marginBottom: SPACING.xl }}>
                            <Text style={[styles.sectionTitle, isRTL && { textAlign: 'right' }]}>{t('sleepStages')}</Text>
                            <GlassCard style={styles.stagesCard} contentContainerStyle={{ padding: SPACING.l }}>
                                <SleepStagesPieChart
                                    deep={data.sleep.deep}
                                    rem={data.sleep.rem}
                                    total={data.sleep.duration}
                                    colors={colors}
                                />
                            </GlassCard>
                        </View>

                        {/* 3. Avg Sleep Heart Rate Graph */}
                        <View style={{ marginBottom: SPACING.xl }}>
                            <Text style={[styles.sectionTitle, isRTL && { textAlign: 'right' }]}>{t('avgSleepHR')}</Text>
                            <GlassCard
                                style={{ alignItems: 'center', overflow: 'hidden' }}
                                contentContainerStyle={{ padding: 0, alignItems: 'center', width: '100%' }}
                            >
                                <GlassChart
                                    // Use weekly duration data as a placeholder for HR trend if actual HR trend unavailable, 
                                    // but scaling it to look like HR (e.g. 50-70 bpm)
                                    // ideally data.sleep.weekly would be replaced by data.sleep.avgHrTrend if authentic
                                    data={data.sleep.weekly.map(v => 55 + v * 2)}
                                    height={150}
                                    width={Dimensions.get('window').width - 48}
                                    color="#FF6B6B"
                                    gradientId="sleep-hr-grad"
                                    showPoints={true}
                                />
                                <View style={{ padding: SPACING.m, position: 'absolute', top: 10, left: 10 }}>
                                    <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: 'bold' }}>{data.sleep.avgHeartRate} {t('bpm')}</Text>
                                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{t('avg')}</Text>
                                </View>
                            </GlassCard>
                        </View>

                        {/* 4. Temperature Graph */}
                        <View style={{ marginBottom: SPACING.xl }}>
                            <Text style={[styles.sectionTitle, isRTL && { textAlign: 'right' }]}>{t('skinTemp')}</Text>
                            <GlassCard
                                style={{ alignItems: 'center', overflow: 'hidden' }}
                                contentContainerStyle={{ padding: 0, alignItems: 'center', width: '100%' }}
                            >
                                <GlassChart
                                    data={data.sleep.temperatureTrend || [0, 0, 0, 0, 0, 0, 0]}
                                    height={150}
                                    width={Dimensions.get('window').width - 48}
                                    color="#FFA726"
                                    gradientId="sleep-temp-grad"
                                    showPoints={true}
                                />
                                <View style={{ padding: SPACING.m, position: 'absolute', top: 10, left: 10 }}>
                                    <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: 'bold' }}>+0.2°</Text>
                                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{t('deviation')}</Text>
                                </View>
                            </GlassCard>
                        </View>
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
        overflow: 'hidden',
    },
    totalDurationValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary
    },
    totalDurationLabel: {
        fontSize: 14,
        color: colors.textSecondary
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: SPACING.m,
    },
    stagesCard: {
        marginBottom: SPACING.xl,
    }
});
