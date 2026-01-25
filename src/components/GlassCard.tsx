import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { LAYOUT } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

interface GlassCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
    intensity?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style, contentContainerStyle, intensity = 20 }) => {
    const { isDark, colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.cardBackground, borderColor: colors.divider }, style]}>
            <BlurView intensity={intensity} tint={isDark ? "dark" : "light"} style={[styles.blurContainer, contentContainerStyle]}>
                {children}
            </BlurView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: LAYOUT.borderRadius,
        overflow: 'hidden',
        borderWidth: 1,
    },
    blurContainer: {
        flex: 1,
        padding: 16,
        backgroundColor: 'transparent', // Let the container bg or blur handle it
    },
});
