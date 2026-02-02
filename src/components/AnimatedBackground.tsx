import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';
import Svg, { Circle, Rect, G } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface AnimatedBackgroundProps {
    variant?: 'auth' | 'main';
    context?: string;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ variant = 'main' }) => {
    const { colors, isDark } = useTheme();

    // Animation values
    const walkerAnim = useRef(new Animated.Value(0)).current;
    const stepAnim = useRef(new Animated.Value(0)).current;
    const starTwinkle = useRef(new Animated.Value(0)).current;
    const cloudPulse = useRef(new Animated.Value(0)).current;

    // State for SVG walker animation
    const [step, setStep] = useState(0);

    useEffect(() => {
        // Walker moves across screen
        Animated.loop(
            Animated.sequence([
                Animated.timing(walkerAnim, {
                    toValue: 1,
                    duration: 25000,
                    useNativeDriver: true,
                }),
                Animated.timing(walkerAnim, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Walking step animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(stepAnim, {
                    toValue: 1,
                    duration: 650,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
                Animated.timing(stepAnim, {
                    toValue: 0,
                    duration: 650,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
            ])
        ).start();

        // Star twinkling
        Animated.loop(
            Animated.sequence([
                Animated.timing(starTwinkle, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(starTwinkle, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Cloud pulsing animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(cloudPulse, {
                    toValue: 1,
                    duration: 3000,
                    useNativeDriver: true,
                }),
                Animated.timing(cloudPulse, {
                    toValue: 0,
                    duration: 3000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Step counter for SVG walker
        const stepInterval = setInterval(() => {
            setStep(prev => (prev + 1) % 100);
        }, 10);

        return () => clearInterval(stepInterval);
    }, []);

    // Color scheme based on theme
    const getColors = () => {
        if (isDark) {
            return {
                bg: '#0A0A0A',
                walker: '#FFFFFF',
                terrain1: 'rgba(139, 90, 43, 0.5)',
                terrain2: 'rgba(184, 115, 51, 0.4)',
                terrain3: 'rgba(205, 133, 63, 0.35)',
                stars: 'rgba(255, 255, 255, 0.8)',
            };
        } else {
            return {
                bg: '#FAFAFA',
                walker: '#1A1A1A',
                terrain1: 'rgba(160, 82, 45, 0.4)',
                terrain2: 'rgba(188, 143, 143, 0.35)',
                terrain3: 'rgba(210, 180, 140, 0.3)',
                stars: 'rgba(100, 100, 100, 0.3)',
            };
        }
    };

    const themeColors = getColors();

    // Walker position
    const walkerTranslateX = walkerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-80, width + 80],
    });

    // Walker follows terrain path
    const getTerrainY = (progress: number) => {
        return height * 0.7 + Math.sin(progress * Math.PI * 3) * 50;
    };

    const walkerTranslateY = walkerAnim.interpolate({
        inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
        outputRange: [
            getTerrainY(0) - 70,
            getTerrainY(0.2) - 70,
            getTerrainY(0.4) - 70,
            getTerrainY(0.6) - 70,
            getTerrainY(0.8) - 70,
            getTerrainY(1) - 70,
        ],
    });

    const walkerOpacity = walkerAnim.interpolate({
        inputRange: [0, 0.05, 0.95, 1],
        outputRange: [0, 1, 1, 0],
    });

    // Create layered terrain
    const createTerrainLayer = (amplitude: number, frequency: number, offset: number) => {
        const points = [];
        const numPoints = 40;
        for (let i = 0; i < numPoints; i++) {
            const x = (i / numPoints) * width;
            const progress = i / numPoints;
            const y = height * 0.7 + offset + Math.sin(progress * Math.PI * frequency) * amplitude;
            points.push({ x, y });
        }
        return points;
    };

    const terrain1 = createTerrainLayer(60, 2.5, 80);
    const terrain2 = createTerrainLayer(55, 3, 40);
    const terrain3 = createTerrainLayer(50, 3, 0);

    // Generate stars (dark mode)
    const stars = Array.from({ length: 35 }, (_, i) => ({
        x: (Math.sin(i * 123.456) * 0.5 + 0.5) * width,
        y: (Math.cos(i * 789.012) * 0.5 + 0.5) * height * 0.6,
        size: 2 + (Math.sin(i * 456.789) * 0.5 + 0.5) * 2,
    }));

    // Generate clouds (light mode)
    const clouds = Array.from({ length: 5 }, (_, i) => ({
        x: (Math.sin(i * 234.567) * 0.5 + 0.5) * width,
        y: (Math.cos(i * 345.678) * 0.5 + 0.5) * height * 0.3,
        scale: 0.6 + (Math.sin(i * 123.456) * 0.5 + 0.5) * 0.5,
        baseOpacity: 0.5 + (i % 3) * 0.15,
    }));

    // SVG Walker animation calculations
    const progress = step / 100;
    const leftLeg = Math.sin(progress * Math.PI * 2) * 20;
    const rightLeg = -Math.sin(progress * Math.PI * 2) * 20;
    const leftArm = -Math.sin(progress * Math.PI * 2) * 15;
    const rightArm = Math.sin(progress * Math.PI * 2) * 15;

    return (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: themeColors.bg }]}>
            {/* Stars (dark mode) or Clouds (light mode) */}
            {isDark ? (
                stars.map((star, index) => {
                    const opacity = starTwinkle.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.3, 1, 0.3],
                    });

                    return (
                        <Animated.View
                            key={`star-${index}`}
                            style={[
                                styles.star,
                                {
                                    backgroundColor: themeColors.stars,
                                    width: star.size,
                                    height: star.size,
                                    left: star.x,
                                    top: star.y,
                                    opacity,
                                },
                            ]}
                        />
                    );
                })
            ) : (
                clouds.map((cloud, index) => {
                    const opacity = cloudPulse.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [cloud.baseOpacity * 0.7, cloud.baseOpacity, cloud.baseOpacity * 0.7],
                    });

                    return (
                        <Animated.View
                            key={`cloud-${index}`}
                            style={[
                                styles.cloud,
                                {
                                    left: cloud.x,
                                    top: cloud.y,
                                    opacity,
                                    transform: [{ scale: cloud.scale }],
                                },
                            ]}
                        >
                            <View style={[styles.cloudPuff, styles.cloudPuff1]} />
                            <View style={[styles.cloudPuff, styles.cloudPuff2]} />
                            <View style={[styles.cloudPuff, styles.cloudPuff3]} />
                            <View style={[styles.cloudPuff, styles.cloudPuff4]} />
                            <View style={[styles.cloudPuff, styles.cloudPuff5]} />
                        </Animated.View>
                    );
                })
            )}

            {/* Terrain Layer 1 (Back) */}
            <View style={styles.terrainContainer}>
                {terrain1.map((point, index) => (
                    <View
                        key={`t1-${index}`}
                        style={[
                            styles.terrainSegment,
                            {
                                backgroundColor: themeColors.terrain1,
                                left: point.x,
                                top: point.y,
                                width: width / 40 + 6,
                                height: height - point.y,
                            },
                        ]}
                    />
                ))}
            </View>

            {/* Terrain Layer 2 (Middle) */}
            <View style={styles.terrainContainer}>
                {terrain2.map((point, index) => (
                    <View
                        key={`t2-${index}`}
                        style={[
                            styles.terrainSegment,
                            {
                                backgroundColor: themeColors.terrain2,
                                left: point.x,
                                top: point.y,
                                width: width / 40 + 6,
                                height: height - point.y,
                            },
                        ]}
                    />
                ))}
            </View>

            {/* Terrain Layer 3 (Front) */}
            <View style={styles.terrainContainer}>
                {terrain3.map((point, index) => (
                    <View
                        key={`t3-${index}`}
                        style={[
                            styles.terrainSegment,
                            {
                                backgroundColor: themeColors.terrain3,
                                left: point.x,
                                top: point.y,
                                width: width / 40 + 6,
                                height: height - point.y,
                            },
                        ]}
                    />
                ))}
            </View>

            {/* Walking Figure - SVG */}
            <Animated.View
                style={[
                    styles.walkerContainer,
                    {
                        opacity: walkerOpacity,
                        transform: [
                            { translateX: walkerTranslateX },
                            { translateY: walkerTranslateY },
                        ],
                    },
                ]}
            >
                <Svg width="40" height="70" viewBox="0 0 60 100">
                    {/* Head */}
                    <Circle cx="30" cy="12" r="8" fill={themeColors.walker} />

                    {/* Torso */}
                    <Rect x="24" y="20" width="12" height="30" rx="6" fill={themeColors.walker} />

                    {/* Left Arm */}
                    <G transform={`translate(24, 24)`}>
                        <Rect
                            x="-1.5"
                            y="0"
                            width="3"
                            height="22"
                            rx="1.5"
                            fill={themeColors.walker}
                            rotation={leftArm}
                            origin="1.5, 0"
                        />
                    </G>

                    {/* Right Arm */}
                    <G transform={`translate(36, 24)`}>
                        <Rect
                            x="-1.5"
                            y="0"
                            width="3"
                            height="22"
                            rx="1.5"
                            fill={themeColors.walker}
                            rotation={rightArm}
                            origin="1.5, 0"
                        />
                    </G>

                    {/* Left Leg */}
                    <G transform={`translate(27, 48)`}>
                        <Rect
                            x="-2.5"
                            y="0"
                            width="5"
                            height="32"
                            rx="2.5"
                            fill={themeColors.walker}
                            rotation={leftLeg}
                            origin="2.5, 0"
                        />
                    </G>

                    {/* Right Leg */}
                    <G transform={`translate(33, 48)`}>
                        <Rect
                            x="-2.5"
                            y="0"
                            width="5"
                            height="32"
                            rx="2.5"
                            fill={themeColors.walker}
                            rotation={rightLeg}
                            origin="2.5, 0"
                        />
                    </G>
                </Svg>
            </Animated.View>

            {/* Very light blur */}
            <BlurView intensity={isDark ? 8 : 5} style={StyleSheet.absoluteFillObject} />
        </View>
    );
};

const styles = StyleSheet.create({
    star: {
        position: 'absolute',
        borderRadius: 2,
    },
    cloud: {
        position: 'absolute',
        width: 100,
        height: 50,
    },
    cloudPuff: {
        position: 'absolute',
        backgroundColor: '#C0C0C0',
        borderRadius: 50,
    },
    cloudPuff1: {
        width: 40,
        height: 40,
        left: 0,
        top: 10,
    },
    cloudPuff2: {
        width: 50,
        height: 50,
        left: 25,
        top: 0,
    },
    cloudPuff3: {
        width: 45,
        height: 45,
        left: 50,
        top: 5,
    },
    cloudPuff4: {
        width: 35,
        height: 35,
        left: 70,
        top: 12,
    },
    cloudPuff5: {
        width: 30,
        height: 30,
        left: 35,
        top: 20,
    },
    terrainContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    terrainSegment: {
        position: 'absolute',
    },
    walkerContainer: {
        position: 'absolute',
        width: 40,
        height: 70,
    },
});