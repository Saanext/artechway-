import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// import { getAnalytics } from "firebase/analytics"; // Uncomment if analytics is needed

const firebaseConfig = {
  apiKey: "AIzaSyB8I8rHooqu6oE51tWDRdT7tEetKsgEM8I",
  authDomain: "saasnext-blog-b7d64.firebaseapp.com",
  databaseURL: "https://saasnext-blog-b7d64-default-rtdb.firebaseio.com",
  projectId: "saasnext-blog-b7d64",
  storageBucket: "saasnext-blog-b7d64.firebasestorage.app",
  messagingSenderId: "740185164260",
  appId: "1:740185164260:web:d0782dc93da002ec91dff1",
  measurementId: "G-VV7PP00B31"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
// const analytics = getAnalytics(app); // Uncomment if analytics is needed

export { app, auth, db };
