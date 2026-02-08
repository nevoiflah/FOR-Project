import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { DataProvider } from './src/contexts/DataContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { CormorantGaramond_400Regular, CormorantGaramond_600SemiBold, CormorantGaramond_700Bold } from '@expo-google-fonts/cormorant-garamond';
import { View } from 'react-native';
import { useCallback } from 'react';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
  });

  const [appIsReady, setAppIsReady] = React.useState(false);

  React.useEffect(() => {
    async function prepare() {
      try {
        // Wait for fonts to load or fail
        if (fontsLoaded || fontError) {
          setAppIsReady(true);
        }
      } catch (e) {
        console.warn('Error preparing app:', e);
        setAppIsReady(true); // Proceed anyway
      }
    }

    prepare();
  }, [fontsLoaded, fontError]);

  // Safety net: Force app to be ready after 3 seconds no matter what
  React.useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Safety timeout: forcing app ready');
      setAppIsReady(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Hide splash screen when app is ready
  React.useEffect(() => {
    async function hideSplash() {
      if (appIsReady) {
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.warn('Error hiding splash:', e);
        }
      }
    }
    hideSplash();
  }, [appIsReady]);

  const onLayoutRootView = useCallback(() => {
    // Layout callback - splash hiding is now handled by useEffect
  }, []);

  // Always render the app tree, splash screen will hide when ready
  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
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
  );
}
