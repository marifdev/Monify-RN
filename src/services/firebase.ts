import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Add your Firebase config here
// You'll need to replace these values with your own Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDF1wV2o-ECFtG6PlOzqj-zYPCd0_O1Qf0",
  authDomain: "expense-tracker-4a1a0.firebaseapp.com",
  projectId: "expense-tracker-4a1a0",
  storageBucket: "expense-tracker-4a1a0.firebasestorage.app",
  messagingSenderId: "210383683572",
  appId: "1:210383683572:web:67fa9e35391ce02a5a43a1",
  measurementId: "G-CRVFH5LW3F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);
export { app, auth, db }; 