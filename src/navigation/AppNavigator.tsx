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

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabs = () => {
    return (
        <Tab.Navigator
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

export const AppNavigator = () => {
    const theme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            background: COLORS.background,
        },
    };

    return (
        <NavigationContainer theme={theme}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                <Stack.Screen name="MainBase" component={MainTabs} />
                <Stack.Screen name="Goals" component={GoalsScreen} />
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
