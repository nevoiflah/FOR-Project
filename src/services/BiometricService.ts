import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_KEY = 'user_credentials';

export const biometricService = {
    // Check if hardware supports biometrics
    checkAvailability: async () => {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        return hasHardware && isEnrolled;
    },

    // Simply authenticate the user (e.g. for permission check)
    authenticate: async (promptMessage = 'Authenticate to continue') => {
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage,
                fallbackLabel: 'Use Passcode',
                disableDeviceFallback: false,
            });
            return result.success;
        } catch (error) {
            console.error('Biometric Auth Error:', error);
            return false;
        }
    },

    // Save credentials securely
    saveCredentials: async (email: string, pass: string) => {
        try {
            await SecureStore.setItemAsync(BIOMETRIC_KEY, JSON.stringify({ email, pass }));
            return true;
        } catch (error) {
            console.error('SecureStore Save Error:', error);
            return false;
        }
    },

    // Get credentials
    getCredentials: async () => {
        try {
            const json = await SecureStore.getItemAsync(BIOMETRIC_KEY);
            return json ? JSON.parse(json) : null;
        } catch (error) {
            console.error('SecureStore Get Error:', error);
            return null;
        }
    },

    // Clear credentials (disable biometric login)
    clearCredentials: async () => {
        try {
            await SecureStore.deleteItemAsync(BIOMETRIC_KEY);
            return true;
        } catch (error) {
            console.error('SecureStore Delete Error:', error);
            return false;
        }
    }
};
