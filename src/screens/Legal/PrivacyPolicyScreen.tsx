import React from 'react';
import { Text, ScrollView, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { COLORS, SPACING, FONTS } from '../../constants/theme';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

export const PrivacyPolicyScreen = () => {
    const { colors, isDark } = useTheme();
    const { isRTL, t } = useLanguage();

    const styles = React.useMemo(() => createStyles(colors, isDark, isRTL), [colors, isDark, isRTL]);

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>{t('privacyPolicy') || 'Privacy Policy'}</Text>
                <Text style={styles.subtitle}>{t('lastUpdated') || 'Last updated: February 12, 2026'}</Text>

                <Text style={styles.sectionTitle}>{t('privacySection1Title')}</Text>
                <Text style={styles.paragraph}>
                    {t('privacySection1Text')}
                </Text>

                <Text style={styles.sectionTitle}>{t('privacySection2Title')}</Text>
                <Text style={styles.paragraph}>
                    {t('privacySection2Text')}
                </Text>

                <Text style={styles.sectionTitle}>{t('privacySection3Title')}</Text>
                <Text style={styles.paragraph}>
                    {t('privacySection3Text')}
                </Text>

                <Text style={styles.sectionTitle}>{t('privacySection4Title')}</Text>
                <Text style={styles.paragraph}>
                    {t('privacySection4Text')}
                </Text>
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
