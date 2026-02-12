import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';

// Icons
import { Home, Moon, Heart, TrendingUp, User, Settings, ArrowRight } from 'lucide-react-native';

// Screens
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { RegisterScreen } from '../screens/Auth/RegisterScreen';
import { OnboardingScreen } from '../screens/Auth/OnboardingScreen';
import { DashboardScreen } from '../screens/Main/DashboardScreen';
import { SleepScreen } from '../screens/Main/SleepScreen';
import { HeartScreen } from '../screens/Main/HeartScreen';
import { TrendsScreen } from '../screens/Main/TrendsScreen';
import { ProfileScreen } from '../screens/User/ProfileScreen';
import { EditProfileScreen } from '../screens/User/EditProfileScreen';
import { WorkoutScreen } from '../screens/Main/WorkoutScreen';
import { MindfulnessScreen } from '../screens/Main/MindfulnessScreen';
import { HistoryScreen } from '../screens/User/HistoryScreen';
import { PrivacyPolicyScreen } from '../screens/Legal/PrivacyPolicyScreen';
import { TermsScreen } from '../screens/Legal/TermsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabs = () => {
    const { colors, isDark } = useTheme();

    return (
        <Tab.Navigator
            id="main-tabs"
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarShowLabel: false,
                tabBarBackground: () => (
                    <BlurView tint={isDark ? "dark" : "light"} intensity={30} style={StyleSheet.absoluteFill} />
                ),
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                listeners={{
                    tabPress: () => {
                        // @ts-ignore
                        const { HapticFeedback } = require('../utils/haptics');
                        HapticFeedback.selection();
                    },
                }}
                options={{
                    tabBarIcon: ({ color }) => <Home color={color} size={24} />
                }}
            />
            <Tab.Screen
                name="Sleep"
                component={SleepScreen}
                listeners={{
                    tabPress: () => {
                        // @ts-ignore
                        const { HapticFeedback } = require('../utils/haptics');
                        HapticFeedback.selection();
                    },
                }}
                options={{
                    tabBarIcon: ({ color }) => <Moon color={color} size={24} />
                }}
            />
            <Tab.Screen
                name="Heart"
                component={HeartScreen}
                listeners={{
                    tabPress: () => {
                        // @ts-ignore
                        const { HapticFeedback } = require('../utils/haptics');
                        HapticFeedback.selection();
                    },
                }}
                options={{
                    tabBarIcon: ({ color }) => <Heart color={color} size={24} />
                }}
            />
            <Tab.Screen
                name="Trends"
                component={TrendsScreen}
                listeners={{
                    tabPress: () => {
                        // @ts-ignore
                        const { HapticFeedback } = require('../utils/haptics');
                        HapticFeedback.selection();
                    },
                }}
                options={{
                    tabBarIcon: ({ color }) => <TrendingUp color={color} size={24} />
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                listeners={{
                    tabPress: () => {
                        // @ts-ignore
                        const { HapticFeedback } = require('../utils/haptics');
                        HapticFeedback.selection();
                    },
                }}
                options={{
                    tabBarIcon: ({ color }) => <User color={color} size={24} />
                }}
            />
        </Tab.Navigator>
    );
};

import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { LoadingRing } from '../components/LoadingRing';

export const AppNavigator = () => {
    const { user, loading: authLoading } = useAuth();
    const { data, isSyncing } = useData();
    const { colors, theme: currentTheme } = useTheme();

    const navigationTheme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            background: colors.background,
            card: colors.surface,
            text: colors.textPrimary,
        },
    };

    // or if user is logged in but we are waiting for the FIRST sync
    const isLoading = authLoading || (user && !data);

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
                <LoadingRing size={100} />
            </View>
        );
    }

    // Determine if onboarding is needed
    // Strict check: User exists AND onboardingCompleted is false or undefined
    // We treat undefined as false for existing users who migrated
    const needsOnboarding = user && (data?.onboardingCompleted === false || data?.onboardingCompleted === undefined);

    return (
        <NavigationContainer theme={navigationTheme}>
            <Stack.Navigator id="root-stack" screenOptions={{ headerShown: false }}>
                {!user ? (
                    <Stack.Group screenOptions={{ animation: 'fade' }}>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </Stack.Group>
                ) : needsOnboarding ? (
                    <Stack.Group screenOptions={{ animation: 'slide_from_right' }}>
                        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                    </Stack.Group>
                ) : (
                    <Stack.Group screenOptions={{
                        animation: 'simple_push',
                        animationDuration: 200,
                    }}>
                        <Stack.Screen name="MainBase" component={MainTabs} />
                        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
                        <Stack.Screen name="Terms" component={TermsScreen} />
                        <Stack.Screen
                            name="EditProfile"
                            component={EditProfileScreen}
                            options={{
                                presentation: 'modal',
                                animation: 'slide_from_bottom',
                            }}
                        />
                        <Stack.Screen
                            name="Workout"
                            component={WorkoutScreen}
                            options={{
                                presentation: 'modal',
                                animation: 'slide_from_bottom',
                            }}
                        />
                        <Stack.Screen
                            name="Mindfulness"
                            component={MindfulnessScreen}
                            options={{
                                presentation: 'modal',
                                animation: 'slide_from_bottom',
                            }}
                        />
                        <Stack.Screen
                            name="History"
                            component={HistoryScreen}
                            options={{
                                animation: 'slide_from_right',
                            }}
                        />
                    </Stack.Group>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 0,
        borderTopWidth: 0,
        backgroundColor: 'transparent', // Handled by BlurView
        height: 85,
    }
});
