
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Validate that all required environment variables are present
const areCredsValid = Object.values(firebaseConfig).every(value => value);

let app: FirebaseApp;

// Initialize Firebase only if the credentials are valid
if (areCredsValid) {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
} else {
    // This will log an error on the server side if keys are missing
    console.error("Firebase credentials are not set correctly in .env. Please check your environment variables.");
    // In a non-functional state, we'll assign a dummy app to prevent crashes,
    // though functionality will be broken.
    if (!getApps().length) {
      app = initializeApp({});
    } else {
      app = getApp();
    }
}

const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
