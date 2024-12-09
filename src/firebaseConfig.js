// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Add authentication
import { getFirestore } from "firebase/firestore"; // Add Firestore
import { getStorage } from "firebase/storage"; // Add Storage
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAjRePYBavMXhCeOxd2_H1qrnAmVVlonlI",
  authDomain: "chic-closetapp.firebaseapp.com",
  projectId: "chic-closetapp",
  storageBucket: "chic-closetapp.firebasestorage.app",
  messagingSenderId: "80919746989",
  appId: "1:80919746989:web:f8bbb6709c19349c83a924",
  measurementId: "G-9Z1P33V9CR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app); // Authentication
const db = getFirestore(app); // Firestore
const storage = getStorage(app); // Storage

// Export the services so they can be used in other parts of your app
export { auth, db, storage };
