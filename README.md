# FOR Project

FOR Project is a comprehensive smart ring companion application built with React Native and Expo. It mimics the functionality of a premium health tracking device application, featuring real-time metric visualization, smart coaching insights, and a highly polished glassmorphism user interface.

## Key Features

- **Advanced Health Metrics**: Visualize Sleep, Heart Rate, and Readiness scores with interactive charts.
- **Glassmorphism UI**: A modern, premium design system featuring frosted glass cards, smooth gradients, and subtle animations.
- **Smart Coaching**: Dynamic wellness insights that adapt based on the user's daily health data.
- **Mock Bluetooth Engine**: A fully functional simulation mode to test various health states (High Stress, Poor Sleep, Perfect Day) without physical hardware.
- **Localization**: Full support for English and Hebrew languages, including automatic RTL (Right-to-Left) layout adjustments.
- **Haptic Feedback**: Integrated tactile feedback for a responsive user experience.
- **Data Persistence**: Local storage ensures user settings and profile data remain saved across sessions.

## Technology Stack

- **Framework**: React Native (Expo SDK 52)
- **Language**: TypeScript
- **State Management**: React Context API
- **Navigation**: React Navigation (Bottom Tabs & Native Stack)
- **UI Components**:
    - expo-blur and expo-linear-gradient for visual effects
    - react-native-svg for custom charts
    - lucide-react-native for vector icons
- **Storage**: @react-native-async-storage/async-storage
- **Device Features**: expo-haptics

## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/FOR-Project.git
    cd FOR-Project
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the application:
    ```bash
    npm start
    ```

## Development

The application is configured to run with Expo Go. You can start the development server and scan the QR code with your iOS or Android device.

### Simulation Mode

To test specific app states, navigate to the **Profile** screen. The "Developer Tools" section allows you to force specific scenarios:
- **Force Poor Sleep**: Simulates a low recovery day.
- **Force High Stress**: Simulates elevated heart rate and low variability.
- **Force Perfect Day**: Simulates optimal health metrics.
- **Reset Data**: Returns the app to its default state.

## Project Structure

- src/components: Reusable UI elements (GlassCard, ScreenWrapper, LoadingRing).
- src/screens: Application screens organized by flow (Auth, Main, User).
- src/contexts: Global state logic (DataContext, LanguageContext).
- src/services: Business logic and external service layers (BluetoothService).
- src/utils: Helper functions and constants.
- src/i18n: Translation dictionaries.
