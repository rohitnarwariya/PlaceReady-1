
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
// Fix: Use namespace import to bypass named export resolution issues in specific environments
import * as firestore from 'firebase/firestore';

// Firebase configuration for the application
const firebaseConfig = {
  apiKey: "AIzaSyCkId9fBVnL3UM7p2srcV_ewzUIgauVWzI",
  authDomain: "placeready-71e69.firebaseapp.com",
  projectId: "placeready-71e69",
  storageBucket: "placeready-71e69.firebasestorage.app",
  messagingSenderId: "441731673318",
  appId: "1:441731673318:web:63ab4bb25054f5a756df27",
  measurementId: "G-Z73JNVBNCY"
};

// Initialize Firebase app singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
// Fix: Use namespaced call for initialization
export const db = firestore.getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Fix: Extract members from the namespace for re-export
const {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc, 
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  limit,
  // Added or and and for complex logic
  or,
  and
} = firestore;

// Re-exporting firestore and auth methods for modular use
export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc, 
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  limit,
  or,
  and
};
