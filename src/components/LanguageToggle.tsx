import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';
import { useLanguage } from '../contexts/LanguageContext';

export const LanguageToggle = () => {
    const { locale, setLocale } = useLanguage();

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.option, locale === 'en' && styles.active]}
                onPress={() => setLocale('en')}
            >
                <Text style={[styles.text, locale === 'en' && styles.activeText]}>EN</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.option, locale === 'he' && styles.active]}
                onPress={() => setLocale('he')}
            >
                <Text style={[styles.text, locale === 'he' && styles.activeText]}>HE</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 4,
        alignSelf: 'flex-start', // Allows positioning
    },
    option: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 16,
    },
    active: {
        backgroundColor: COLORS.primary,
    },
    text: {
        color: COLORS.textSecondary,
        fontWeight: 'bold',
        fontSize: 12,
    },
    activeText: {
        color: '#000', // Dark text on mint background
    },
});
