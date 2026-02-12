import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Modal, Animated, Pressable, Dimensions, Easing, ActivityIndicator } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GlassCard } from '../../components/GlassCard';
import { LoadingRing } from '../../components/LoadingRing';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { LanguageToggle } from '../../components/LanguageToggle';
// @ts-ignore
import { User, Bell, Smartphone, Shield, LogOut, ChevronRight, Activity, Calendar, Ruler, Weight, Bluetooth, Signal, RefreshCw, X, CheckCircle, FileText } from 'lucide-react-native';
import { Device } from 'react-native-ble-plx';
import { bluetoothService } from '../../services/BluetoothService';

import { HapticFeedback } from '../../utils/haptics';

import { notificationService } from '../../services/NotificationService';
import { useAuth } from '../../contexts/AuthContext';
import { convertHeight, convertWeight } from '../../utils/units';
import { biometricService } from '../../services/BiometricService';
import { useTheme } from '../../contexts/ThemeContext';
import { Moon, Sun, Monitor } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

export const ProfileScreen = ({ navigation }: any) => {
    const { isConnected, disconnectRing, data, toggleUnitSystem, toggleNotifications: setGlobalNotifications, updateRingData, toggleAppleHealth } = useData();
    const { t, isRTL } = useLanguage();
    const { logout, user } = useAuth();
    const { theme, setTheme, isDark, colors } = useTheme();
    const [themeModalVisible, setThemeModalVisible] = useState(false);
    const [connectRingModalVisible, setConnectRingModalVisible] = useState(false);
    const [ringInfoModalVisible, setRingInfoModalVisible] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Bluetooth Scanning State
    const [scannedDevices, setScannedDevices] = useState<Device[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [connectingId, setConnectingId] = useState<string | null>(null);

    // Animation Values for Connect Ring Modal
    const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const styles = React.useMemo(() => createStyles(colors, isDark), [colors, isDark]);

    // Wait for initial data to be ready before showing content
    useEffect(() => {
        if (data) {
            const timer = setTimeout(() => setIsMounted(true), 100);
            return () => clearTimeout(timer);
        }
    }, [data]);

    const openConnectRingModal = () => {
        setConnectRingModalVisible(true);
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                speed: 12,
                bounciness: 4,
                useNativeDriver: true,
            }),
        ]).start();

        // Only scan if not already connected
        if (!isConnected) {
            startScan();
        }
    };

    const closeConnectRingModal = () => {
        // Stop scanning
        stopScan();
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: Dimensions.get('window').height,
                duration: 250,
                useNativeDriver: true,
                easing: Easing.in(Easing.cubic),
            }),
        ]).start(() => setConnectRingModalVisible(false));
    };

    const startScan = async () => {
        const hasPermissions = await bluetoothService.requestPermissions();
        if (!hasPermissions) {
            Alert.alert('Permission Error', 'Bluetooth permissions are required to scan.');
            return;
        }

        setScannedDevices([]);
        setIsScanning(true);

        // Check for already connected devices first
        bluetoothService.getConnectedDevices().then(devices => {
            if (devices && devices.length > 0) {
                setScannedDevices(prev => {
                    let next = [...prev];
                    devices.forEach(d => {
                        if (!next.find(existing => existing.id === d.id)) {
                            next.push(d);
                        }
                    });
                    return next;
                });
            }
        });

        bluetoothService.scanForDevices((device) => {
            setScannedDevices(prev => {
                if (prev.find(d => d.id === device.id)) return prev;
                // Log all found devices for debugging discovery
                console.log(`[BLE] Found: ${device.name || 'Unknown'} (${device.id})`);

                if (!device.name && !device.localName) return prev;

                const deviceName = (device.name || device.localName || '').toLowerCase();
                // Relaxed filter: Look for common ring prefixes or keywords
                const isLikelyRing = deviceName.includes('shr') ||
                    deviceName.includes('ring') ||
                    deviceName.includes('r02') ||
                    deviceName.includes('colmi') ||
                    deviceName.includes('smart');

                if (!isLikelyRing) return prev;

                return [...prev, device].sort((a, b) => (b.rssi || -100) - (a.rssi || -100));
            });
        });

        // Stop scanning after 10 seconds automatically
        setTimeout(() => {
            stopScan();
        }, 10000);
    };

    const stopScan = () => {
        bluetoothService.stopScan();
        setIsScanning(false);
    };

    const handleDisconnect = async () => {
        Alert.alert(
            t('disconnectRing'),
            t('disconnectConfirm'),
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('disconnect'),
                    style: 'destructive',
                    onPress: async () => {
                        await disconnectRing();
                        closeConnectRingModal();
                        HapticFeedback.success();
                    }
                }
            ]
        );
    };

    const handleConnect = async (device: Device) => {
        setConnectingId(device.id);
        stopScan();

        try {
            await bluetoothService.connectToDevice(device.id);
            await updateRingData({});
            HapticFeedback.success();

            // Clear connecting state
            setConnectingId(null);

            // Auto close after 2 seconds showing the checkmark
            setTimeout(() => {
                closeConnectRingModal();
            }, 2000);
        } catch (error: any) {
            console.error('[ProfileScreen] Connection failed:', error);
            const errorMessage = error.message || 'The device might be out of range or already connected.';
            Alert.alert('Connection Failed', errorMessage);
            setConnectingId(null);
        }
    };

    const handleToggleNotifications = async (value: boolean) => {
        HapticFeedback.light();
        if (value) {
            const token = await notificationService.registerForPushNotificationsAsync();
            if (token) {
                await setGlobalNotifications(true);
                // Schedule default reminders
                await notificationService.scheduleMorningReadiness(data?.readiness.score || 85);
            } else {
                Alert.alert(t('error'), "Notification permissions are required. Please enable them in your device settings.");
                await setGlobalNotifications(false);
            }
        } else {
            await notificationService.cancelAllNotifications();
            await setGlobalNotifications(false);
        }
    };

    const [biometricsEnabled, setBiometricsEnabled] = useState(false);

    // Check initial state (mock for now, or check SecureStore asynchronously)
    React.useEffect(() => {
        biometricService.getCredentials().then(creds => {
            setBiometricsEnabled(!!creds);
        });
    }, []);

    const toggleBiometrics = async (value: boolean) => {
        HapticFeedback.light();
        if (value) {
            // Check hardware first
            const available = await biometricService.checkAvailability();
            if (!available) {
                Alert.alert(t('error'), 'Biometrics not supported or not enrolled on this device.');
                return;
            }

            // For MVP: We need the password to save it. 
            // In a real app we'd show a modal to input password.
            // Here, we'll assume we can't enable it without re-entry, 
            // so we show an alert instruction.
            Alert.prompt(
                t('enableBiometrics'),
                "Please enter your password to enable Face ID login.",
                [
                    { text: t('cancel'), style: 'cancel' },
                    {
                        text: t('confirm') || 'Enable',
                        onPress: async (password) => {
                            if (user && user.email && password) {
                                const success = await biometricService.saveCredentials(user.email, password);
                                if (success) {
                                    setBiometricsEnabled(true);
                                    Alert.alert(t('success'), 'Biometric login enabled.');
                                } else {
                                    Alert.alert(t('error'), 'Failed to save credentials.');
                                }
                            }
                        }
                    }
                ],
                'secure-text'
            );
        } else {
            setBiometricsEnabled(false);
            await biometricService.clearCredentials();
        }
    };

    const sendTestNotification = async () => {
        HapticFeedback.success();
        await notificationService.scheduleHealthReminder(
            t('testNotifTitle'),
            t('testNotifBody'),
            new Date().getHours(),
            new Date().getMinutes() + 1
        );
        Alert.alert(t('success') || "Success", t('testNotifSuccess'));
    };

    const handleLogout = () => {
        Alert.alert(t('logoutConfirmTitle'), t('logoutConfirmMessage'), [
            { text: t('cancel'), style: "cancel" },
            { text: t('confirm'), style: "destructive", onPress: logout }
        ]);
    };

    const handleThemeChange = () => {
        setThemeModalVisible(true);
        HapticFeedback.light();
    };

    const getThemeIcon = () => {
        if (theme === 'light') return Sun;
        if (theme === 'dark') return Moon;
        return Monitor;
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
                    <Icon size={20} color={colors.primary} />
                </View>
                <Text style={styles.rowTitle}>{title}</Text>
            </View>

            {isToggle ? (
                <Switch
                    value={toggleValue}
                    onValueChange={onToggle}
                    trackColor={{ false: isDark ? '#3e3e3e' : '#e4e4e7', true: colors.primary }}
                    thumbColor={'#fff'}
                    ios_backgroundColor={isDark ? "#3e3e3e" : "#e4e4e7"}
                />
            ) : (
                <View style={[styles.rowRight, isRTL && { flexDirection: 'row-reverse' }]}>
                    {value && <Text style={[styles.rowValue, isRTL && { marginLeft: 8, marginRight: 0 }]}>{value}</Text>}
                    {showChevron && <ChevronRight size={16} color={colors.textSecondary} style={isRTL && { transform: [{ rotate: '180deg' }] }} />}
                </View>
            )}
        </TouchableOpacity>
    );

    const ThemeOption = ({ type, label, icon: Icon }: { type: any, label: string, icon: any }) => {
        const isSelected = theme === type;
        const activeColor = isDark ? '#000' : '#FFF';

        return (
            <TouchableOpacity
                style={[
                    styles.themeOption,
                    isSelected && styles.themeOptionSelected,
                    isRTL && { flexDirection: 'row-reverse' }
                ]}
                onPress={() => {
                    HapticFeedback.selection();
                    setTheme(type);
                    setThemeModalVisible(false);
                }}
            >
                <View style={[styles.themeOptionLeft, isRTL && { flexDirection: 'row-reverse' }]}>
                    <View style={[styles.themeIconContainer, isSelected && { backgroundColor: 'rgba(0,0,0,0.1)' }]}>
                        <Icon size={20} color={isSelected ? activeColor : colors.textPrimary} />
                    </View>
                    <Text style={[
                        styles.themeOptionLabel,
                        isSelected && { color: activeColor, fontWeight: 'bold' }
                    ]}>
                        {label}
                    </Text>
                </View>
                {isSelected && (
                    <View style={[styles.themeCheck, { borderColor: 'rgba(0,0,0,0.2)' }]}>
                        <View style={[styles.themeCheckInner, { backgroundColor: activeColor }]} />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    // Show loading state until mounted
    if (!isMounted || !data) {
        return (
            <ScreenWrapper>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <LoadingRing size={60} />
                </View>
            </ScreenWrapper>
        );
    }

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
                        <User size={30} color={colors.background} />
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
                                onPress={() => navigation.navigate('EditProfile')}
                                style={{ padding: 4, marginRight: isRTL ? 0 : SPACING.s, marginLeft: isRTL ? SPACING.s : 0 }}
                            >
                                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{t('edit') || 'Edit'}</Text>
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
                                value={convertHeight(data.userProfile.height, data.unitSystem || 'metric')}
                                showChevron={false}
                            />
                            <View style={styles.divider} />
                            <SettingRow
                                icon={Weight}
                                title={t('weight')}
                                value={convertWeight(data.userProfile.weight, data.unitSystem || 'metric')}
                                showChevron={false}
                            />
                            <View style={styles.divider} />
                            <SettingRow
                                icon={Activity}
                                title={t('history') || 'History'} // Fallback if translation missing
                                value=""
                                onPress={() => navigation.navigate('History')}
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
                        toggleValue={!!data?.notificationsEnabled}
                        onToggle={handleToggleNotifications}
                    />
                    <View style={styles.divider} />
                    <SettingRow
                        icon={Activity}
                        title={t('units')}
                        value={data?.unitSystem === 'metric' ? t('metric') : t('imperial')}
                        onPress={toggleUnitSystem}
                    />
                    <View style={styles.divider} />
                    <SettingRow
                        icon={Shield}
                        title={t('biometrics')}
                        isToggle
                        toggleValue={biometricsEnabled}
                        onToggle={toggleBiometrics}
                    />
                    <View style={styles.divider} />
                    <SettingRow
                        icon={getThemeIcon()}
                        title={t('theme')}
                        value={t(theme)}
                        onPress={handleThemeChange}
                    />
                </GlassCard>


                {/* Settings Section: Device */}
                <Text style={[styles.sectionHeader, isRTL && { textAlign: 'right', marginRight: SPACING.s, marginLeft: 0 }]}>{t('device')}</Text>
                <GlassCard style={styles.settingsGroup}>
                    <SettingRow
                        icon={Bluetooth}
                        title={t('connectRing')}
                        value={isConnected ? t('connected') : t('disconnected')}
                        showChevron
                        onPress={openConnectRingModal}
                    />
                    <View style={styles.divider} />
                    <SettingRow
                        icon={Shield}
                        title={t('firmware')}
                        value="v2.1.0"
                        onPress={() => setRingInfoModalVisible(true)}
                    />
                    <View style={styles.divider} />
                    <SettingRow
                        icon={Activity}
                        title={t('appleHealth')}
                        isToggle
                        toggleValue={!!data?.appleHealthEnabled}
                        onToggle={toggleAppleHealth}
                    />
                </GlassCard>

                {/* Settings Section: Legal */}
                <Text style={[styles.sectionHeader, isRTL && { textAlign: 'right', marginRight: SPACING.s, marginLeft: 0 }]}>{t('legal') || 'Legal'}</Text>
                <GlassCard style={styles.settingsGroup}>
                    <SettingRow
                        icon={FileText}
                        title={t('termsOfUse') || 'Terms of Use'}
                        onPress={() => navigation.navigate('Terms')}
                        showChevron
                    />
                    <View style={styles.divider} />
                    <SettingRow
                        icon={Shield}
                        title={t('privacyPolicy') || 'Privacy Policy'}
                        onPress={() => navigation.navigate('PrivacyPolicy')}
                        showChevron
                    />
                </GlassCard>

                {/* Developer Tools (Simulation) */}
                <Text style={[styles.sectionHeader, isRTL && { textAlign: 'right', marginRight: SPACING.s, marginLeft: 0 }]}>{t('devTools')}</Text>
                <GlassCard style={styles.settingsGroup}>
                    <SettingRow
                        icon={Shield}
                        title={t('resetData')}
                        onPress={() => Alert.alert(t('resetData'), t('comingSoon'))}
                    />
                </GlassCard>

                {/* Logout Action */}
                <TouchableOpacity style={[styles.logoutButton, isRTL && { flexDirection: 'row-reverse' }]} onPress={handleLogout}>
                    <LogOut size={20} color={colors.danger} style={isRTL ? { marginLeft: 8 } : { marginRight: 8 }} />
                    <Text style={styles.logoutText}>{t('logout')}</Text>
                </TouchableOpacity>

                {/* Theme Selection Modal */}
                <Modal
                    visible={themeModalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setThemeModalVisible(false)}
                >
                    <Pressable
                        style={styles.modalOverlay}
                        onPress={() => setThemeModalVisible(false)}
                    >
                        <Animated.View style={styles.themeModalContent}>
                            <BlurView
                                intensity={isDark ? 80 : 100}
                                tint={isDark ? "dark" : "light"}
                                style={styles.blurContainer}
                            >
                                <View style={styles.modalInner}>
                                    <View style={[styles.modalHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                                        <Text style={styles.modalTitle}>{t('theme')}</Text>
                                        <TouchableOpacity onPress={() => setThemeModalVisible(false)}>
                                            <X size={24} color={colors.textSecondary} />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.themeOptionsContainer}>
                                        <ThemeOption type="light" label={t('light')} icon={Sun} />
                                        <ThemeOption type="dark" label={t('dark')} icon={Moon} />
                                        <ThemeOption type="system" label={t('system')} icon={Monitor} />
                                    </View>
                                </View>
                            </BlurView>
                        </Animated.View>
                    </Pressable>
                </Modal>

                {/* Ring Info Modal (Same style as Add Goal) */}
                <Modal
                    visible={ringInfoModalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setRingInfoModalVisible(false)}
                >
                    <Pressable
                        style={styles.modalOverlay}
                        onPress={() => setRingInfoModalVisible(false)}
                    >
                        <View style={styles.themeModalContent}>
                            <BlurView
                                intensity={isDark ? 80 : 100}
                                tint={isDark ? "dark" : "light"}
                                style={styles.blurContainer}
                            >
                                <View style={styles.modalInner}>
                                    <View style={[styles.modalHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                                        <Text style={styles.modalTitle}>{t('ringInfo')}</Text>
                                        <TouchableOpacity onPress={() => setRingInfoModalVisible(false)}>
                                            <X size={24} color={colors.textSecondary} />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.infoList}>
                                        <View style={styles.infoRow}>
                                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{t('status')}</Text>
                                            <Text style={[styles.infoValue, { color: isConnected ? colors.success : colors.danger }]}>
                                                {isConnected ? t('connected') : t('notConnected')}
                                            </Text>
                                        </View>
                                        <View style={styles.divider} />
                                        <View style={styles.infoRow}>
                                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{t('battery')}</Text>
                                            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                                                {isConnected ? '85%' : '--'}
                                            </Text>
                                        </View>
                                        <View style={styles.divider} />
                                        <View style={styles.infoRow}>
                                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{t('protocol')}</Text>
                                            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>BLE GATT 5.0</Text>
                                        </View>
                                        <View style={styles.divider} />
                                        <View style={styles.infoRow}>
                                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{t('hardwareRev')}</Text>
                                            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>REV_3.2</Text>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.closeModalButton, { backgroundColor: colors.primary }]}
                                        onPress={() => setRingInfoModalVisible(false)}
                                    >
                                        <Text style={styles.closeModalButtonText}>{t('close')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </BlurView>
                        </View>
                    </Pressable>
                </Modal>

            </ScrollView>

            {/* Connect Ring Modal */}
            <Modal
                visible={connectRingModalVisible}
                transparent
                animationType="none"
                onRequestClose={closeConnectRingModal}
            >
                <Pressable style={styles.modalOverlay} onPress={closeConnectRingModal}>
                    <Animated.View style={[styles.modalOverlayBg, { opacity: fadeAnim }]} />
                </Pressable>

                <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
                    <BlurView intensity={isDark ? 80 : 60} tint={isDark ? 'dark' : 'light'} style={styles.modalBlur}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t('connectRing')}</Text>
                            <TouchableOpacity onPress={closeConnectRingModal} style={styles.closeButton}>
                                <X size={24} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            {isConnected ? (
                                <View style={styles.successContainer}>
                                    <View style={styles.checkIconWrapper}>
                                        <CheckCircle size={80} color={colors.success} />
                                    </View>
                                    <Text style={[styles.successText, { color: colors.textPrimary }]}>
                                        {t('connectionSuccessful')}
                                    </Text>
                                    <Text style={[styles.deviceConnectedText, { color: colors.textSecondary }]}>
                                        F.O.R RING (Connected)
                                    </Text>

                                    <TouchableOpacity
                                        style={[styles.disconnectButton, { borderColor: colors.danger }]}
                                        onPress={handleDisconnect}
                                    >
                                        <Text style={[styles.disconnectButtonText, { color: colors.danger }]}>
                                            {t('disconnect')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ) : isScanning && scannedDevices.length === 0 ? (
                                <View style={styles.scanningContainer}>
                                    <ActivityIndicator size="large" color={colors.primary} />
                                    <Text style={[styles.scanningText, { color: colors.textSecondary }]}>
                                        {t('scanning')}
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.deviceListContainer}>
                                    {scannedDevices.map(device => (
                                        <TouchableOpacity
                                            key={device.id}
                                            style={[styles.deviceItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderColor: colors.divider }]}
                                            onPress={() => handleConnect(device)}
                                            disabled={!!connectingId}
                                        >
                                            <View style={styles.deviceRow}>
                                                <View style={styles.deviceInfo}>
                                                    <Bluetooth size={20} color={colors.primary} />
                                                    <Text style={[styles.deviceName, { color: colors.textPrimary }]}>F.O.R RING</Text>
                                                </View>
                                                <View style={styles.deviceStatus}>
                                                    {connectingId === device.id ? (
                                                        <ActivityIndicator size="small" color={colors.primary} />
                                                    ) : (
                                                        <View style={styles.signalRow}>
                                                            <Signal size={14} color={colors.textSecondary} />
                                                            <Text style={[styles.rssiText, { color: colors.textSecondary }]}>{device.rssi} dBm</Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    ))}

                                    {!isScanning && scannedDevices.length === 0 && (
                                        <TouchableOpacity style={styles.rescanButton} onPress={startScan}>
                                            <RefreshCw size={20} color={colors.primary} />
                                            <Text style={[styles.rescanText, { color: colors.primary }]}>{t('scanAgain')}</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </View>
                    </BlurView>
                </Animated.View>
            </Modal>

        </ScreenWrapper>
    );
};

// Add X icon
// (Already added to top imports)

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    container: {
        padding: SPACING.l,
        paddingBottom: 100,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.textPrimary,
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
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.m,
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    profileEmail: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.textSecondary,
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
        backgroundColor: colors.cardBackground,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.m,
    },
    rowTitle: {
        fontSize: 16,
        color: colors.textPrimary,
    },
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowValue: {
        fontSize: 14,
        color: colors.textSecondary,
        marginRight: 8,
    },
    divider: {
        height: 1,
        backgroundColor: colors.divider,
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
        color: colors.danger,
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    themeModalContent: {
        backgroundColor: isDark ? 'rgba(30, 34, 38, 0.7)' : 'rgba(255, 255, 255, 0.7)',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
        borderTopWidth: 1,
        borderTopColor: colors.divider,
    },
    blurContainer: {
        padding: SPACING.l,
        paddingBottom: 40,
    },
    modalInner: {
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    themeOptionsContainer: {
        gap: SPACING.m,
    },
    themeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.m,
        borderRadius: 16,
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.divider,
    },
    themeOptionSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    themeOptionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    themeIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.m,
    },
    themeOptionLabel: {
        fontSize: 16,
        color: colors.textPrimary,
    },
    themeCheck: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    themeCheckInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    // Connect Ring Modal Styles
    modalOverlayBg: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    modalBlur: {
        padding: SPACING.xl,
        paddingBottom: 40,
    },
    modalBody: {
        gap: SPACING.l,
    },
    closeButton: {
        padding: SPACING.xs,
    },
    connectionHint: {
        fontSize: 14,
        textAlign: 'center',
    },
    // Device Scanner Styles
    scanningContainer: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
        gap: SPACING.m,
    },
    scanningText: {
        fontSize: 16,
        fontWeight: '500',
    },
    deviceListContainer: {
        gap: SPACING.m,
        maxHeight: 300,
    },
    deviceItem: {
        padding: SPACING.m,
        borderRadius: 12,
        borderWidth: 1,
    },
    deviceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    deviceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.s,
    },
    deviceName: {
        fontSize: 16,
        fontWeight: '600',
    },
    deviceStatus: {
        minWidth: 40,
        alignItems: 'flex-end',
    },
    signalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    rssiText: {
        fontSize: 12,
        fontWeight: '500',
    },
    rescanButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.m,
        gap: SPACING.s,
    },
    rescanText: {
        fontSize: 16,
        fontWeight: '600',
    },
    // Success State Styles
    successContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xl,
        gap: SPACING.m,
    },
    checkIconWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.s,
    },
    successText: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    deviceConnectedText: {
        fontSize: 16,
        textAlign: 'center',
        opacity: 0.8,
        marginBottom: SPACING.m,
    },
    disconnectButton: {
        marginTop: SPACING.l,
        paddingVertical: SPACING.s,
        paddingHorizontal: SPACING.xl,
        borderWidth: 1,
        borderRadius: 20,
    },
    disconnectButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    // Info Modal Styles
    infoList: {
        marginTop: SPACING.m,
        marginBottom: SPACING.xl,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: SPACING.m,
    },
    infoLabel: {
        fontSize: 16,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    closeModalButton: {
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeModalButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
