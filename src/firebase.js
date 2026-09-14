import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  addDoc, 
  deleteDoc 
} from "firebase/firestore";

// User provided Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDo6kRpoyy9SyRO-9IWX8-v3gkcvd_07IM",
  authDomain: "hotelbooking-669d2.firebaseapp.com",
  projectId: "hotelbooking-669d2",
  storageBucket: "hotelbooking-669d2.firebasestorage.app",
  messagingSenderId: "168260515694",
  appId: "1:168260515694:web:b12dbc47d293cb8fc0737f",
  measurementId: "G-129M9WF8LW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  sendPasswordResetEmail,
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  addDoc,
  deleteDoc
};

export default app;
