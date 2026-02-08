import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Image, Easing } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

interface AnimatedSplashScreenProps {
    onAnimationFinish: () => void;
}

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({ onAnimationFinish }) => {
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // Pulse Value: 1 -> 1.08 -> 1 (Heartbeat rhythm)
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const startAnimation = async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
            await SplashScreen.hideAsync();

            // Heartbeat Pulse Animation
            // Lub-dub rhythm: Fast expand, slight recoil, big expand, slow recoil.
            Animated.loop(
                Animated.sequence([
                    // "Lub" (First beat)
                    Animated.timing(pulseAnim, {
                        toValue: 1.05,
                        duration: 150,
                        useNativeDriver: true,
                        easing: Easing.out(Easing.ease),
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                    // "Dub" (Second beat - slightly stronger)
                    Animated.timing(pulseAnim, {
                        toValue: 1.08,
                        duration: 150,
                        useNativeDriver: true,
                        easing: Easing.out(Easing.ease),
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 600, // Long pause/release
                        useNativeDriver: true,
                        easing: Easing.in(Easing.ease),
                    }),
                    Animated.delay(800) // Rest between beats
                ])
            ).start();

            // Slower entrance fade/scale for the text itself (optional, but nice)
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }).start();

            // Exit animation after a few seconds
            setTimeout(() => {
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }).start(() => {
                    onAnimationFinish();
                });
            }, 3500); // Show logo for 3.5 seconds
        };

        startAnimation();
    }, []);

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }, { scale: scaleAnim }] }}>
                <Image
                    source={require('../../assets/FOR-logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // Match the logo's off-white background color perfectly to hide the image box
        // Based on the generated image description, it's a "creamy off-white".
        // We'll use a likely hex value, but might need adjustment if it's not exact.
        // Assuming #FDFCF8 or similar. Let's try to match the common off-white generation.
        backgroundColor: '#F9F9F7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: Dimensions.get('window').width * 0.7, // Slightly larger
        height: Dimensions.get('window').width * 0.7,
    }
});
