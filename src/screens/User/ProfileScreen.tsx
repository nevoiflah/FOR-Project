import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GlassCard } from '../../components/GlassCard';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { LanguageToggle } from '../../components/LanguageToggle';
// @ts-ignore
import { User, Bell, Smartphone, Shield, LogOut, ChevronRight, Activity, Calendar, Ruler, Weight } from 'lucide-react-native';

import { HapticFeedback } from '../../utils/haptics';

import { notificationService } from '../../services/NotificationService';
import { useAuth } from '../../contexts/AuthContext';

export const ProfileScreen = ({ navigation }: any) => {
    const { connectRing, isConnected, simulateData, data } = useData();
    const { t, isRTL } = useLanguage();
    const { logout, user } = useAuth();

    // Settings State
    const [notifications, setNotifications] = useState(false);
    const [metricUnits, setMetricUnits] = useState(true);



    const toggleNotifications = async (value: boolean) => {
        HapticFeedback.light();
        if (value) {
            const token = await notificationService.registerForPushNotificationsAsync();
            if (token) {
                setNotifications(true);
                // Schedule default reminders
                await notificationService.scheduleMorningReadiness(data?.readiness.score || 85);
            } else {
                Alert.alert(t('error'), "Notification permissions are required. Please enable them in your device settings.");
                setNotifications(false);
            }
        } else {
            await notificationService.cancelAllNotifications();
            setNotifications(false);
        }
    };

    const sendTestNotification = async () => {
        HapticFeedback.success();
        await notificationService.scheduleHealthReminder(
            "Test Notification 🧪",
            "This is a test from the FOR app!",
            new Date().getHours(),
            new Date().getMinutes() + 1 // Schedule for 1 min from now or just use immediate if possible.
            // Actually scheduleNotificationAsync can take immediate too, but let's stick to our helper.
        );
        Alert.alert("Success", "Test notification scheduled for 1 minute from now.");
    };

    const handleLogout = () => {
        Alert.alert(t('logoutConfirmTitle'), t('logoutConfirmMessage'), [
            { text: t('cancel'), style: "cancel" },
            { text: t('confirm'), style: "destructive", onPress: logout }
        ]);
    };

    const SettingRow = ({ icon: Icon, title, value, onPress, isToggle = false, toggleValue = false, onToggle, showChevron = true }: any) => (
        <TouchableOpacity
            style={[styles.row, isRTL && { flexDirection: 'row-reverse' }]} // Manual RTL flip
            onPress={() => {
                HapticFeedback.light();
                onPress && onPress();
            }}
            disabled={(isToggle && !onToggle) || !onPress}
            activeOpacity={isToggle ? 1 : 0.7}
        >
            <View style={[styles.rowLeft, isRTL && { flexDirection: 'row-reverse' }]}>
                <View style={[styles.iconContainer, isRTL ? { marginLeft: SPACING.m, marginRight: 0 } : { marginRight: SPACING.m }]}>
                    <Icon size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.rowTitle}>{title}</Text>
            </View>

            {isToggle ? (
                <Switch
                    value={toggleValue}
                    onValueChange={onToggle}
                    trackColor={{ false: '#3e3e3e', true: COLORS.primary }}
                    thumbColor={'#fff'}
                    ios_backgroundColor="#3e3e3e"
                />
            ) : (
                <View style={[styles.rowRight, isRTL && { flexDirection: 'row-reverse' }]}>
                    {value && <Text style={[styles.rowValue, isRTL && { marginLeft: 8, marginRight: 0 }]}>{value}</Text>}
                    {showChevron && <ChevronRight size={16} color={COLORS.textSecondary} style={isRTL && { transform: [{ rotate: '180deg' }] }} />}
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.l }}>
                    <Text style={styles.pageTitle}>{t('profile')}</Text>
                    <LanguageToggle />
                </View>

                {/* Header Information */}
                <GlassCard style={[styles.profileCard, isRTL && { flexDirection: 'row-reverse' }]}>
                    <View style={[styles.avatar, isRTL ? { marginLeft: SPACING.m, marginRight: 0 } : { marginRight: SPACING.m }]}>
                        <User size={30} color={COLORS.background} />
                    </View>
                    <View style={isRTL && { alignItems: 'flex-end' }}>
                        <Text style={styles.profileName}>{data?.userProfile?.name || user?.displayName || 'Guest'}</Text>
                        <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
                    </View>
                </GlassCard>

                {/* Personal Data Section */}
                {data?.userProfile && (
                    <>
                        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.s, marginBottom: SPACING.s }}>
                            <Text style={[styles.sectionHeader, { marginTop: 0, marginBottom: 0, marginRight: 0, marginLeft: SPACING.s }, isRTL && { textAlign: 'right', marginRight: SPACING.s, marginLeft: 0 }]}>
                                {t('myDetails')}
                            </Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Onboarding', { isEditing: true, currentProfile: data.userProfile })}
                                style={{ padding: 4, marginRight: isRTL ? 0 : SPACING.s, marginLeft: isRTL ? SPACING.s : 0 }}
                            >
                                <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>{t('edit') || 'Edit'}</Text>
                            </TouchableOpacity>
                        </View>
                        <GlassCard style={styles.settingsGroup}>
                            <SettingRow
                                icon={Calendar}
                                title={t('age')}
                                value={data.userProfile.age}
                                showChevron={false}
                            />
                            <View style={styles.divider} />
                            <SettingRow
                                icon={User}
                                title={t('gender')}
                                value={data.userProfile.gender ? t(data.userProfile.gender as any) : ''}
                                showChevron={false}
                            />
                            <View style={styles.divider} />
                            <SettingRow
                                icon={Ruler}
                                title={t('height')}
                                value={`${data.userProfile.height} cm`}
                                showChevron={false}
                            />
                            <View style={styles.divider} />
                            <SettingRow
                                icon={Weight}
                                title={t('weight')}
                                value={`${data.userProfile.weight} kg`}
                                showChevron={false}
                            />
                        </GlassCard>
                    </>
                )}

                {/* Settings Section: Preferences */}
                <Text style={[styles.sectionHeader, isRTL && { textAlign: 'right', marginRight: SPACING.s, marginLeft: 0 }]}>{t('preferences')}</Text>
                <GlassCard style={styles.settingsGroup}>
                    <SettingRow
                        icon={Bell}
                        title={t('notifications')}
                        isToggle
                        toggleValue={notifications}
                        onToggle={toggleNotifications}
                    />
                    <View style={styles.divider} />
                    <SettingRow
                        icon={Activity}
                        title={t('units')}
                        value={metricUnits ? t('metric') : t('imperial')}
                        onPress={() => setMetricUnits(!metricUnits)}
                    />
                </GlassCard>


                {/* Settings Section: Device */}
                <Text style={[styles.sectionHeader, isRTL && { textAlign: 'right', marginRight: SPACING.s, marginLeft: 0 }]}>{t('device')}</Text>
                <GlassCard style={styles.settingsGroup}>
                    <SettingRow
                        icon={Smartphone}
                        title={t('ringConnection')}
                        value={isConnected ? t('connected') : t('disconnected')}
                        onPress={connectRing}
                    />
                    <View style={styles.divider} />
                    <SettingRow
                        icon={Shield}
                        title={t('firmware')}
                        value="v2.1.0"
                    />
                </GlassCard>

                {/* Developer Tools (Simulation) */}
                <Text style={[styles.sectionHeader, isRTL && { textAlign: 'right', marginRight: SPACING.s, marginLeft: 0 }]}>Developer Tools</Text>
                <GlassCard style={styles.settingsGroup}>
                    <SettingRow
                        icon={Bell}
                        title="Send Test Notification"
                        onPress={sendTestNotification}
                    />
                    <View style={styles.divider} />
                    <SettingRow
                        icon={Shield}
                        title="Force Poor Sleep"
                        onPress={() => simulateData('poor_sleep')}
                    />
                    <View style={styles.divider} />
                    <SettingRow
                        icon={Activity}
                        title="Force High Stress"
                        onPress={() => simulateData('high_stress')}
                    />
                    <View style={styles.divider} />
                    <SettingRow
                        icon={Smartphone}
                        title="Force Perfect Day"
                        onPress={() => simulateData('perfect_day')}
                    />
                    <View style={styles.divider} />
                    <SettingRow
                        icon={LogOut}
                        title="Reset Data"
                        onPress={() => simulateData('default')}
                    />
                </GlassCard>

                {/* Logout Action */}
                <TouchableOpacity style={[styles.logoutButton, isRTL && { flexDirection: 'row-reverse' }]} onPress={handleLogout}>
                    <LogOut size={20} color={COLORS.danger} style={isRTL ? { marginLeft: 8 } : { marginRight: 8 }} />
                    <Text style={styles.logoutText}>{t('logout')}</Text>
                </TouchableOpacity>

            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: SPACING.l,
        paddingBottom: 100,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        // marginBottom handled in inline style for header
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
        marginBottom: SPACING.xl,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.m,
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    profileEmail: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        marginBottom: SPACING.s,
        marginTop: SPACING.s,
        marginLeft: SPACING.s,
        textTransform: 'uppercase',
    },
    settingsGroup: {
        padding: 0,
        overflow: 'hidden',
        marginBottom: SPACING.l,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.m,
        minHeight: 60,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.m,
    },
    rowTitle: {
        fontSize: 16,
        color: COLORS.textPrimary,
    },
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowValue: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginRight: 8,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(23, 23, 23, 0.5)',
        marginLeft: 56,
    },
    logoutButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.m,
        marginTop: SPACING.xl,
        opacity: 0.8,
    },
    logoutText: {
        color: COLORS.danger,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
