import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, TranslationKey } from '../i18n/translations';
import { I18nManager } from 'react-native';

type Locale = 'en' | 'he';

interface LanguageContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: TranslationKey, options?: Record<string, string | number>) => string;
    isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

import AsyncStorage from '@react-native-async-storage/async-storage';

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [locale, setLocaleState] = useState<Locale>('en');

    useEffect(() => {
        loadLocale();
    }, []);

    const loadLocale = async () => {
        try {
            const saved = await AsyncStorage.getItem('user_locale');
            if (saved === 'en' || saved === 'he') {
                setLocaleState(saved);
            }
        } catch (e) {
            console.log('Failed to load locale');
        }
    };

    const setLocale = async (newLocale: Locale) => {
        setLocaleState(newLocale);
        try {
            await AsyncStorage.setItem('user_locale', newLocale);
        } catch (e) {
            console.log('Failed to save locale');
        }
        // Note: For a true native RTL flip, we would use I18nManager.forceRTL(true) and restart.
        // For this seamless toggle, we will manage direction manually in styles.
    };

    const t = (key: TranslationKey, options?: Record<string, string | number>): string => {
        let text = translations[locale][key] || key;

        if (options) {
            Object.keys(options).forEach(optionKey => {
                text = text.replace(new RegExp(`{{${optionKey}}}`, 'g'), String(options[optionKey]));
            });
        }

        return text;
    };

    const isRTL = locale === 'he';

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t, isRTL }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
