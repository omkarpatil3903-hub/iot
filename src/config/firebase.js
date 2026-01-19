import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Check if Firebase environment variables are configured
const isConfigured = !!(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID
);

let app = null;
let database = null;

if (isConfigured) {
    const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
    };

    try {
        app = initializeApp(firebaseConfig);
        database = getDatabase(app);
        console.log('✅ Firebase initialized successfully');
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error.message);
    }
} else {
    console.warn('⚠️ Firebase not configured. Please create a .env file with your Firebase credentials. See .env.example for template.');
}

export { database, isConfigured };
export default app;
