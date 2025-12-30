import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase is configured with hardcoded values for development
const isConfigured = true;

let app = null;
let database = null;

if (isConfigured) {
    const firebaseConfig = {
        apiKey: "AIzaSyBdSNgAxrZTWpgfvLjpy_1IC0nsIpNAqQU",
        authDomain: "sugarcaneiot.firebaseapp.com",
        databaseURL: "https://sugarcaneiot-default-rtdb.asia-southeast1.firebasedatabase.app", projectId: "sugarcaneiot",
        storageBucket: "sugarcaneiot.firebasestorage.app",
        messagingSenderId: "742999197236",
        appId: "1:742999197236:web:a92744f3acbfe703dbec61"
        // apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        // authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        // databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
        // projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        // storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        // messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        // appId: import.meta.env.VITE_FIREBASE_APP_ID
    };

    try {
        app = initializeApp(firebaseConfig);
        database = getDatabase(app);
    } catch (error) {
        console.warn('Firebase initialization failed:', error.message);
    }
}

export { database, isConfigured };
export default app;
