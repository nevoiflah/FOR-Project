import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, LAYOUT } from '../constants/theme';

interface GlassCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
    intensity?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style, contentContainerStyle, intensity = 20 }) => {
    return (
        <View style={[styles.container, style]}>
            <BlurView intensity={intensity} tint="dark" style={[styles.blurContainer, contentContainerStyle]}>
                {children}
            </BlurView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: LAYOUT.borderRadius,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.03)', // Very subtle light overlay
        // Removed border for seamless look, or use very faint:
        borderColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1, // Keep 1px but very transparent for crisp edge
    },
    blurContainer: {
        padding: 16,
        backgroundColor: 'transparent', // Let the container bg or blur handle it
    },
});
