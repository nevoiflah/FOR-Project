import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useLanguage } from '../../contexts/LanguageContext';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GlassCard } from '../../components/GlassCard';
import { LanguageToggle } from '../../components/LanguageToggle';
import { COLORS, FONTS, SPACING, LAYOUT } from '../../constants/theme';
import { HapticFeedback } from '../../utils/haptics';

export const LoginScreen = () => {
    const navigation = useNavigation<any>();
    const { t, isRTL } = useLanguage();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
                        <Text style={styles.logoText}>FOR</Text>
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
                                placeholderTextColor="rgba(255,255,255,0.3)"
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
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

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

const styles = StyleSheet.create({
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
        color: COLORS.primary,
        letterSpacing: 4,
        marginBottom: SPACING.s,
    },
    title: {
        fontSize: FONTS.headerSize,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SPACING.s,
    },
    subtitle: {
        fontSize: FONTS.bodySize,
        color: COLORS.textSecondary,
    },
    formContainer: {
        padding: SPACING.l,
    },
    inputContainer: {
        marginBottom: SPACING.l,
    },
    label: {
        color: COLORS.textSecondary,
        marginBottom: SPACING.s,
        fontSize: 14,
    },
    rtlText: {
        textAlign: 'right',
    },
    input: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: LAYOUT.borderRadius,
        padding: SPACING.m,
        color: COLORS.textPrimary,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    rtlInput: {
        textAlign: 'right',
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: SPACING.m,
        borderRadius: LAYOUT.borderRadius,
        alignItems: 'center',
        marginTop: SPACING.s,
    },
    buttonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SPACING.l,
    },
    footerText: {
        color: COLORS.textSecondary,
    },
    linkText: {
        color: COLORS.accent,
        fontWeight: 'bold',
    },
    errorText: {
        color: '#FF6B6B',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        padding: 10,
        borderRadius: 8,
        marginBottom: SPACING.m,
        textAlign: 'center',
        fontSize: 12,
    },
});
