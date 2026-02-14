import React from 'react';
import { View, Dimensions, Text } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS } from '../constants/theme';

interface GlassChartProps {
    data: number[];
    height?: number;
    width?: number;
    color?: string;
    strokeWidth?: number;
    gradientId?: string;
    showPoints?: boolean;
    labels?: string[];
    liveIndex?: number;
}

export const GlassChart = ({
    data,
    height = 150,
    width = Dimensions.get('window').width - 48,
    color = COLORS.primary,
    strokeWidth = 3,
    gradientId = 'grad',
    showPoints = true,
    labels = [],
    liveIndex
}: GlassChartProps) => {
    if (!data || data.length === 0) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    // Simple normalization to fit graph in view
    const points = data.map((value, index) => {
        const divider = data.length > 1 ? data.length - 1 : 1;
        const x = (index / divider) * width;
        const y = height - ((value - min) / range) * (height * 0.6) - (height * 0.2); // Leave some padding
        return `${x},${y}`;
    });

    // Create a simple smooth-ish path (Polyline for robustness, can be smoothed if needed)
    // For true bezier smoothing without d3, a simple line is safer and still looks good with gradient
    const pathData = `M ${points.join(' L ')}`;

    // Create fill area (close the loop)
    const fillPathData = `${pathData} L ${width},${height} L 0,${height} Z`;

    // Remove fixed height from outer View so valid children (like labels) are visible
    return (
        <View style={{ width }}>
            <Svg height={height} width={width}>
                <Defs>
                    <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor={color} stopOpacity="0.5" />
                        <Stop offset="1" stopColor={color} stopOpacity="0" />
                    </LinearGradient>
                </Defs>

                {/* Gradient Fill */}
                <Path d={fillPathData} fill={`url(#${gradientId})`} />

                {/* Stroke Line */}
                <Path
                    d={pathData}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.9}
                />

                {/* Data Points (optional, adds polish) */}
                {showPoints && data.map((value, index) => {
                    const divider = data.length > 1 ? data.length - 1 : 1;
                    const x = (index / divider) * width;
                    const y = height - ((value - min) / range) * (height * 0.6) - (height * 0.2);
                    return (
                        <Path
                            key={index}
                            d={`M ${x} ${y} m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0`}
                            fill="#fff"
                        />
                    );
                })}

                {/* Live Indicator */}
                {liveIndex !== undefined && liveIndex >= 0 && liveIndex < data.length && (() => {
                    const divider = data.length > 1 ? data.length - 1 : 1;
                    const x = (liveIndex / divider) * width;

                    // Linear interpolation for Y position
                    const idx = Math.floor(liveIndex);
                    const frac = liveIndex - idx;
                    const v1 = data[idx];
                    const v2 = idx + 1 < data.length ? data[idx + 1] : v1;
                    const val = v1 + (v2 - v1) * frac;
                    const y = height - ((val - min) / range) * (height * 0.6) - (height * 0.2);

                    return (
                        <>
                            <Path
                                d={`M ${x} 0 L ${x} ${height}`}
                                stroke={color}
                                strokeWidth={1}
                                strokeDasharray="4,4"
                                opacity={0.5}
                            />
                            <Path
                                d={`M ${x} ${y} m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0`}
                                fill={color}
                                stroke="#fff"
                                strokeWidth={2}
                            />
                        </>
                    );
                })()}
            </Svg>

            {/* Axis Labels (Absolutely positioned for precision) */}
            {labels && labels.length > 0 && (
                <View style={{ height: 20, width: width, marginTop: 4 }}>
                    {labels.map((label, index) => {
                        if (!label) return null;

                        const divider = labels.length > 1 ? labels.length - 1 : 1;
                        const x = (index / divider) * width;
                        const labelWidth = 40; // Adequate width for "12:00"

                        // Adjust x so label is centered
                        const left = x - (labelWidth / 2);

                        return (
                            <Text
                                key={index}
                                style={{
                                    position: 'absolute',
                                    left: left,
                                    width: labelWidth,
                                    textAlign: 'center',
                                    fontSize: 10,
                                    color: COLORS.textSecondary
                                }}
                            >
                                {label}
                            </Text>
                        );
                    })}
                </View>
            )}
        </View>
    );
};
