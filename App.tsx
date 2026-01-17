import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { DataProvider } from './src/contexts/DataContext';
import { LanguageProvider } from './src/contexts/LanguageContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <DataProvider>
          <StatusBar style="light" />
          <AppNavigator />
        </DataProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
