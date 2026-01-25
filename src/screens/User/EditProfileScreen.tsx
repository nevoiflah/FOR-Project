import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { COLORS, SPACING, FONTS, LAYOUT } from '../../constants/theme';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
// @ts-ignore
import { ArrowLeft, User, Calendar, Ruler, Weight } from 'lucide-react-native';
import { HapticFeedback } from '../../utils/haptics';
import { getDisplayValue, toMetricHeight, toMetricWeight } from '../../utils/units';

export const EditProfileScreen = ({ navigation }: any) => {
    const { data, updateUserProfile } = useData();
    const { t, isRTL } = useLanguage();
    const { colors, isDark } = useTheme();

    const styles = React.useMemo(() => createStyles(colors, isDark), [colors, isDark]);

    const [name, setName] = useState(data?.userProfile?.name || '');
    const [age, setAge] = useState(data?.userProfile?.age || '');

    // Initialize with converted values based on current system
    const [height, setHeight] = useState(() =>
        getDisplayValue(data?.userProfile?.height || '', 'height', data?.unitSystem || 'metric')
    );
    const [weight, setWeight] = useState(() =>
        getDisplayValue(data?.userProfile?.weight || '', 'weight', data?.unitSystem || 'metric')
    );

    const [gender, setGender] = useState<any>(data?.userProfile?.gender || 'male');

    const handleSave = async () => {
        if (!name || !age || !height || !weight) {
            Alert.alert(t('error'), t('fillAllFields'));
            return;
        }

        HapticFeedback.success();

        // Convert back to metric for storage if needed
        const metricHeight = toMetricHeight(height, data?.unitSystem || 'metric');
        const metricWeight = toMetricWeight(weight, data?.unitSystem || 'metric');

        await updateUserProfile({
            name,
            age,
            height: metricHeight,
            weight: metricWeight,
            gender
        });

        navigation.goBack();
    };

    const InputField = ({ label, value, onChange, placeholder, icon: Icon, keyboardType = 'default' }: any) => (
        <View style={styles.inputContainer}>
            <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>{label}</Text>
            <View style={[styles.inputWrapper, isRTL && { flexDirection: 'row-reverse' }]}>
                <View style={styles.iconContainer}>
                    <Icon size={20} color={colors.textSecondary} />
                </View>
                <TextInput
                    style={[styles.input, isRTL && { textAlign: 'right' }]}
                    value={value}
                    onChangeText={onChange}
                    placeholder={placeholder}
                    placeholderTextColor="#666"
                    keyboardType={keyboardType}
                />
            </View>
        </View>
    );

    const GenderOption = ({ value, label }: any) => (
        <TouchableOpacity
            style={[
                styles.genderOption,
                gender === value && styles.genderOptionSelected
            ]}
            onPress={() => {
                HapticFeedback.selection();
                setGender(value);
            }}
        >
            <Text style={[
                styles.genderText,
                gender === value && styles.genderTextSelected
            ]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <ArrowLeft size={24} color={colors.textPrimary} style={isRTL && { transform: [{ rotate: '180deg' }] }} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('editProfileTitle')}</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.container}>
                    <InputField
                        label={t('name')}
                        value={name}
                        onChange={setName}
                        placeholder={t('namePlaceholder')}
                        icon={User}
                    />

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ width: '100%' }}>
                            <InputField
                                label={t('age')}
                                value={age}
                                onChange={setAge}
                                placeholder="25"
                                keyboardType="numeric"
                                icon={Calendar}
                            />
                        </View>
                    </View>

                    {/* Gender Selector - Simplified */}
                    <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>{t('gender')}</Text>
                    <View style={styles.genderSelector}>
                        <GenderOption value="male" label={t('male')} />
                        <GenderOption value="female" label={t('female')} />
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.m }}>
                        <View style={{ width: '48%' }}>
                            <InputField
                                label={t('height')}
                                value={height}
                                onChange={setHeight}
                                placeholder={data?.unitSystem === 'metric' ? "cm" : "ft/in (total inches)"}
                                keyboardType="numeric"
                                icon={Ruler}
                            />
                        </View>
                        <View style={{ width: '48%' }}>
                            <InputField
                                label={t('weight')}
                                value={weight}
                                onChange={setWeight}
                                placeholder={data?.unitSystem === 'metric' ? "kg" : "lbs"}
                                keyboardType="numeric"
                                icon={Weight}
                            />
                        </View>
                    </View>

                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>{t('saveChanges')}</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    container: {
        padding: SPACING.l,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.l,
        paddingTop: SPACING.l,
        marginBottom: SPACING.l,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: colors.cardBackground,
    },
    inputContainer: {
        marginBottom: SPACING.l,
    },
    label: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 8,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.divider,
        height: 56,
    },
    iconContainer: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        flex: 1,
        color: colors.textPrimary,
        fontSize: 16,
        paddingHorizontal: 8,
        height: '100%',
    },
    genderSelector: {
        flexDirection: 'row',
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        padding: 4,
        marginBottom: SPACING.l,
    },
    genderOption: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
    },
    genderOptionSelected: {
        backgroundColor: colors.primary,
    },
    genderText: {
        color: colors.textSecondary,
        fontWeight: 'bold',
    },
    genderTextSelected: {
        color: colors.background,
    },
    footer: {
        padding: SPACING.l,
    },
    saveButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
    },
    saveButtonText: {
        color: colors.background,
        fontWeight: 'bold',
        fontSize: 16,
    }
});
