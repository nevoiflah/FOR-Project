import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
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
                <Text style={styles.subtitle}>{t('lastUpdated') || 'Last updated: February 18, 2026'}</Text>

                <Text style={styles.paragraph}>{t('legalWelcome')}</Text>

                {[
                    { title: 'legalAccessTitle', body: 'legalAccessBody' },
                    { title: 'legalResponsibilityTitle', body: 'legalResponsibilityBody' },
                    { title: 'legalMedicalTitle', body: 'legalMedicalBody' },
                    { title: 'legalDataTitle', body: 'legalDataBody' },
                    { title: 'legalIPTitle', body: 'legalIPBody' },
                    { title: 'legalWarrantyTitle', body: 'legalWarrantyBody' },
                    { title: 'legalLimitationTitle', body: 'legalLimitationBody' },
                    { title: 'legalPrecautionsTitle', body: 'legalPrecautionsBody' },
                    { title: 'legalTerminationTitle', body: 'legalTerminationBody' },
                ].map((section, index) => (
                    <View key={index} style={styles.section}>
                        <Text style={styles.sectionTitle}>{t(section.title as any)}</Text>
                        <Text style={styles.paragraph}>{t(section.body as any)}</Text>
                    </View>
                ))}
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
    section: {
        marginBottom: SPACING.m,
    },
});
