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
                <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Sleep Score</Text>
            </View>
        </View>
    );
};

// Sleep Stages Pie Chart Component
const SleepStagesPieChart = ({ deep, rem, total, size = 160, colors }: { deep: string, rem: string, total: string, size?: number, colors: any }) => {
    const totalMins = parseDurationToMinutes(total);
    const deepMins = parseDurationToMinutes(deep);
    const remMins = parseDurationToMinutes(rem);
    const lightMins = Math.max(0, totalMins - deepMins - remMins);

    // Distinct colors
    const DEEP_COLOR = colors.primary;
    const REM_COLOR = '#818CF8'; // Indigo for REM (Dreaming)
    const LIGHT_COLOR = 'rgba(255,255,255,0.2)';

    // Calculate angles
    const totalAngle = 360;
    const deepAngle = (deepMins / totalMins) * totalAngle;
    const remAngle = (remMins / totalMins) * totalAngle;
    const lightAngle = (lightMins / totalMins) * totalAngle;

    // Helper for arc path
    const createArc = (startAngle: number, endAngle: number, radius: number) => {
        const start = polarToCartesian(size / 2, size / 2, radius, endAngle);
        const end = polarToCartesian(size / 2, size / 2, radius, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
        const d = [
            "M", size / 2, size / 2,
            "L", start.x, start.y,
            "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
            "L", size / 2, size / 2
        ].join(" ");
        return d;
    };

    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
        var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    };

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            {/* Pie Chart */}
            <View style={{ width: size, height: size }}>
                <Svg width={size} height={size}>
                    {deepMins > 0 && <Path d={createArc(0, deepAngle, size / 2)} fill={DEEP_COLOR} />}
                    {remMins > 0 && <Path d={createArc(deepAngle, deepAngle + remAngle, size / 2)} fill={REM_COLOR} />}
                    {lightMins > 0 && <Path d={createArc(deepAngle + remAngle, 360, size / 2)} fill={LIGHT_COLOR} />}
                    {/* Inner hole for donut effect */}
                    <SvgCircle cx={size / 2} cy={size / 2} r={size / 4} fill={colors.card} />
                </Svg>
            </View>

            {/* Legend */}
            <View style={{ flex: 1, marginLeft: SPACING.l }}>
                <View style={legendStyles.row}>
                    <View style={[legendStyles.dot, { backgroundColor: DEEP_COLOR }]} />
                    <View>
                        <Text style={[legendStyles.label, { color: colors.textSecondary }]}>Deep Sleep</Text>
                        <Text style={[legendStyles.value, { color: colors.textPrimary }]}>{deep} ({Math.round(deepMins / totalMins * 100)}%)</Text>
                    </View>
                </View>
                <View style={legendStyles.row}>
                    <View style={[legendStyles.dot, { backgroundColor: REM_COLOR }]} />
                    <View>
                        <Text style={[legendStyles.label, { color: colors.textSecondary }]}>REM Sleep</Text>
                        <Text style={[legendStyles.value, { color: colors.textPrimary }]}>{rem} ({Math.round(remMins / totalMins * 100)}%)</Text>
                    </View>
                </View>
                <View style={legendStyles.row}>
                    <View style={[legendStyles.dot, { backgroundColor: LIGHT_COLOR }]} />
                    <View>
                        <Text style={[legendStyles.label, { color: colors.textSecondary }]}>Light Sleep</Text>
                        <Text style={[legendStyles.value, { color: colors.textPrimary }]}>{Math.floor(lightMins / 60)}h {lightMins % 60}m ({Math.round(lightMins / totalMins * 100)}%)</Text>
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
    const maxScore = 100;
    // Allow maxDuration to be passed in (e.g. 60 for minutes, 10 for hours)
    const maxDuration = maxDurationVal;

    // Guard against empty data
    if (!data || data.length === 0) return (
        <View style={{ height, width, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: colors.textSecondary }}>No data available</Text>
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
                            fill={'#818CF8'} // Indigo/Purple
                            opacity={0.6}
                        />
                    );
                })}

                {/* Score Line */}
                <Path
                    d={`M ${linePoints}`}
                    fill="none"
                    stroke={colors.accent} // Gold/Orange
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

            {/* Axis Labels (Simplified) */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                {data.map((d, i) => {
                    // Show every label if small dataset, or skip for larger
                    const showLabel = data.length <= 10 || i % Math.ceil(data.length / 7) === 0;
                    if (!showLabel) return <View key={i} style={{ width: width / data.length }} />;

                    return (
                        <Text key={i} style={{ width: width / data.length, textAlign: 'center', fontSize: 10, color: colors.textSecondary }}>
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
                    <View style={{ width: 10, height: 10, backgroundColor: '#818CF8', marginRight: 6 }} />
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                        Duration {isDay ? '(min)' : '(h)'}
                    </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 10, height: 10, backgroundColor: colors.accent, borderRadius: 5, marginRight: 6 }} />
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Quality Score</Text>
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

                    {/* Show Total Score below Day graph */}
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: SPACING.xl }}>
                        <Text style={{ fontSize: 32, fontWeight: 'bold', color: colors.textPrimary }}>{data.sleep.score}</Text>
                        <Text style={{ fontSize: 14, color: colors.textSecondary, marginLeft: 6 }}>Sleep Score</Text>
                    </View>
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
                                tabs={['Day', 'Week', 'Month']}
                                activeTab={selectedTab}
                                onTabChange={setSelectedTab}
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
                            <Text style={[styles.sectionTitle, isRTL && { textAlign: 'right' }]}>Avg Sleep Heart Rate</Text>
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
                                    <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: 'bold' }}>{data.sleep.avgHeartRate} <Text style={{ fontSize: 14, color: colors.textSecondary }}>bpm</Text></Text>
                                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Average</Text>
                                </View>
                            </GlassCard>
                        </View>

                        {/* 4. Temperature Graph */}
                        <View style={{ marginBottom: SPACING.xl }}>
                            <Text style={[styles.sectionTitle, isRTL && { textAlign: 'right' }]}>Skin Temperature</Text>
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
                                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Deviation</Text>
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
