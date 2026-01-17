import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GlassCard } from '../../components/GlassCard';
import { COLORS, SPACING, FONTS } from '../../constants/theme';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
// @ts-ignore
import { ArrowRight, User, Ruler, Weight, Calendar } from 'lucide-react-native';

export const OnboardingScreen = ({ navigation, route }: any) => {
    const { updateUserProfile, data } = useData();
    const { t, isRTL } = useLanguage();

    const isEditing = route?.params?.isEditing || false;
    const initialData = route?.params?.currentProfile || {};

    const [step, setStep] = useState(1);

    // Form State
    const [name, setName] = useState(initialData.name || '');
    const [gender, setGender] = useState<'male' | 'female' | 'other'>(initialData.gender || 'male');
    const [age, setAge] = useState(initialData.age || '');
    const [height, setHeight] = useState(initialData.height || '');
    const [weight, setWeight] = useState(initialData.weight || '');

    const handleNext = () => {
        if (step === 1) {
            if (!name.trim() || !age.trim()) {
                Alert.alert(t('error'), "Please enter your name and age.");
                return;
            }
            setStep(2);
        } else {
            // Finish
            if (!height.trim() || !weight.trim()) {
                Alert.alert(t('error'), "Please enter your height and weight.");
                return;
            }

            // Save Profile
            updateUserProfile({
                name,
                gender,
                age,
                height,
                weight
            });

            // Navigate
            if (isEditing) {
                navigation.goBack();
            } else {
                navigation.replace('MainBase');
            }
        }
    };

    const GenderOption = ({ value, label }: { value: 'male' | 'female' | 'other', label: string }) => (
        <TouchableOpacity
            onPress={() => setGender(value)}
            style={[
                styles.genderOption,
                gender === value && styles.genderOptionSelected
            ]}
        >
            <Text style={[
                styles.genderText,
                gender === value && styles.genderTextSelected
            ]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.container}>

                {/* Progress Indicators */}
                <View style={[styles.progressContainer, isRTL && { flexDirection: 'row-reverse' }]}>
                    <View style={[styles.dot, step >= 1 && styles.dotActive]} />
                    <View style={styles.line} />
                    <View style={[styles.dot, step >= 2 && styles.dotActive]} />
                </View>

                <Text style={styles.title}>
                    {step === 1 ? (isEditing ? "Edit Profile" : "Let's get to know you") : "Body Metrics"}
                </Text>
                <Text style={styles.subtitle}>
                    {step === 1 ? "This helps us personalize your experience." : "Used for accurate calorie and recovery calculations."}
                </Text>

                <GlassCard style={styles.formCard}>
                    {step === 1 ? (
                        <>
                            {/* Step 1: Identity */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>{t('name') || 'Name'}</Text>
                                <View style={[styles.inputWrapper, isRTL && { flexDirection: 'row-reverse' }]}>
                                    <User size={20} color={COLORS.textSecondary} />
                                    <TextInput
                                        style={[styles.input, isRTL && { textAlign: 'right', marginRight: 10 }]}
                                        placeholder="Your Name"
                                        placeholderTextColor={COLORS.textSecondary}
                                        value={name}
                                        onChangeText={setName}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>{t('age') || 'Age'}</Text>
                                <View style={[styles.inputWrapper, isRTL && { flexDirection: 'row-reverse' }]}>
                                    <Calendar size={20} color={COLORS.textSecondary} />
                                    <TextInput
                                        style={[styles.input, isRTL && { textAlign: 'right', marginRight: 10 }]}
                                        placeholder="Years"
                                        placeholderTextColor={COLORS.textSecondary}
                                        value={age}
                                        onChangeText={setAge}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>{t('gender') || 'Gender'}</Text>
                                <View style={[styles.genderRow, isRTL && { flexDirection: 'row-reverse' }]}>
                                    <GenderOption value="male" label="Male" />
                                    <GenderOption value="female" label="Female" />
                                    <GenderOption value="other" label="Other" />
                                </View>
                            </View>
                        </>
                    ) : (
                        <>
                            {/* Step 2: Metrics */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>{t('height') || 'Height'} (cm)</Text>
                                <View style={[styles.inputWrapper, isRTL && { flexDirection: 'row-reverse' }]}>
                                    <Ruler size={20} color={COLORS.textSecondary} />
                                    <TextInput
                                        style={[styles.input, isRTL && { textAlign: 'right', marginRight: 10 }]}
                                        placeholder="175"
                                        placeholderTextColor={COLORS.textSecondary}
                                        value={height}
                                        onChangeText={setHeight}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>{t('weight') || 'Weight'} (kg)</Text>
                                <View style={[styles.inputWrapper, isRTL && { flexDirection: 'row-reverse' }]}>
                                    <Weight size={20} color={COLORS.textSecondary} />
                                    <TextInput
                                        style={[styles.input, isRTL && { textAlign: 'right', marginRight: 10 }]}
                                        placeholder="70"
                                        placeholderTextColor={COLORS.textSecondary}
                                        value={weight}
                                        onChangeText={setWeight}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                        </>
                    )}

                    <TouchableOpacity style={styles.button} onPress={handleNext}>
                        <Text style={styles.buttonText}>{step === 1 ? 'Next' : 'Finish Setup'}</Text>
                        <ArrowRight size={20} color={COLORS.background} style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                </GlassCard>
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: SPACING.l,
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },
    formCard: {
        padding: SPACING.l,
    },
    inputGroup: {
        marginBottom: SPACING.l,
    },
    label: {
        color: COLORS.textSecondary,
        marginBottom: 8,
        fontSize: 14,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        paddingHorizontal: SPACING.m,
        height: 50,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    input: {
        flex: 1,
        color: COLORS.textPrimary,
        marginLeft: 10,
        fontSize: 16,
    },
    genderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    genderOption: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    genderOptionSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    genderText: {
        color: COLORS.textSecondary,
    },
    genderTextSelected: {
        color: COLORS.background,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginTop: SPACING.m,
    },
    buttonText: {
        color: COLORS.background,
        fontWeight: 'bold',
        fontSize: 16,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.xl,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    dotActive: {
        backgroundColor: COLORS.primary,
        transform: [{ scale: 1.2 }],
    },
    line: {
        width: 40,
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 8,
    }
});
