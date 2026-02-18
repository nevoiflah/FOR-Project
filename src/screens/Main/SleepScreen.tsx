import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Pressable } from 'react-native';
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
import { ChevronRight } from 'lucide-react-native';
import { TranslationKey } from '../../i18n/translations';

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

// Sleep Stages Donut Chart Component (With Center Text)
const SleepStagesPieChart = ({ deep, rem, total, size = 160, colors }: { deep: string, rem: string, total: string, size?: number, colors: any }) => {
    const { t } = useLanguage();
    const totalMins = parseDurationToMinutes(total);
    const deepMins = parseDurationToMinutes(deep);
    const remMins = parseDurationToMinutes(rem);
    const lightMins = Math.max(0, totalMins - deepMins - remMins);

    const [selectedStage, setSelectedStage] = useState<'Deep' | 'REM' | 'Light' | null>(null);

    // Distinct colors from Theme
    const DEEP_COLOR = colors.primary;
    const REM_COLOR = colors.accent;
    const LIGHT_COLOR = 'rgba(255,255,255,0.2)';

    const strokeWidth = 20;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    const getArcPath = (startPercent: number, endPercent: number, r: number) => {
        const [startX, startY] = getCoordinatesForPercent(startPercent);
        const [endX, endY] = getCoordinatesForPercent(endPercent);

        const largeArcFlag = endPercent - startPercent > 0.5 ? 1 : 0;

        const centerX = size / 2;
        const centerY = size / 2;

        return [
            `M ${centerX + r * startX} ${centerY + r * startY}`,
            `A ${r} ${r} 0 ${largeArcFlag} 1 ${centerX + r * endX} ${centerY + r * endY}`
        ].join(' ');
    };

    const deepPercent = deepMins / totalMins;
    const remPercent = remMins / totalMins;
    const lightPercent = lightMins / totalMins;

    const handleStagePress = (stage: 'Deep' | 'REM' | 'Light') => {
        setSelectedStage(selectedStage === stage ? null : stage);
    };

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            {/* Donut Chart */}
            <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                        {/* Deep Sleep Segment */}
                        {deepMins > 0 && (
                            <Path
                                d={getArcPath(0, deepPercent, radius)}
                                stroke={DEEP_COLOR}
                                strokeWidth={selectedStage === 'Deep' ? strokeWidth + 4 : strokeWidth}
                                fill="none"
                                strokeLinecap="round"
                                onPress={() => handleStagePress('Deep')}
                            />
                        )}
                        {/* REM Sleep Segment */}
                        {remMins > 0 && (
                            <Path
                                d={getArcPath(deepPercent, deepPercent + remPercent, radius)}
                                stroke={REM_COLOR}
                                strokeWidth={selectedStage === 'REM' ? strokeWidth + 4 : strokeWidth}
                                fill="none"
                                strokeLinecap="round"
                                onPress={() => handleStagePress('REM')}
                            />
                        )}
                        {/* Light Sleep Segment */}
                        {lightMins > 0 && (
                            <Path
                                d={getArcPath(deepPercent + remPercent, 1, radius)}
                                stroke={LIGHT_COLOR}
                                strokeWidth={selectedStage === 'Light' ? strokeWidth + 4 : strokeWidth}
                                fill="none"
                                strokeLinecap="round"
                                onPress={() => handleStagePress('Light')}
                            />
                        )}
                    </G>
                </Svg>
                {/* Center Text */}
                <View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center' }]}>
                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 2 }}>
                        {selectedStage ? t((selectedStage.toLowerCase() + 'Sleep') as any) : t('totalSleep')}
                    </Text>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.textPrimary }}>
                        {selectedStage === 'Deep' ? deep :
                            selectedStage === 'REM' ? rem :
                                selectedStage === 'Light' ? `${Math.floor(lightMins / 60)}${t('h')} ${lightMins % 60}${t('m')}` :
                                    total}
                    </Text>
                </View>
            </View>

            {/* Legend */}
            <View style={{ flex: 1, marginLeft: SPACING.l }}>
                <TouchableOpacity onPress={() => handleStagePress('Deep')} style={legendStyles.row}>
                    <View style={[legendStyles.dot, { backgroundColor: DEEP_COLOR, transform: [{ scale: selectedStage === 'Deep' ? 1.5 : 1 }] }]} />
                    <View>
                        <Text style={[legendStyles.label, { color: colors.textSecondary }]}>{t('deepSleep')}</Text>
                        <Text style={[legendStyles.value, { color: colors.textPrimary }]}>{deep} ({Math.round(deepMins / totalMins * 100)}%)</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleStagePress('REM')} style={legendStyles.row}>
                    <View style={[legendStyles.dot, { backgroundColor: REM_COLOR, transform: [{ scale: selectedStage === 'REM' ? 1.5 : 1 }] }]} />
                    <View>
                        <Text style={[legendStyles.label, { color: colors.textSecondary }]}>{t('remSleep')}</Text>
                        <Text style={[legendStyles.value, { color: colors.textPrimary }]}>{rem} ({Math.round(remMins / totalMins * 100)}%)</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleStagePress('Light')} style={legendStyles.row}>
                    <View style={[legendStyles.dot, { backgroundColor: LIGHT_COLOR, transform: [{ scale: selectedStage === 'Light' ? 1.5 : 1 }] }]} />
                    <View>
                        <Text style={[legendStyles.label, { color: colors.textSecondary }]}>{t('lightSleep')}</Text>
                        <Text style={[legendStyles.value, { color: colors.textPrimary }]}>{Math.floor(lightMins / 60)}{t('h')} {lightMins % 60}{t('m')} ({Math.round(lightMins / totalMins * 100)}%)</Text>
                    </View>
                </TouchableOpacity>
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

