import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, MapPin } from 'lucide-react-native';
import { getGpsActivities, getNonGpsActivities } from '../constants/activities';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { GlassCard } from './GlassCard';
import { COLORS, SPACING, FONTS } from '../constants/theme';

interface ActivitySelectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectActivity: (activity: any) => void;
}

export const ActivitySelectionModal: React.FC<ActivitySelectionModalProps> = ({ visible, onClose, onSelectActivity }) => {
    const { colors, isDark } = useTheme();
    const { t, isRTL } = useLanguage();
    const screenHeight = Dimensions.get('window').height;

    const gpsActivities = getGpsActivities();
    const indoorActivities = getNonGpsActivities();

    const renderActivityItem = (item: any) => {
        const Icon = item.icon;
        return (
            <TouchableOpacity
                key={item.id}
                style={[styles.activityItem, {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.3)',
                    borderBottomWidth: 1,
                    borderBottomColor: colors.divider
                }]}
                onPress={() => {
                    onClose();
                    onSelectActivity(item);
                }}
            >
                <View style={styles.activityContent}>
                    <View style={[styles.iconContainer, { backgroundColor: item.gps ? 'rgba(59, 130, 246, 0.2)' : 'rgba(168, 85, 247, 0.2)' }]}>
                        <Icon size={24} color={item.gps ? '#3b82f6' : '#a855f7'} />
                    </View>
                    <Text style={[styles.activityLabel, { color: colors.textPrimary }]}>{t(item.id) || item.label}</Text>
                    {item.gps && <MapPin size={16} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <BlurView intensity={isDark ? 80 : 40} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
                <View style={[styles.container, { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)', height: screenHeight * 0.85 }]}>

                    {/* Header */}
                    <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>{t('selectActivity') || 'Select Activity'}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                        {/* GPS Section */}
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary }, isRTL && { textAlign: 'right' }]}>
                            {t('outdoorGPS') || 'Outdoor (GPS Enabled)'}
                        </Text>
                        <View style={styles.grid}>
                            {gpsActivities.map(renderActivityItem)}
                        </View>

                        {/* Indoor Section */}
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: SPACING.l }, isRTL && { textAlign: 'right' }]}>
                            {t('indoorNoGPS') || 'Indoor (Non-GPS)'}
                        </Text>
                        <View style={styles.grid}>
                            {indoorActivities.map(renderActivityItem)}
                        </View>

                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    container: {
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: SPACING.l,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 8,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: FONTS.subHeaderSize,
        fontWeight: 'bold',
        marginBottom: SPACING.m,
        color: COLORS.primary,
    },
    grid: {
        gap: SPACING.m,
    },
    activityItem: {
        marginBottom: SPACING.s,
    },
    activityCard: {
        padding: SPACING.m,
        borderRadius: 16,
    },
    activityContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.m,
    },
    activityLabel: {
        fontSize: FONTS.bodySize,
        textAlign: 'center',
    },
});
