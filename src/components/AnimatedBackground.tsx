import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

interface AnimatedBackgroundProps {
    variant?: 'auth' | 'main';
    context?: string;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ variant = 'main' }) => {
    const { colors, isDark } = useTheme();

    // Animation values
    const starTwinkle = useRef(new Animated.Value(0)).current;
    const cloudPulse = useRef(new Animated.Value(0)).current;

    // Wave animations
    const waveAnim1 = useRef(new Animated.Value(0)).current;
    const waveAnim2 = useRef(new Animated.Value(0)).current;
    const waveAnim3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Continuous wave scrolling
        const createWaveAnim = (anim: Animated.Value, duration: number) => {
            return Animated.loop(
                Animated.timing(anim, {
                    toValue: 1,
                    duration: duration,
                    useNativeDriver: true,
                    easing: Easing.linear,
                })
            );
        };

        const anims = [
            createWaveAnim(waveAnim1, 8000),  // Fast
            createWaveAnim(waveAnim2, 12000), // Medium
            createWaveAnim(waveAnim3, 16000), // Slow
        ];

        Animated.parallel(anims).start();

        // Star twinkling
        Animated.loop(
            Animated.sequence([
                Animated.timing(starTwinkle, {
                    toValue: 1,
                    duration: 3000,
                    useNativeDriver: true,
                }),
                Animated.timing(starTwinkle, {
                    toValue: 0,
                    duration: 3000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Cloud pulsing animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(cloudPulse, {
                    toValue: 1,
                    duration: 4000,
                    useNativeDriver: true,
                }),
                Animated.timing(cloudPulse, {
                    toValue: 0,
                    duration: 4000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    // Color scheme based on theme
    const getColors = () => {
        if (isDark) {
            return {
                bg: '#0A0A0A',
                terrain1: 'rgba(139, 90, 43, 0.6)',
                terrain2: 'rgba(184, 115, 51, 0.5)',
                terrain3: 'rgba(205, 133, 63, 0.4)',
                stars: 'rgba(255, 255, 255, 0.7)',
            };
        } else {
            return {
                bg: '#FAFAFA',
                terrain1: 'rgba(160, 82, 45, 0.5)',
                terrain2: 'rgba(188, 143, 143, 0.4)',
                terrain3: 'rgba(210, 180, 140, 0.3)',
                stars: 'rgba(100, 100, 100, 0.3)',
            };
        }
    };

    const themeColors = getColors();

    // Create wave pattern (seamless loop)
    const createWavePattern = (amplitude: number, frequency: number, offset: number) => {
        const points = [];
        const numPoints = 80; // Double width for seamless scrolling
        const barWidth = width / 40;

        for (let i = 0; i < numPoints; i++) {
            const progress = i / 40; // Normalize to screen starts
            // Mix sine waves for "soundwave" look
            const y = height * 0.65 + offset +
                Math.sin(progress * Math.PI * frequency) * amplitude +
                Math.cos(progress * Math.PI * frequency * 2) * (amplitude * 0.5);

            points.push({
                left: i * barWidth,
                height: Math.max(10, height - y),
                top: y
            });
        }
        return points;
    };

    const wave1 = createWavePattern(60, 2, 80);
    const wave2 = createWavePattern(50, 3, 40);
    const wave3 = createWavePattern(40, 1.5, 0);

    const renderWaveLayer = (points: any[], color: string, anim: Animated.Value) => {
        const translateX = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -width], // Move one full screen width left
        });

        return (
            <Animated.View style={[styles.waveContainer, { transform: [{ translateX }] }]}>
                {points.map((point: any, index: number) => (
                    <View
                        key={`w-${index}`}
                        style={[
                            styles.bar,
                            {
                                backgroundColor: color,
                                left: point.left,
                                top: point.top,
                                height: point.height,
                            },
                        ]}
                    />
                ))}
            </Animated.View>
        );
    };

    // Generate stars (dark mode)
    const stars = Array.from({ length: 30 }, (_, i) => ({
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

    return (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: themeColors.bg, overflow: 'hidden' }]}>
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

            {/* Wave Layer 1 (Back) */}
            {renderWaveLayer(wave1, themeColors.terrain1, waveAnim1)}

            {/* Wave Layer 2 (Middle) */}
            {renderWaveLayer(wave2, themeColors.terrain2, waveAnim2)}

            {/* Wave Layer 3 (Front) */}
            {renderWaveLayer(wave3, themeColors.terrain3, waveAnim3)}

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
    cloudPuff1: { width: 40, height: 40, left: 0, top: 10 },
    cloudPuff2: { width: 50, height: 50, left: 25, top: 0 },
    cloudPuff3: { width: 45, height: 45, left: 50, top: 5 },
    cloudPuff4: { width: 35, height: 35, left: 70, top: 12 },
    cloudPuff5: { width: 30, height: 30, left: 35, top: 20 },
    waveContainer: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: width * 2, // Double width for scrolling
        height: '100%',
    },
    bar: {
        position: 'absolute',
        width: width / 45, // Slightly thinner than spacing
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
    },
});