const chartStyles = StyleSheet.create({
    tooltip: {
        position: 'absolute',
        top: 20,
        backgroundColor: 'rgba(0,0,0,0.9)',
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        width: 100,
        zIndex: 100,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    tooltipDate: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 4,
        textAlign: 'center',
    },
    tooltipLabel: {
        color: '#fff',
        fontSize: 10,
        marginBottom: 2,
    },
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

const DayLegend = ({ colors, stageColors }: { colors: any, stageColors: any }) => {
    const { t } = useLanguage();
    return (
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 15, flexWrap: 'wrap' }}>
            {Object.entries(stageColors).map(([stage, color]) => (
                <View key={stage} style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 10, marginVertical: 5 }}>
                    <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: color as string, marginRight: 6 }} />
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                        {stage === 'deep' ? t('deepSleep') : stage === 'rem' ? t('remSleep') : t('lightSleep')}
                    </Text>
                </View>
            ))}
        </View>
    );
};

// Dual Axis Chart (Bars + Line)
const DualAxisChart = ({ data, width, height = 200, colors, maxDurationVal = 10, isMonth = false, isDay = false }: { data: any[], width: number, height?: number, colors: any, maxDurationVal?: number, isMonth?: boolean, isDay?: boolean }) => {
    const { t, locale } = useLanguage();
    const isWeek = !isDay && !isMonth;

    const STAGE_COLORS = {
        deep: colors.primary,  // Orange-Red
        rem: colors.accent,    // Golden Amber
        light: colors.success  // Green (maximum contrast)
    };

    // Helper to format date as DD/MM (Month) or Localized Day (Week)
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';

        // Robust fallback for legacy strings "Mon", "Tue" etc.
        const lower = dateStr.toLowerCase();
        const legacyKeys: TranslationKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        if (legacyKeys.includes(lower as any)) {
            return t(lower as TranslationKey);
        }

        // Try parsing as ISO date
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
            if (isMonth) {
                const day = d.getDate().toString().padStart(2, '0');
                const month = (d.getMonth() + 1).toString().padStart(2, '0');
                return `${day}/${month}`;
            }
            if (isWeek) {
                const dayIndex = d.getDay();
                const dayKeys: TranslationKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
                return t(dayKeys[dayIndex]);
            }
        }

        return dateStr;
    };

    const maxScore = 100;
    const maxDuration = maxDurationVal;

    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [showTooltip, setShowTooltip] = useState(false);

    // Reset interaction state when data changes to prevent out-of-bounds access
    useEffect(() => {
        setActiveIndex(null);
        setShowTooltip(false);
    }, [data]);

    const totalChartWidth = data.length > 7 ? data.length * 60 : width;
    const stepX = totalChartWidth / data.length;

    const handlePress = (evt: any) => {
        const x = evt.nativeEvent.locationX;
        const index = Math.floor((x / totalChartWidth) * data.length);

        if (index >= 0 && index < data.length) {
            // Toggle off if tapping already active point
            if (showTooltip && activeIndex === index) {
                setShowTooltip(false);
            } else {
                setActiveIndex(index);
                setShowTooltip(true);
            }
        } else {
            setShowTooltip(false);
        }
    };

    if (!data || data.length === 0) return (
        <View style={{ height, width, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: colors.textSecondary }}>{t('awaitingData')}</Text>
        </View>
    );

    const barWidth = stepX * 0.6;

    const linePoints = data.map((d, i) => {
        const x = i * stepX + stepX / 2;
        const y = height - (d.score / maxScore) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <View style={{ width }}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                contentContainerStyle={{ width: totalChartWidth }}
            >
                <View style={{ height: height + 100, width: totalChartWidth, overflow: 'visible' }}>
                    <Pressable
                        onPress={handlePress}
                        style={{ paddingTop: 60, overflow: 'visible' }} // Increase room for tooltip
                    >
                        <Svg width={totalChartWidth} height={height} pointerEvents="none">
                            {/* Duration Bars */}
                            {data.map((d, i) => {
                                const barHeight = (d.duration / maxDuration) * height;
                                return (
                                    <Path
                                        key={`bar-${i}`}
                                        d={`M ${i * stepX + (stepX - barWidth) / 2},${height} v -${barHeight} h ${barWidth} v ${barHeight} z`}
                                        fill={isDay && d.stage ? STAGE_COLORS[d.stage as keyof typeof STAGE_COLORS] : colors.primary}
                                        opacity={activeIndex === i && showTooltip ? 1 : (isDay ? 0.9 : 0.6)}
                                    />
                                );
                            })}

                            {/* Score Line and Points - Only show if not Day view */}
                            {!isDay && (
                                <>
                                    <Path
                                        d={`M ${linePoints}`}
                                        fill="none"
                                        stroke={colors.accent}
                                        strokeWidth="3"
                                        opacity={showTooltip ? 0.3 : 1}
                                    />

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
                                                opacity={activeIndex === i && showTooltip ? 1 : (showTooltip ? 0.3 : 1)}
                                            />
                                        );
                                    })}
                                </>
                            )}
                        </Svg>

                        {/* Tooltip */}
                        {showTooltip && activeIndex !== null && data[activeIndex] && (
                            <Pressable
                                onPress={() => setShowTooltip(false)}
                                style={[
                                    chartStyles.tooltip,
                                    {
                                        left: Math.max(0, Math.min(totalChartWidth - 100, (activeIndex * stepX) + stepX / 2 - 50)),
                                        borderColor: colors.primary,
                                        top: 0, // Stay within the padded area
                                    }
                                ]}
                            >
                                <Text style={chartStyles.tooltipDate}>
                                    {formatDate(data[activeIndex].date || data[activeIndex].time)}
                                    {isDay && data[activeIndex].stage && ` - ${data[activeIndex].stage === 'deep' ? t('deepSleep') :
                                        data[activeIndex].stage === 'rem' ? t('remSleep') :
                                            t('lightSleep')
                                        }`}
                                </Text>
                                <Text style={chartStyles.tooltipLabel}>
                                    {t('duration')}: <Text style={{ color: isDay && data[activeIndex].stage ? STAGE_COLORS[data[activeIndex].stage as keyof typeof STAGE_COLORS] : colors.primary }}>
                                        {isDay ? `${Math.round(data[activeIndex].duration)}${t('m')}` : `${Math.round(data[activeIndex].duration)}${t('h')}`}
                                    </Text>
                                </Text>
                                {!isDay && (
                                    <Text style={chartStyles.tooltipLabel}>
                                        {t('qualityScore')}: <Text style={{ color: colors.accent }}>{Math.round(data[activeIndex].score)}</Text>
                                    </Text>
                                )}
                            </Pressable>
                        )}
                    </Pressable>

                    {/* Axis Labels */}
                    <View style={{ height: 20, width: totalChartWidth, marginTop: 8 }}>
                        {data.map((d, i) => {
                            const left = i * stepX;
                            const labelText = formatDate(d.date || d.time);

                            return (
                                <Text
                                    key={i}
                                    style={{
                                        position: 'absolute',
                                        left: left,
                                        width: stepX,
                                        textAlign: 'center',
                                        fontSize: 9,
                                        color: colors.textSecondary,
                                        fontWeight: activeIndex === i ? 'bold' : 'normal',
                                        opacity: activeIndex === i ? 1 : 0.8
                                    }}
                                >
                                    {labelText}
                                </Text>
                            );
                        })}
                    </View>
                </View>
            </ScrollView >

            {totalChartWidth > width && (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 10, opacity: 0.7 }}>{t('swipeForMore') || 'Swipe for more'}</Text>
                    <ChevronRight size={12} color={colors.textSecondary} style={{ opacity: 0.7 }} />
                </View>
            )}
        </View >
    );
};

