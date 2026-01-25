import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS } from '../constants/theme';

// Icons
import { Home, Moon, Heart, TrendingUp, User, Settings, ArrowRight, Target } from 'lucide-react-native';

// Screens
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { RegisterScreen } from '../screens/Auth/RegisterScreen';
import { OnboardingScreen } from '../screens/Auth/OnboardingScreen';
import { DashboardScreen } from '../screens/Main/DashboardScreen';
import { SleepScreen } from '../screens/Main/SleepScreen';
import { HeartScreen } from '../screens/Main/HeartScreen';
import { TrendsScreen } from '../screens/Main/TrendsScreen';
import { GoalsScreen } from '../screens/Main/GoalsScreen';
import { ProfileScreen } from '../screens/User/ProfileScreen';
import { EditProfileScreen } from '../screens/User/EditProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabs = () => {
    return (
        <Tab.Navigator
            id="main-tabs"
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarShowLabel: false,
                tabBarBackground: () => (
                    <BlurView tint="dark" intensity={30} style={StyleSheet.absoluteFill} />
                ),
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textSecondary,
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
                options={{
                    tabBarIcon: ({ color }) => <Moon color={color} size={24} />
                }}
            />
            <Tab.Screen
                name="Heart"
                component={HeartScreen}
                options={{
                    tabBarIcon: ({ color }) => <Heart color={color} size={24} />
                }}
            />
            <Tab.Screen
                name="Trends"
                component={TrendsScreen}
                options={{
                    tabBarIcon: ({ color }) => <TrendingUp color={color} size={24} />
                }}
            />
            <Tab.Screen
                name="Goals"
                component={GoalsScreen}
                options={{
                    tabBarIcon: ({ color }) => <Target color={color} size={24} />
                }}
            />
            {/* Goals might be accessed via dashboard or its own tab? Used Trends for now. Let's add Profile as 5th tab */}
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
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

    const theme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            background: COLORS.background,
        },
    };

    // or if user is logged in but we are waiting for the FIRST sync
    const isLoading = authLoading || (user && !data);

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
                <LoadingRing size={100} />
            </View>
        );
    }

    // Determine if onboarding is needed
    // Safety check: if we have user but no data doc yet, or missing profile fields
    const needsOnboarding = user && (!data?.userProfile?.age || !data?.userProfile?.weight);

    return (
        <NavigationContainer theme={theme}>
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
                    <Stack.Group>
                        <Stack.Screen name="MainBase" component={MainTabs} />
                        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                        <Stack.Screen name="Goals" component={GoalsScreen} />
                        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
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
