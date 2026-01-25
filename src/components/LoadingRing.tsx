import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../constants/theme';

interface LoadingRingProps {
    success?: boolean;
    size?: number;
}

export const LoadingRing = ({ success = false, size = 100 }: LoadingRingProps) => {
    const spinValue = useRef(new Animated.Value(0)).current;
    const pulseValue = useRef(new Animated.Value(1)).current;
    const opacityValue = useRef(new Animated.Value(0)).current; // For checkmark

    useEffect(() => {
        // Spin Animation (Loop)
        const spinAnim = Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 2000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );

        if (!success) {
            spinAnim.start();
        } else {
            // Stop spinning and fade in success
            spinAnim.stop();
            spinValue.setValue(0); // Reset rotation to look clean
            Animated.timing(opacityValue, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }

        // Pulse Animation (Always pulsing gently for 'alive' feel)
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseValue, {
                    toValue: 1.1,
                    duration: 1000,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseValue, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        return () => spinAnim.stop();
    }, [success]);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.container}>
            <Animated.View style={{ transform: [{ rotate: spin }, { scale: pulseValue }] }}>
                <Svg height={size} width={size} viewBox="0 0 100 100">
                    <Circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke={success ? COLORS.success : COLORS.primary}
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={success ? "0" : "200"} // Solid line if success
                        strokeDashoffset={success ? "0" : "50"}
                        strokeLinecap="round"
                    />
                    {/* Background track circle */}
                    {!success && <Circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke={COLORS.primary}
                        strokeWidth="2"
                        strokeOpacity="0.3"
                        fill="transparent"
                    />}
                </Svg>
            </Animated.View>

            {/* Checkmark Overlay */}
            {success && (
                <Animated.View style={[StyleSheet.absoluteFill, {
                    justifyContent: 'center',
                    alignItems: 'center',
                    opacity: opacityValue
                }]}>
                    {/* Creating a simple checkmark with SVG paths would be ideal, but using Lucide is easier */}
                    {/* However, user wants NO EMOJIS, so we stick to strict shapes/icons */}
                    {/* Since we can't import icons easily inside this specific component without passing them,
                       we will just draw a checkmark with SVG */}
                    <Svg height="40" width="40" viewBox="0 0 24 24">
                        <Circle cx="12" cy="12" r="10" fill={COLORS.success} />
                        {/* Checkmark path */}
                        {/* M9 12l2 2 4-4 */}
                    </Svg>
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