// Simple Smooth Line Chart for Day View (Hourly HR)
const HourlyChart = ({ data, width, height = 200, colors }: { data: any[], width: number, height?: number, colors: any }) => {
    if (!data || data.length === 0) return null;

    const minVal = Math.min(...data.map(d => d.value)) - 5;
    const maxVal = Math.max(...data.map(d => d.value)) + 5;
    const range = maxVal - minVal;

    // Create smooth path (bezier or simple line)
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

    const weeklyLabels = useMemo(() => {
        if (!data?.sleep?.history?.week) return [];
        const dayKeys: TranslationKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        return data.sleep.history.week.map(d => {
            const lower = d.date.toLowerCase();
            if (dayKeys.includes(lower as any)) return t(lower as any);
            const date = new Date(d.date);
            if (!isNaN(date.getTime())) return t(dayKeys[date.getDay()]);
            return d.date;
        });
    }, [data?.sleep?.history?.week, t]);

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
                    <DualAxisChart data={data.sleep.history?.week || []} width={chartWidth} colors={colors} maxDurationVal={10} isMonth={false} />
                    <Legend />
                </View>
            );
        } else if (selectedTab === 'Month') {
            return (
                <View style={{ alignItems: 'center', width: '100%' }}>
                    <DualAxisChart data={data.sleep.history?.month || []} width={chartWidth} colors={colors} maxDurationVal={10} isMonth={true} />
                    <Legend />
                </View>
            );
        } else {
            // Day View (Now using DualAxisChart)
            return (
                <View style={{ alignItems: 'center', width: '100%' }}>
                    <DualAxisChart
                        data={data.sleep.history?.day_hourly || []}
                        width={chartWidth}
                        colors={colors}
                        maxDurationVal={360} // Max duration for a segment
                        isMonth={false}
                        isDay={true}
                    />
                    <DayLegend
                        colors={colors}
                        stageColors={{
                            deep: colors.primary,
                            rem: colors.accent,
                            light: colors.success
                        }}
                    />
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
                        <GlassCard style={[styles.scoreCard, { overflow: 'visible' }]} contentContainerStyle={{ alignItems: 'center', padding: SPACING.xl, overflow: 'visible' }}>
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
                                style={{ alignItems: 'center', overflow: 'visible' }}
                                contentContainerStyle={{ padding: 0, alignItems: 'center', width: '100%', overflow: 'visible' }}
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
                                    unit={` ${t('bpm')}`}
                                    labels={weeklyLabels}
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
                                    labels={weeklyLabels}
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
        overflow: 'visible',
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
