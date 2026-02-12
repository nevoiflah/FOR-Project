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
- **Storage**: @react-native-async-storage/async-storage (Device), Firebase Firestore (User Profiles), MongoDB Atlas (Vital History)
- **Device Features**: expo-haptics, react-native-ble-plx (Bluetooth)

## Hybrid Architecture

The app uses a **Hybrid Backend** to balance cost and performance:
*   **Firebase (Auth & Firestore)**: Handles User Authentication and low-frequency data like User Profiles and Settings.
*   **Node.js + MongoDB (Express API)**: Handles high-frequency time-series data (Heart Rate, HRV, Steps) to avoid Firestore write limits.

## Backend (Server)

The backend is located in the `backend/` folder. It is a Node.js/Express app written in TypeScript.

### Tech Stack
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB (via Mongoose)
*   **Auth**: Firebase Admin SDK (verifies ID Tokens from App)
*   **Deployment**: Render.com

### API Endpoints
*   `POST /vitals/batch`: Uploads a batch of buffered vital signs (Heart Rate, Steps) to MongoDB.
*   `GET /vitals/history`: Fetches 24h of historical data for graphing.

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

3.  Start the application (Frontend):
    ```bash
    npm start
    ```

### Backend Setup

1.  Navigate to the backend folder:
    ```bash
    cd backend
    ```

2.  Install backend dependencies:
    ```bash
    npm install
    ```

3.  Create a `.env` file in `backend/` with:
    ```env
    MONGODB_URI=your_mongodb_connection_string
    PORT=3000
    ```

4.  Start the backend server:
    ```bash
    npm run dev
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
