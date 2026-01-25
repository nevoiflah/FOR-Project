import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GlassCard } from '../../components/GlassCard';
import { COLORS, SPACING, FONTS, LAYOUT } from '../../constants/theme';
import { useData, Goal } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
// @ts-ignore
import { Target, Flag, Edit2, CheckCircle, Plus, X, Trash2 } from 'lucide-react-native';
import { HapticFeedback } from '../../utils/haptics';

export const GoalsScreen = () => {
    const { data, addGoal, removeGoal, updateGoal } = useData();
    const { t, isRTL } = useLanguage();
    const { colors, isDark } = useTheme();

    const styles = React.useMemo(() => createStyles(colors, isDark), [colors, isDark]);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newTarget, setNewTarget] = useState('');
    const [newUnit, setNewUnit] = useState('');

    const handleAddGoal = async () => {
        if (!newTitle || !newTarget || !newUnit) {
            Alert.alert(t('missingFields'), t('missingFieldsMsg'));
            return;
        }

        HapticFeedback.success();
        await addGoal({
            title: newTitle,
            target: parseInt(newTarget) || 10,
            current: 0,
            unit: newUnit,
            color: colors.primary, // Could allow color selection later
            type: 'numeric'
        });

        // Reset and close
        setNewTitle('');
        setNewTarget('');
        setNewUnit('');
        setModalVisible(false);
    };

    const handleDelete = (id: string) => {
        HapticFeedback.warning();
        Alert.alert(t('delete'), "Are you sure you want to delete this goal?", [
            { text: t('cancel'), style: "cancel" },
            { text: t('delete'), style: "destructive", onPress: () => removeGoal(id) }
        ]);
    };

    const handleIncrement = (id: string, current: number, target: number) => {
        HapticFeedback.selection();
        // Increment by roughly 10% or 1 unit
        const step = Math.max(1, Math.round(target / 10));
        updateGoal(id, Math.min(current + step, target));
    };

    const GoalItem = ({ item }: { item: Goal }) => {
        const progress = Math.min(item.current / item.target, 1);
        const isComplete = progress >= 1;

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleIncrement(item.id, item.current, item.target)}
                onLongPress={() => handleDelete(item.id)}
            >
                <GlassCard style={styles.goalItem} contentContainerStyle={{ padding: SPACING.l }}>
                    <View style={[styles.goalHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                        <Text style={styles.goalTitle}>{item.title}</Text>
                        {isComplete ? (
                            <CheckCircle size={20} color={colors.success} />
                        ) : (
                            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{t('tapToUpdate')}</Text>
                        )}
                    </View>

                    <View style={[styles.progressBackground, { borderColor: item.color + '33' }]}>
                        <View style={[styles.progressBar, { width: `${progress * 100}%`, backgroundColor: item.color }]} />
                    </View>

                    <View style={[styles.goalFooter, isRTL && { flexDirection: 'row-reverse' }]}>
                        <Text style={styles.goalProgress}>
                            <Text style={{ color: item.color, fontWeight: 'bold' }}>{item.current}</Text> / {item.target} {item.unit}
                        </Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{Math.round(progress * 100)}%</Text>
                    </View>
                </GlassCard>
            </TouchableOpacity>
        );
    };

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <Text style={[styles.pageTitle, isRTL && { textAlign: 'right' }]}>{t('dailyGoals') || 'Daily Goals'}</Text>

                {data ? (
                    <>
                        {(data.goals || []).map((goal) => (
                            <GoalItem key={goal.id} item={goal} />
                        ))}

                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => {
                                HapticFeedback.light();
                                setModalVisible(true)
                            }}
                        >
                            <Plus size={20} color={colors.background} />
                            <Text style={styles.addButtonText}>{t('addNewGoal') || 'Add New Goal'}</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>{t('connectToSee') || 'Sync your data to manage goals'}</Text>
                    </View>
                )}

                {/* Add Goal Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.modalOverlay}
                    >
                        <View style={styles.modalContent}>
                            <View style={[styles.modalHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                                <Text style={styles.modalTitle}>{t('newGoalTitle')}</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <X size={24} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>{t('goalLabelTitle')}</Text>
                                <TextInput
                                    style={[styles.input, isRTL && { textAlign: 'right' }]}
                                    placeholder={t('goalTitlePlaceholder')}
                                    placeholderTextColor="#666"
                                    value={newTitle}
                                    onChangeText={setNewTitle}
                                />
                            </View>

                            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between' }}>
                                <View style={[styles.inputGroup, { width: '48%' }]}>
                                    <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>{t('goalLabelTarget')}</Text>
                                    <TextInput
                                        style={[styles.input, isRTL && { textAlign: 'right' }]}
                                        placeholder={t('goalTargetPlaceholder')}
                                        placeholderTextColor="#666"
                                        keyboardType="numeric"
                                        value={newTarget}
                                        onChangeText={setNewTarget}
                                    />
                                </View>
                                <View style={[styles.inputGroup, { width: '48%' }]}>
                                    <Text style={[styles.label, isRTL && { textAlign: 'right' }]}>{t('goalLabelUnit')}</Text>
                                    <TextInput
                                        style={[styles.input, isRTL && { textAlign: 'right' }]}
                                        placeholder={t('goalUnitPlaceholder')}
                                        placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
                                        value={newUnit}
                                        onChangeText={setNewUnit}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity style={styles.createButton} onPress={handleAddGoal}>
                                <Text style={styles.createButtonText}>{t('createGoalBtn')}</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>

            </ScrollView>
        </ScreenWrapper>
    );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    container: {
        padding: SPACING.l,
        paddingBottom: 100,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: SPACING.l,
    },
    goalItem: {
        marginBottom: SPACING.m,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    goalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    progressBackground: {
        height: 12,
        backgroundColor: colors.cardBackground,
        borderRadius: 6,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.divider,
        marginBottom: SPACING.s,
    },
    progressBar: {
        height: '100%',
        borderRadius: 6,
    },
    goalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    goalProgress: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    addButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.m,
        borderRadius: LAYOUT.borderRadius,
        marginTop: SPACING.l,
        marginBottom: SPACING.xl,
    },
    addButtonText: {
        color: colors.background,
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        color: colors.textSecondary,
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: SPACING.l,
        paddingBottom: 40,
        borderTopWidth: 1,
        borderTopColor: colors.divider,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    inputGroup: {
        marginBottom: SPACING.m,
    },
    label: {
        color: colors.textSecondary,
        marginBottom: 8,
        fontSize: 14,
        textTransform: 'uppercase',
    },
    input: {
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        padding: 16,
        color: colors.textPrimary,
        fontSize: 16,
        borderWidth: 1,
        borderColor: colors.divider,
    },
    createButton: {
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: SPACING.m,
    },
    createButtonText: {
        color: colors.background,
        fontWeight: 'bold',
        fontSize: 16,
    }
});
