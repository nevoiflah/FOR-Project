import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GlassCard } from '../../components/GlassCard';
import { LanguageToggle } from '../../components/LanguageToggle';
import { COLORS, FONTS, SPACING, LAYOUT } from '../../constants/theme';
import { HapticFeedback } from '../../utils/haptics';
import { biometricService } from '../../services/BiometricService'; // New import
// @ts-ignore
import { ScanFace } from 'lucide-react-native';

export const LoginScreen = () => {
    const navigation = useNavigation<any>();
    const { t, isRTL } = useLanguage();
    const { colors, isDark } = useTheme();

    const styles = React.useMemo(() => createStyles(colors, isDark), [colors, isDark]);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [hasBiometrics, setHasBiometrics] = useState(false);

    useEffect(() => {
        checkBiometrics();
    }, []);

    const checkBiometrics = async () => {
        const creds = await biometricService.getCredentials();
        const available = await biometricService.checkAvailability();
        if (creds && available) {
            setHasBiometrics(true);
            // Optional: Auto-prompt on mount
            // handleBiometricLogin(); 
        }
    };

    const handleBiometricLogin = async () => {
        const creds = await biometricService.getCredentials();
        if (!creds) return;

        const success = await biometricService.authenticate();
        if (success) {
            setLoading(true);
            HapticFeedback.success();
            try {
                await signInWithEmailAndPassword(auth, creds.email, creds.pass);
                // Navigation handled by context
            } catch (err: any) {
                console.error(err);
                setError(t('authError'));
                HapticFeedback.error();
                setLoading(false);
            }
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            setError(t('fillAllFields'));
            return;
        }

        setLoading(true);
        setError('');
        HapticFeedback.light();

        try {
            await signInWithEmailAndPassword(auth, email, password);
            HapticFeedback.success();
            // AuthContext will automatically handle the navigation to MainBase
        } catch (err: any) {
            console.error(err);
            setError(err.message || t('authError'));
            HapticFeedback.error();
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper>
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
                        <Text style={styles.subtitle}>{t('loginSubtitle')}</Text>
                    </View>

                    <GlassCard style={styles.formContainer}>
                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, isRTL && styles.rtlText]}>
                                {t('emailPlaceholder')}
                            </Text>
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
                            <Text style={[styles.label, isRTL && styles.rtlText]}>
                                {t('passwordPlaceholder')}
                            </Text>
                            <TextInput
                                style={[styles.input, isRTL && styles.rtlInput]}
                                placeholder="••••••••"
                                placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                        {hasBiometrics && (
                            <TouchableOpacity
                                style={styles.biometricButton}
                                onPress={handleBiometricLogin}
                            >
                                <ScanFace size={24} color={colors.primary} style={{ marginRight: 8 }} />
                                <Text style={[styles.buttonText, { color: colors.primary }]}>{t('biometricLogin')}</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.button, loading && { opacity: 0.7 }]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? t('loading') : t('loginButton')}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>{t('dontHaveAccount')} </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.linkText}>{t('registerLink')}</Text>
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
    biometricButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.m,
        borderRadius: LAYOUT.borderRadius,
        borderWidth: 1,
        borderColor: colors.primary,
        marginBottom: SPACING.m,
        backgroundColor: isDark ? 'rgba(255, 69, 0, 0.1)' : 'rgba(234, 88, 12, 0.1)',
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
