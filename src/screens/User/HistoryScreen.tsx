import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Calendar, ChevronLeft, Clock, Flame, Activity } from 'lucide-react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GlassCard } from '../../components/GlassCard';
import { COLORS, SPACING, FONT_SIZE, LAYOUT } from '../../constants/theme';
import { useData, Workout } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';

export const HistoryScreen = () => {
    const navigation = useNavigation();
    const { colors } = useTheme();
    const { data } = useData();
    const history = data?.history || [];

    const styles = createStyles(colors);

    const renderItem = ({ item }: { item: Workout }) => (
        <GlassCard style={styles.historyCard}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: colors.cardBackground }]}>
                    <Activity size={20} color={colors.primary} />
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.workoutType}>{item.type.toUpperCase()}</Text>
                    <Text style={styles.workoutDate}>{new Date(item.date).toLocaleDateString()}</Text>
                </View>
                <Text style={styles.calories}>{item.calories} kcal</Text>
            </View>
            <View style={styles.cardStats}>
                <View style={styles.statItem}>
                    <Clock size={16} color={colors.textSecondary} />
                    <Text style={styles.statText}>{Math.floor(item.duration / 60)} min {item.duration % 60} sec</Text>
                </View>
                {item.heartRateAvg && (
                    <View style={styles.statItem}>
                        <Activity size={16} color={colors.textSecondary} />
                        <Text style={styles.statText}>{item.heartRateAvg} bpm</Text>
                    </View>
                )}
            </View>
        </GlassCard>
    );

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>History</Text>
                </View>

                {history.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Calendar size={64} color={colors.textSecondary} opacity={0.5} />
                        <Text style={styles.emptyText}>No workouts recorded yet.</Text>
                        <Text style={styles.emptySubText}>Start a workout from the Dashboard!</Text>
                    </View>
                ) : (
                    <FlatList
                        data={history}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </ScreenWrapper>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        padding: SPACING.m,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    backButton: {
        padding: SPACING.s,
        marginRight: SPACING.s,
    },
    title: {
        fontSize: FONT_SIZE.xl,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    listContent: {
        paddingBottom: SPACING.xl,
    },
    historyCard: {
        marginBottom: SPACING.m,
        padding: SPACING.m,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.m,
    },
    headerText: {
        flex: 1,
    },
    workoutType: {
        fontSize: FONT_SIZE.m,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    workoutDate: {
        fontSize: FONT_SIZE.s,
        color: colors.textSecondary,
    },
    calories: {
        fontSize: FONT_SIZE.m,
        fontWeight: 'bold',
        color: colors.primary,
    },
    cardStats: {
        flexDirection: 'row',
        gap: SPACING.l,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    statText: {
        color: colors.textSecondary,
        fontSize: FONT_SIZE.s,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: SPACING.xl * 2,
    },
    emptyText: {
        fontSize: FONT_SIZE.l,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginTop: SPACING.m,
    },
    emptySubText: {
        color: colors.textSecondary,
        marginTop: SPACING.s,
    },
});
