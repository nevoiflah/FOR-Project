import React from 'react';
import { View, Dimensions, Text, PanResponder, StyleSheet, Animated } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, G, Line, Circle } from 'react-native-svg';
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
    const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
    const [showTooltip, setShowTooltip] = React.useState(false);

    // Reset interaction state when data changes to prevent out-of-bounds access
    React.useEffect(() => {
        setActiveIndex(null);
        setShowTooltip(false);
    }, [data]);

    const panResponder = React.useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // Only capture if user is moving horizontally more than vertically
                return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
            },
            onPanResponderGrant: (evt) => {
                handleTouch(evt.nativeEvent.locationX);
                setShowTooltip(true);
            },
            onPanResponderMove: (evt) => {
                handleTouch(evt.nativeEvent.locationX);
            },
            onPanResponderRelease: () => {
                // Keep the last point active
            },
            onPanResponderTerminate: () => {
                // If gesture is cancelled, hide tooltip? 
                // User wants it to stay on touch and unshow on second touch.
                // But for scrubbing, we want it visible.
            },
        })
    ).current;

    const handleTouch = (x: number) => {
        const divider = data.length > 1 ? data.length - 1 : 1;
        const index = Math.round((x / width) * divider);
        if (index >= 0 && index < data.length) {
            setActiveIndex(index);
        }
    };

    const toggleTooltip = () => {
        setShowTooltip(!showTooltip);
    };

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
            <View
                {...panResponder.panHandlers}
                onStartShouldSetResponder={() => true}
                onResponderRelease={toggleTooltip}
                style={{ paddingTop: 40 }} // Add room for tooltip at the top
            >
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

                    {/* Active Scrubber Line */}
                    {showTooltip && activeIndex !== null && (
                        <G>
                            <Line
                                x1={(activeIndex / (data.length - 1)) * width}
                                y1={0}
                                x2={(activeIndex / (data.length - 1)) * width}
                                y2={height}
                                stroke={color}
                                strokeWidth={2}
                                strokeDasharray="4,4"
                            />
                            <Circle
                                cx={(activeIndex / (data.length - 1)) * width}
                                cy={height - ((data[activeIndex] - min) / range) * (height * 0.6) - (height * 0.2)}
                                r={6}
                                fill={color}
                                stroke="#fff"
                                strokeWidth={2}
                            />
                        </G>
                    )}

                    {/* Live Indicator */}
                    {liveIndex !== undefined && !showTooltip && liveIndex >= 0 && liveIndex < data.length && (() => {
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
                                    key="live-line"
                                    d={`M ${x} 0 L ${x} ${height}`}
                                    stroke={color}
                                    strokeWidth={1}
                                    strokeDasharray="4,4"
                                    opacity={0.5}
                                />
                                <Circle
                                    key="live-dot"
                                    cx={x}
                                    cy={y}
                                    r={5}
                                    fill={color}
                                    stroke="#fff"
                                    strokeWidth={2}
                                />
                            </>
                        );
                    })()}
                </Svg>

                {/* Tooltip Overlay */}
                {showTooltip && activeIndex !== null && data[activeIndex] !== undefined && (
                    <View style={[
                        styles.tooltip,
                        {
                            left: Math.max(0, Math.min(width - 80, (activeIndex / (data.length - 1)) * width - 40)),
                            borderColor: color,
                            top: 5, // Stay within the 40px padding
                        }
                    ]}>
                        <Text style={styles.tooltipTime}>
                            {activeIndex === 0 ? "00:00" :
                                activeIndex === 3 ? "06:00" :
                                    activeIndex === 6 ? "12:00" :
                                        activeIndex === 9 ? "18:00" :
                                            activeIndex === 12 ? "24:00" :
                                                `${activeIndex * 2}:00`}
                        </Text>
                        <Text style={[styles.tooltipValue, { color }]}>
                            {data[activeIndex]}% Energy
                        </Text>
                    </View>
                )}
            </View>

            {/* Axis Labels */}
            {labels && labels.length > 0 && (
                <View style={{ height: 20, width: width, marginTop: 4 }}>
                    {labels.map((label, index) => {
                        if (!label) return null;
                        const divider = labels.length > 1 ? labels.length - 1 : 1;
                        const x = (index / divider) * width;
                        const labelWidth = 40;
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

const styles = StyleSheet.create({
    tooltip: {
        position: 'absolute',
        top: -45,
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 6,
        borderRadius: 8,
        borderWidth: 1,
        width: 80,
        alignItems: 'center',
        zIndex: 10,
    },
    tooltipTime: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    tooltipValue: {
        fontSize: 12,
        fontWeight: 'bold',
    }
});
