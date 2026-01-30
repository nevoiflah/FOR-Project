import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, LayoutAnimation, UIManager } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GlassCard } from '../../components/GlassCard';
import { LanguageToggle } from '../../components/LanguageToggle';
import { COLORS, FONTS, SPACING, LAYOUT } from '../../constants/theme';
import { HapticFeedback } from '../../utils/haptics';
// @ts-ignore
import { ArrowRight, ArrowLeft, Ruler, Weight, Calendar, User, Mail, Lock } from 'lucide-react-native';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

export const RegisterScreen = () => {
    const navigation = useNavigation<any>();
    const { t, isRTL } = useLanguage();
    const { colors, isDark } = useTheme();

    const styles = React.useMemo(() => createStyles(colors, isDark), [colors, isDark]);

    // Wizard State
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Step 1: Identity
    const [name, setName] = useState('');
    const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');

    // Step 2: Body Metrics
    const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
    const [age, setAge] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');

    // Step 3: Account
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleNext = () => {
        HapticFeedback.light();
        setError('');

        if (step === 1) {
            if (!name.trim() || !gender) {
                setError(t('fillAllFields'));
                HapticFeedback.error();
                return;
            }
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setStep(2);
        } else if (step === 2) {
            if (!age.trim() || !height.trim() || !weight.trim()) {
                setError(t('fillAllFields'));
                HapticFeedback.error();
                return;
            }
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setStep(3);
        } else if (step === 3) {
            handleRegister();
        }
    };

    const handleBack = () => {
        HapticFeedback.light();
        setError('');
        if (step > 1) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setStep(step - 1);
        } else {
            navigation.goBack();
        }
    };

    const handleRegister = async () => {
        if (!email || !password) {
            setError(t('fillAllFields'));
            HapticFeedback.error();
            return;
        }

        setLoading(true);
        HapticFeedback.light();

        try {
            // 1. Create Auth User
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Update Auth Profile
            await updateProfile(user, { displayName: name });

            // 3. Create User Document with ALL data
            const userDocRef = doc(db, 'users', user.uid);

            // Default data structure
            const initialData = {
                userProfile: {
                    name,
                    gender,
                    age,
                    height,
                    weight
                },
                unitSystem,
                sleep: { duration: '0h 0m', score: 0, deep: '0h 0m', rem: '0h 0m', weekly: [] },
                steps: { count: 0, goal: 10000, calories: 0 },
                heart: { bpm: 0, resting: 0, variability: 0, trend: [] },
                readiness: { score: 0, status: 'Unknown', weekly: [] },
                goals: [],
                history: [],
                notificationsEnabled: true
            };

            await setDoc(userDocRef, initialData);

            HapticFeedback.success();
            // Navigation handled by AuthContext listening to user state
        } catch (err: any) {
            console.error(err);
            setError(err.message || t('authError'));
            HapticFeedback.error();
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 1: // Identity
                return (
                    <>
                        <Text style={styles.stepTitle}>{t('gettingToKnowYou') || "Let's get to know you"}</Text>
                        <Text style={styles.stepSubtitle}>{t('identitySubtitle') || "This helps us personalize your experience."}</Text>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, isRTL && styles.rtlText]}>{t('namePlaceholder')}</Text>
                            <View style={[styles.inputWrapper, isRTL && { flexDirection: 'row-reverse' }]}>
                                <User size={20} color={colors.textSecondary} />
                                <TextInput
                                    style={[styles.inputWithIcon, isRTL && styles.rtlInput]}
                                    placeholder="Enter your name"
                                    placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
                                    value={name}
                                    onChangeText={setName}
                                    autoCorrect={false}
                                />
                            </View>
                        </View>

                        <Text style={[styles.label, isRTL && styles.rtlText]}>{t('gender') || 'Gender'}</Text>
                        <View style={styles.genderContainer}>
                            {(['male', 'female', 'other'] as const).map((g) => (
                                <TouchableOpacity
                                    key={g}
                                    style={[styles.genderCard, gender === g && styles.genderCardSelected]}
                                    onPress={() => { setGender(g); HapticFeedback.selection(); }}
                                >
                                    <Text style={[styles.genderText, gender === g && styles.genderTextSelected]}>
                                        {t(g) || g.charAt(0).toUpperCase() + g.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                );
            case 2: // Metrics
                return (
                    <>
                        <Text style={styles.stepTitle}>{t('bodyMetrics') || "Body Metrics"}</Text>
                        <Text style={styles.stepSubtitle}>{t('metricsSubtitle') || "Used for accurate calorie and recovery calculations."}</Text>

                        {/* Unit Toggle */}
                        <View style={styles.unitToggleContainer}>
                            <TouchableOpacity
                                style={[styles.unitButton, unitSystem === 'metric' && styles.unitButtonSelected]}
                                onPress={() => { setUnitSystem('metric'); HapticFeedback.selection(); }}
                            >
                                <Text style={[styles.unitText, unitSystem === 'metric' && styles.unitTextSelected]}>Metric (cm/kg)</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.unitButton, unitSystem === 'imperial' && styles.unitButtonSelected]}
                                onPress={() => { setUnitSystem('imperial'); HapticFeedback.selection(); }}
                            >
                                <Text style={[styles.unitText, unitSystem === 'imperial' && styles.unitTextSelected]}>Imperial (ft/lbs)</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, isRTL && styles.rtlText]}>{t('age') || 'Age'}</Text>
                            <View style={[styles.inputWrapper, isRTL && { flexDirection: 'row-reverse' }]}>
                                <Calendar size={20} color={colors.textSecondary} />
                                <TextInput
                                    style={[styles.inputWithIcon, isRTL && styles.rtlInput]}
                                    placeholder="Years"
                                    placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
                                    value={age}
                                    onChangeText={setAge}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputContainer, { flex: 1, marginRight: SPACING.s }]}>
                                <Text style={[styles.label, isRTL && styles.rtlText]}>
                                    {t('height') || 'Height'} ({unitSystem === 'metric' ? 'cm' : 'ft'})
                                </Text>
                                <View style={[styles.inputWrapper, isRTL && { flexDirection: 'row-reverse' }]}>
                                    <Ruler size={20} color={colors.textSecondary} />
                                    <TextInput
                                        style={[styles.inputWithIcon, isRTL && styles.rtlInput]}
                                        placeholder={unitSystem === 'metric' ? "175" : "5.9"}
                                        placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
                                        value={height}
                                        onChangeText={setHeight}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                            <View style={[styles.inputContainer, { flex: 1, marginLeft: SPACING.s }]}>
                                <Text style={[styles.label, isRTL && styles.rtlText]}>
                                    {t('weight') || 'Weight'} ({unitSystem === 'metric' ? 'kg' : 'lbs'})
                                </Text>
                                <View style={[styles.inputWrapper, isRTL && { flexDirection: 'row-reverse' }]}>
                                    <Weight size={20} color={colors.textSecondary} />
                                    <TextInput
                                        style={[styles.inputWithIcon, isRTL && styles.rtlInput]}
                                        placeholder={unitSystem === 'metric' ? "70" : "150"}
                                        placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
                                        value={weight}
                                        onChangeText={setWeight}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                        </View>
                    </>
                );
            case 3: // Account
                return (
                    <>
                        <Text style={styles.stepTitle}>{t('secureAccount') || "Secure your account"}</Text>
                        <Text style={styles.stepSubtitle}>{t('accountSubtitle') || "Save your progress and access it anywhere."}</Text>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, isRTL && styles.rtlText]}>{t('emailPlaceholder')}</Text>
                            <View style={[styles.inputWrapper, isRTL && { flexDirection: 'row-reverse' }]}>
                                <Mail size={20} color={colors.textSecondary} />
                                <TextInput
                                    style={[styles.inputWithIcon, isRTL && styles.rtlInput]}
                                    placeholder="name@example.com"
                                    placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCorrect={false}
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, isRTL && styles.rtlText]}>{t('passwordPlaceholder')}</Text>
                            <View style={[styles.inputWrapper, isRTL && { flexDirection: 'row-reverse' }]}>
                                <Lock size={20} color={colors.textSecondary} />
                                <TextInput
                                    style={[styles.inputWithIcon, isRTL && styles.rtlInput]}
                                    placeholder="••••••••"
                                    placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>
                        </View>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <ScreenWrapper bgVariant="auth">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    {/* Language Toggle - Constant Visibility */}
                    <View style={styles.topRight}>
                        <LanguageToggle />
                    </View>

                    <View style={styles.headerContainer}>
                        <Text style={styles.logoText}>F.O.R</Text>
                    </View>

                    <GlassCard style={styles.cardContainer}>
                        {/* Progress Bar */}
                        <View style={styles.progressContainer}>
                            <View style={[styles.progressBar, { width: `${(step / 3) * 100}%`, backgroundColor: colors.primary }]} />
                        </View>

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        {renderStepContent()}

                        <View style={styles.navigationRow}>
                            {step > 1 ? (
                                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                                    <ArrowLeft size={24} color={colors.textSecondary} />
                                </TouchableOpacity>
                            ) : (
                                <View style={{ width: 24 }} /> // Spacer to keep Next button on right
                            )}

                            <TouchableOpacity
                                style={[styles.nextButton, loading && { opacity: 0.7 }]}
                                onPress={handleNext}
                                disabled={loading}
                            >
                                <Text style={styles.nextButtonText}>
                                    {loading ? t('loading') : (step === 3 ? t('createAccount') || 'Create Account' : t('next') || 'Next')}
                                </Text>
                                {!loading && step < 3 && <ArrowRight size={20} color={isDark ? '#000' : '#fff'} style={{ marginLeft: 8 }} />}
                            </TouchableOpacity>
                        </View>

                        {step === 1 && (
                            <View style={styles.footer}>
                                <Text style={styles.footerText}>{t('alreadyHaveAccount')} </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                    <Text style={styles.linkText}>{t('loginLink')}</Text>
                                </TouchableOpacity>
                            </View>
                        )}

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
        zIndex: 50, // High z-index to stay on top
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: SPACING.l,
        marginTop: 60
    },
    logoText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.primary,
        letterSpacing: 4,
    },
    cardContainer: {
        padding: SPACING.l,
    },
    progressContainer: {
        height: 4,
        backgroundColor: colors.divider,
        borderRadius: 2,
        marginBottom: SPACING.l,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 2,
    },
    stepTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: SPACING.xs,
    },
    stepSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: SPACING.xl,
    },
    inputContainer: {
        marginBottom: SPACING.l,
    },
    label: {
        color: colors.textSecondary,
        marginBottom: SPACING.s,
        fontSize: 14,
        fontWeight: '600',
    },
    rtlText: {
        textAlign: 'right',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        paddingHorizontal: SPACING.m,
        height: 50,
        borderWidth: 1,
        borderColor: colors.divider,
    },
    inputWithIcon: {
        flex: 1,
        color: colors.textPrimary,
        marginLeft: 10,
        fontSize: 16,
        paddingVertical: 10,
    },
    rtlInput: {
        textAlign: 'right',
        marginRight: 10,
        marginLeft: 0,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    genderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.l,
    },
    genderCard: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginHorizontal: 4,
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    genderCardSelected: {
        borderColor: colors.primary,
        backgroundColor: isDark ? 'rgba(234, 88, 12, 0.2)' : 'rgba(234, 88, 12, 0.1)',
    },
    genderText: {
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
    genderTextSelected: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    unitToggleContainer: {
        flexDirection: 'row',
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        padding: 4,
        marginBottom: SPACING.l,
    },
    unitButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    unitButtonSelected: {
        backgroundColor: colors.surface,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2,
    },
    unitText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    unitTextSelected: {
        color: colors.primary,
    },
    navigationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: SPACING.l,
    },
    backButton: {
        padding: SPACING.s,
    },
    nextButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    nextButtonText: {
        color: isDark ? '#000' : '#fff',
        fontWeight: 'bold',
        fontSize: 16,
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
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SPACING.l,
        paddingTop: SPACING.m,
        borderTopWidth: 1,
        borderTopColor: colors.divider,
    },
    footerText: {
        color: colors.textSecondary,
    },
    linkText: {
        color: colors.primary,
        fontWeight: 'bold',
    },
});
