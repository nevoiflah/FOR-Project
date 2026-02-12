import React from 'react';
import { Text, ScrollView, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { COLORS, SPACING } from '../../constants/theme';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

export const TermsScreen = () => {
    const { colors, isDark } = useTheme();
    const { isRTL, t } = useLanguage();

    const styles = React.useMemo(() => createStyles(colors, isDark, isRTL), [colors, isDark, isRTL]);

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>{t('termsOfUse') || 'Terms of Use'}</Text>
                <Text style={styles.subtitle}>Last updated: February 12, 2026</Text>

                <Text style={styles.sectionTitle}>1. Not a Medical Device</Text>
                <Text style={styles.paragraph}>
                    The F.O.R Project app and associated hardware are designed for general wellness and informational purposes only. They are NOT intended to diagnose, treat, cure, or prevent any disease or medical condition. Always consult a physician before making any changes to your diet, exercise, or health regimen.
                </Text>

                <Text style={styles.sectionTitle}>2. Acceptance of Terms</Text>
                <Text style={styles.paragraph}>
                    By creating an account and using this application, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the application.
                </Text>

                <Text style={styles.sectionTitle}>3. User Accounts</Text>
                <Text style={styles.paragraph}>
                    You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
                </Text>

                <Text style={styles.sectionTitle}>4. Liability</Text>
                <Text style={styles.paragraph}>
                    We help you track your wellness, but we are not responsible for how you interpret or use this data. Use common sense and listen to your body.
                </Text>
            </ScrollView>
        </ScreenWrapper>
    );
};

const createStyles = (colors: any, isDark: boolean, isRTL: boolean) => StyleSheet.create({
    container: {
        padding: SPACING.l,
        paddingTop: 80,
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
