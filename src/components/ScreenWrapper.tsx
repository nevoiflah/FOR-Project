import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedBackground } from './AnimatedBackground';
import { useTheme } from '../contexts/ThemeContext';

type BackgroundContext = 'sleep' | 'heart' | 'workout' | 'mindfulness' | 'dashboard' | 'auth';

interface ScreenWrapperProps {
    children: React.ReactNode;
    bgVariant?: 'auth' | 'main';
    bgContext?: BackgroundContext;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
    children,
    bgVariant = 'main',
    bgContext = 'dashboard'
}) => {
    const { colors } = useTheme();

    return (
        <View
            style={[styles.container, { backgroundColor: colors.background }]}
            removeClippedSubviews={true}
            collapsable={false}
        >
            <AnimatedBackground variant={bgVariant} context={bgContext} />
            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                {children}
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    safeArea: {
        flex: 1,
        // Remove padding here to allow full bleed if needed, individual screens should handle their padding
        // paddingHorizontal: SPACING.m, // Removed
    },
});
