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
                <Text style={styles.subtitle}>{t('lastUpdated') || 'Last updated: February 12, 2026'}</Text>

                <Text style={styles.sectionTitle}>{t('termsSection1Title')}</Text>
                <Text style={styles.paragraph}>
                    {t('termsSection1Text')}
                </Text>

                <Text style={styles.sectionTitle}>{t('termsSection2Title')}</Text>
                <Text style={styles.paragraph}>
                    {t('termsSection2Text')}
                </Text>

                <Text style={styles.sectionTitle}>{t('termsSection3Title')}</Text>
                <Text style={styles.paragraph}>
                    {t('termsSection3Text')}
                </Text>

                <Text style={styles.sectionTitle}>{t('termsSection4Title')}</Text>
                <Text style={styles.paragraph}>
                    {t('termsSection4Text')}
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
