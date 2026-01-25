import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

interface ScreenWrapperProps {
    children: React.ReactNode;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children }) => {
    const { colors, isDark } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <LinearGradient
                colors={[colors.background, isDark ? '#1A1E22' : '#E9ECEF']}
                style={styles.gradient}
            >
                <SafeAreaView style={styles.safeArea}>
                    {children}
                </SafeAreaView>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        // Remove padding here to allow full bleed if needed, individual screens should handle their padding
        // paddingHorizontal: SPACING.m, // Removed
    },
});
