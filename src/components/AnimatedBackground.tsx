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
    const walkerAnim = useRef(new Animated.Value(0)).current;
    const stepAnim = useRef(new Animated.Value(0)).current;
    const starTwinkle = useRef(new Animated.Value(0)).current;
    const cloudPulse = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
        // Walker moves across screen
        Animated.loop(
            Animated.sequence([
                Animated.timing(walkerAnim, {
                    toValue: 1,
                    duration: 15000,
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
                    duration: 500,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
                Animated.timing(stepAnim, {
                    toValue: 0,
                    duration: 500,
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
    }, []);

    // Color scheme based on theme
    const getColors = () => {
        if (isDark) {
            return {
                bg: '#0A0A0A',
                walker: '#FFFFFF',
                terrain1: 'rgba(139, 90, 43, 0.5)',      // Muted brown (back)
                terrain2: 'rgba(184, 115, 51, 0.4)',     // Lighter brown
                terrain3: 'rgba(205, 133, 63, 0.35)',    // Peru/tan (front - less bright)
                stars: 'rgba(255, 255, 255, 0.8)',
            };
        } else {
            return {
                bg: '#FAFAFA',
                walker: '#1A1A1A',
                terrain1: 'rgba(160, 82, 45, 0.4)',      // Sienna
                terrain2: 'rgba(188, 143, 143, 0.35)',   // Rosy brown
                terrain3: 'rgba(210, 180, 140, 0.3)',    // Tan (less bright)
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

    // Walking animations
    const headBob = stepAnim.interpolate({
        inputRange: [0, 0.25, 0.5, 0.75, 1],
        outputRange: [0, -2, 0, -2, 0],
    });

    const headTilt = stepAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ['2deg', '-2deg', '2deg'],
    });

    const leftLegRotate = stepAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ['30deg', '-30deg', '30deg'],
    });
    const rightLegRotate = stepAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ['-30deg', '30deg', '-30deg'],
    });

    const bodyLean = stepAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ['2deg', '-2deg', '2deg'],
    });

    const leftArmRotate = stepAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ['-25deg', '25deg', '-25deg'],
    });
    const rightArmRotate = stepAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ['25deg', '-25deg', '25deg'],
    });

    const bodyBounce = stepAnim.interpolate({
        inputRange: [0, 0.25, 0.5, 0.75, 1],
        outputRange: [0, -4, 0, -4, 0],
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

    const terrain1 = createTerrainLayer(60, 2.5, 80);   // Back layer
    const terrain2 = createTerrainLayer(55, 3, 40);     // Middle layer
    const terrain3 = createTerrainLayer(50, 3, 0);      // Front layer (walker walks on this)

    // Generate stars (dark mode)
    const stars = Array.from({ length: 35 }, (_, i) => ({
        x: (Math.sin(i * 123.456) * 0.5 + 0.5) * width,
        y: (Math.cos(i * 789.012) * 0.5 + 0.5) * height * 0.6,
        size: 2 + (Math.sin(i * 456.789) * 0.5 + 0.5) * 2,
    }));

    // Generate clouds (light mode) - positioned like stars
    const clouds = Array.from({ length: 5 }, (_, i) => ({ // Reduced from 10 to 5
        x: (Math.sin(i * 234.567) * 0.5 + 0.5) * width,
        y: (Math.cos(i * 345.678) * 0.5 + 0.5) * height * 0.3, // Changed from 0.5 to 0.3 (higher)
        scale: 0.6 + (Math.sin(i * 123.456) * 0.5 + 0.5) * 0.5,
        baseOpacity: 0.5 + (i % 3) * 0.15,
    }));

    return (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: themeColors.bg }]}>
            {/* Stars (dark mode) or Clouds (light mode) */}
            {isDark ? (
                // Stars for dark mode
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
                // Clouds for light mode
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
                            {/* Cloud made of overlapping circles */}
                            <View style={[styles.cloudPuff, styles.cloudPuff1]} />
                            <View style={[styles.cloudPuff, styles.cloudPuff2]} />
                            <View style={[styles.cloudPuff, styles.cloudPuff3]} />
                            <View style={[styles.cloudPuff, styles.cloudPuff4]} />
                            <View style={[styles.cloudPuff, styles.cloudPuff5]} />
                        </Animated.View>
                    );
                })
            )}

            {/* Terrain Layer 1 (Back - darkest) */}
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

            {/* Terrain Layer 3 (Front - lightest tan) */}
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

            {/* Walking Figure */}
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
                {/* Head */}
                <Animated.View
                    style={[
                        styles.head,
                        {
                            backgroundColor: themeColors.walker,
                            transform: [
                                { translateY: bodyBounce },
                                { translateY: headBob },
                                { rotate: headTilt },
                            ],
                        },
                    ]}
                />
                
                {/* Body */}
                <Animated.View
                    style={[
                        styles.body,
                        {
                            backgroundColor: themeColors.walker,
                            transform: [
                                { translateY: bodyBounce },
                                { rotate: bodyLean },
                            ],
                        },
                    ]}
                />
                
                {/* Left Arm */}
                <Animated.View
                    style={[
                        styles.arm,
                        styles.leftArm,
                        { 
                            backgroundColor: themeColors.walker,
                            transform: [
                                { translateY: bodyBounce },
                                { rotate: leftArmRotate },
                            ],
                        },
                    ]}
                />
                
                {/* Right Arm */}
                <Animated.View
                    style={[
                        styles.arm,
                        styles.rightArm,
                        { 
                            backgroundColor: themeColors.walker,
                            transform: [
                                { translateY: bodyBounce },
                                { rotate: rightArmRotate },
                            ],
                        },
                    ]}
                />
                
                {/* Left Leg */}
                <Animated.View
                    style={[
                        styles.leg,
                        styles.leftLeg,
                        { 
                            backgroundColor: themeColors.walker,
                            transform: [{ rotate: leftLegRotate }],
                        },
                    ]}
                />
                
                {/* Right Leg */}
                <Animated.View
                    style={[
                        styles.leg,
                        styles.rightLeg,
                        { 
                            backgroundColor: themeColors.walker,
                            transform: [{ rotate: rightLegRotate }],
                        },
                    ]}
                />
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
        backgroundColor: '#C0C0C0', // Darker gray (was #E8E8E8)
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
        width: 50,
        height: 70,
    },
    head: {
        width: 14,
        height: 14,
        borderRadius: 7,
        position: 'absolute',
        top: 0,
        left: 18,
    },
    body: {
        width: 10,
        height: 24,
        borderRadius: 5,
        position: 'absolute',
        top: 14,
        left: 20,
    },
    arm: {
        width: 4,
        height: 20,
        borderRadius: 2,
        position: 'absolute',
        top: 16,
    },
    leftArm: {
        left: 15,
    },
    rightArm: {
        left: 31,
    },
    leg: {
        width: 5,
        height: 26,
        borderRadius: 2.5,
        position: 'absolute',
        top: 36,
    },
    leftLeg: {
        left: 19,
    },
    rightLeg: {
        left: 26,
    },
});
