import React from 'react';
import { View, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';

interface ScreenWrapperProps {
    children: React.ReactNode;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children }) => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={[COLORS.background, '#1A1E22']} // Subtle gradient from background to slightly lighter
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
        backgroundColor: COLORS.background,
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
