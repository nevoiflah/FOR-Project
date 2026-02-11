import * as admin from 'firebase-admin';
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
        admin.initializeApp({
            credential: admin.credential.applicationDefault()
            // OR admin.credential.cert(serviceAccount)
        });
        console.log('🔥 Firebase Admin Initialized');
    } catch (error) {
        console.error('⚠️ Firebase Admin Initialization Failed (Expected if no CREDENTIALS provided):', error);
    }
}

export const auth = admin.auth();
