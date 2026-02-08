import React, { useEffect, useCallback, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { DataProvider } from './src/contexts/DataContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import { AnimatedSplashScreen } from './src/components/AnimatedSplashScreen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application it's ready to show the animation
        setAppIsReady(true);
        setShowAnimation(true);
      }
    }

    prepare();

    // Safety timeout: If prepare() somehow hangs, force ready after 4 seconds
    const timeout = setTimeout(() => {
      setAppIsReady(true);
      setShowAnimation(true);
    }, 4000);

    return () => clearTimeout(timeout);
  }, []);

  const onAnimationFinish = () => {
    setShowAnimation(false);
  };

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Main App mounts immediately behind the splash screen */}
      <SafeAreaProvider>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <DataProvider>
                <StatusBar style="auto" />
                <AppNavigator />
              </DataProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </SafeAreaProvider>

      {/* Animated Splash Screen Overlay */}
      {showAnimation && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
          <AnimatedSplashScreen onAnimationFinish={onAnimationFinish} />
        </View>
      )}
    </View>
  );
}
