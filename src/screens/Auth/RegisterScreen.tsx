import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GlassCard } from '../../components/GlassCard';
import { LanguageToggle } from '../../components/LanguageToggle';
import { COLORS, FONTS, SPACING, LAYOUT } from '../../constants/theme';
import { HapticFeedback } from '../../utils/haptics';

export const RegisterScreen = () => {
    const navigation = useNavigation<any>();
    const { t, isRTL } = useLanguage();
    const { colors, isDark } = useTheme();

    const styles = React.useMemo(() => createStyles(colors, isDark), [colors, isDark]);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async () => {
        if (!email || !password || !name) {
            setError(t('fillAllFields'));
            return;
        }

        setLoading(true);
        setError('');
        HapticFeedback.light();

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Update profile with name
            await updateProfile(userCredential.user, { displayName: name });

            HapticFeedback.success();
            // AuthContext will automatically navigate to Onboarding due to user state change
        } catch (err: any) {
            console.error(err);
            setError(err.message || t('authError'));
            HapticFeedback.error();
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper bgVariant="auth">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    {/* Language Toggle - Top Right */}
                    <View style={styles.topRight}>
                        <LanguageToggle />
                    </View>

                    <View style={styles.headerContainer}>
                        <Text style={styles.logoText}>F.O.R</Text>
                        <Text style={styles.subtitle}>{t('registerSubtitle')}</Text>
                    </View>

                    <GlassCard style={styles.formContainer}>
                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, isRTL && styles.rtlText]}>{t('namePlaceholder')}</Text>
                            <TextInput
                                style={[styles.input, isRTL && styles.rtlInput]}
                                placeholder="John Doe"
                                placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
                                value={name}
                                onChangeText={setName}
                                autoCorrect={false}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, isRTL && styles.rtlText]}>{t('emailPlaceholder')}</Text>
                            <TextInput
                                style={[styles.input, isRTL && styles.rtlInput]}
                                placeholder="name@example.com"
                                placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                                autoCorrect={false}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, isRTL && styles.rtlText]}>{t('passwordPlaceholder')}</Text>
                            <TextInput
                                style={[styles.input, isRTL && styles.rtlInput]}
                                placeholder="••••••••"
                                placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.button, loading && { opacity: 0.7 }]}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? t('loading') : t('signUpButton')}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>{t('alreadyHaveAccount')} </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.linkText}>{t('loginLink')}</Text>
                            </TouchableOpacity>
                        </View>
                    </GlassCard>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        padding: SPACING.l,
        justifyContent: 'center',
    },
    topRight: {
        position: 'absolute',
        top: 60,
        right: 20,
        zIndex: 10,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    logoText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: colors.primary,
        letterSpacing: 4,
        marginBottom: SPACING.s,
    },
    title: {
        fontSize: FONTS.headerSize,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: SPACING.s,
    },
    subtitle: {
        fontSize: FONTS.bodySize,
        color: colors.textSecondary,
    },
    formContainer: {
        padding: SPACING.l,
    },
    inputContainer: {
        marginBottom: SPACING.l,
    },
    label: {
        color: colors.textSecondary,
        marginBottom: SPACING.s,
        fontSize: 14,
    },
    rtlText: {
        textAlign: 'right',
    },
    input: {
        backgroundColor: colors.cardBackground,
        borderRadius: LAYOUT.borderRadius,
        padding: SPACING.m,
        color: colors.textPrimary,
        borderWidth: 1,
        borderColor: colors.divider,
    },
    rtlInput: {
        textAlign: 'right',
    },
    button: {
        backgroundColor: colors.primary,
        padding: SPACING.m,
        borderRadius: LAYOUT.borderRadius,
        alignItems: 'center',
        marginTop: SPACING.s,
    },
    buttonText: {
        color: isDark ? '#000' : '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SPACING.l,
    },
    footerText: {
        color: colors.textSecondary,
    },
    linkText: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    errorText: {
        color: colors.danger,
        backgroundColor: isDark ? 'rgba(248, 113, 113, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        padding: 10,
        borderRadius: 8,
        marginBottom: SPACING.m,
        textAlign: 'center',
        fontSize: 12,
    },
});
