import React from 'react';
import { Text, ScrollView, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GlassCard } from '../../components/GlassCard';
import { COLORS, SPACING, FONTS } from '../../constants/theme';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

export const PrivacyPolicyScreen = () => {
    const { colors, isDark } = useTheme();
    const { isRTL } = useLanguage();

    const styles = React.useMemo(() => createStyles(colors, isDark, isRTL), [colors, isDark, isRTL]);

    return (
        <ScreenWrapper bgVariant="auth">
            <ScrollView contentContainerStyle={styles.container}>
                <GlassCard style={styles.card}>
                    <Text style={styles.title}>Privacy Policy</Text>
                    <Text style={styles.subtitle}>Last updated: February 12, 2026</Text>

                    <Text style={styles.sectionTitle}>1. Data Security</Text>
                    <Text style={styles.paragraph}>
                        Your privacy is our top priority. All personal health data (Heart Rate, HRV, Activity) is stored securely on MongoDB Atlas using industry-standard encryption.
                    </Text>

                    <Text style={styles.sectionTitle}>2. Data Ownership</Text>
                    <Text style={styles.paragraph}>
                        You own your data. Your health records are accessible ONLY by your authenticated user account. We do not sell, share, or analyze your data for third-party advertising.
                    </Text>

                    <Text style={styles.sectionTitle}>3. Local Storage</Text>
                    <Text style={styles.paragraph}>
                        For offline access, some data is cached locally on your device using secure storage. This data is automatically synchronized with the cloud when an internet connection is available.
                    </Text>

                    <Text style={styles.sectionTitle}>4. Contact Us</Text>
                    <Text style={styles.paragraph}>
                        If you have any questions about this Privacy Policy, please contact us at support@for-project.com.
                    </Text>
                </GlassCard>
            </ScrollView>
        </ScreenWrapper>
    );
};

const createStyles = (colors: any, isDark: boolean, isRTL: boolean) => StyleSheet.create({
    container: {
        padding: SPACING.l,
        paddingTop: 80, // Space for header/back button if needed
    },
    card: {
        padding: SPACING.l,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: SPACING.s,
        textAlign: isRTL ? 'right' : 'left',
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: SPACING.xl,
        textAlign: isRTL ? 'right' : 'left',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
        marginTop: SPACING.l,
        marginBottom: SPACING.s,
        textAlign: isRTL ? 'right' : 'left',
    },
    paragraph: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 22,
        marginBottom: SPACING.s,
        textAlign: isRTL ? 'right' : 'left',
    },
});
