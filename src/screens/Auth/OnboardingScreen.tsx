import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, useWindowDimensions } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GlassCard } from '../../components/GlassCard';
import { COLORS, SPACING, FONTS } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { useData } from '../../contexts/DataContext';
// @ts-ignore
import { Heart, Shield, Hand } from 'lucide-react-native';

import { TranslationKey } from '../../i18n/translations';

interface SlideData {
    id: number;
    titleKey: TranslationKey;
    textKey: TranslationKey;
    icon: any;
}

const SLIDE_DATA: SlideData[] = [
    {
        id: 1,
        titleKey: 'welcomeTitle',
        textKey: 'welcomeText',
        icon: Heart
    },
    {
        id: 2,
        titleKey: 'privacyTitle',
        textKey: 'privacyText',
        icon: Shield
    },
    {
        id: 3,
        titleKey: 'wearTitle',
        textKey: 'wearText',
        icon: Hand
    }
];

export const OnboardingScreen = ({ navigation }: any) => {
    const { width } = useWindowDimensions();
    const { colors, isDark } = useTheme();
    const { t } = useLanguage();
    const { refreshData } = useData();
    const styles = React.useMemo(() => createStyles(colors, isDark, width), [colors, isDark, width]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const handleNext = async () => {
        if (currentIndex < SLIDE_DATA.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            await handleFinish();
        }
    };

    const handleFinish = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, { onboardingCompleted: true });
                await refreshData();
            }
            navigation.replace('MainBase');
        } catch (error) {
            console.error("Error finishing onboarding:", error);
            navigation.replace('MainBase');
        }
    };

    const updateIndex = (e: any) => {
        const contentOffsetX = e.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffsetX / width);
        setCurrentIndex(index);
    };

    const renderItem = ({ item }: { item: typeof SLIDE_DATA[0] }) => {
        const Icon = item.icon;
        return (
            <View style={styles.slide}>
                <GlassCard style={styles.card} contentContainerStyle={styles.cardContent}>
                    <View style={styles.iconContainer}>
                        {/* Centered Icon with good size */}
                        <Icon size={72} color={colors.primary} />
                    </View>
                    <Text style={styles.title}>{t(item.titleKey)}</Text>
                    <Text style={styles.text}>{t(item.textKey)}</Text>
                </GlassCard>
            </View>
        );
    };

    return (
        <ScreenWrapper bgVariant="auth">
            <FlatList
                ref={flatListRef}
                data={SLIDE_DATA}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={updateIndex}
                style={{ flex: 1 }}
                keyExtractor={(item) => item.id.toString()}
            />

            <View style={styles.footer}>
                {/* Pagination Dots */}
                <View style={styles.pagination}>
                    {SLIDE_DATA.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                currentIndex === index && styles.dotActive
                            ]}
                        />
                    ))}
                </View>

                {/* Button - Text Only as requested */}
                <TouchableOpacity style={styles.button} onPress={handleNext}>
                    <Text style={styles.buttonText}>
                        {currentIndex === SLIDE_DATA.length - 1 ? t('getStarted') : t('next')}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScreenWrapper>
    );
};

const createStyles = (colors: any, isDark: boolean, width: number) => StyleSheet.create({
    slide: {
        width: width,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
    },
    card: {
        width: '100%',
        overflow: 'hidden',
        minHeight: 400, // Significantly increased for visibility
        justifyContent: 'center',
    },
    cardContent: {
        paddingVertical: 60, // increased padding
        paddingHorizontal: SPACING.l,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 140, // Enlarged
        height: 140, // Enlarged
        borderRadius: 70,
        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: 32, // Larger title
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: SPACING.m,
        textAlign: 'center',
    },
    text: {
        fontSize: 18, // Larger text
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 28,
        paddingHorizontal: SPACING.m,
    },
    footer: {
        height: 140,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 30,
        paddingHorizontal: SPACING.xl,
    },
    pagination: {
        flexDirection: 'row',
        height: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.divider,
        marginHorizontal: 4,
    },
    dotActive: {
        backgroundColor: colors.primary,
        width: 24,
    },
    button: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 48,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 160,
        elevation: 4,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    buttonText: {
        color: colors.background,
        fontSize: 18, // Slightly larger text
        fontWeight: 'bold',
    },
});
