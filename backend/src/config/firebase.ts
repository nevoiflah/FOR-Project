import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Firebase Admin
// Ideally we use a service account key file, but for now we can rely on 
// Application Default Credentials (ADC) if running in Google Cloud, 
// OR we strictly need a service account json for local dev.
// 
// WARN: The user has not provided a Service Account Key yet. 
// We will placeholder this initialization.
//
// If users are using Firebase Auth, we verify ID Tokens.

if (!admin.apps.length) {
    try {
        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

        if (serviceAccountJson) {
            // Use the JSON key provided in Render environment variables
            const serviceAccount = JSON.parse(serviceAccountJson);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('🔥 Firebase Admin Initialized with Service Account');
        } else {
            // Fallback for local testing if GOOGLE_APPLICATION_CREDENTIALS is set
            admin.initializeApp({
                credential: admin.credential.applicationDefault()
            });
            console.log('🔥 Firebase Admin Initialized with Default Credentials');
        }
    } catch (error) {
        console.error('⚠️ Firebase Admin Initialization Failed:', error);
    }
}

export const auth = admin.auth();
