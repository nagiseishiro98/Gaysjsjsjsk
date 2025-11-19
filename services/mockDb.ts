import { LicenseKey, KeyStatus, GenerateKeyParams, DurationType } from '../types';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';

// ==========================================================================
// FIREBASE CONFIGURATION
// REPLACE THIS OBJECT WITH YOUR OWN FROM: Firebase Console > Project Settings
// ==========================================================================
const firebaseConfig = {
  apiKey: "AIzaSyBTKlUci5WyWwFw3FBriWWjC2AgmuH1TmY",
  authDomain: "key-generator-93f89.firebaseapp.com",
  projectId: "key-generator-93f89",
  storageBucket: "key-generator-93f89.firebasestorage.app",
  messagingSenderId: "53336276634",
  appId: "1:53336276634:web:ea7de7068a8f1efb7ea923",
  measurementId: "G-9SBEXVVZ53"
};

// Initialize Firebase
// We use a try-catch to prevent the app from crashing if config is invalid during development
let db: any;
let auth: any;

try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.error("Firebase Initialization Error. Did you replace the config?", error);
}

// Updated to match the Firestore Rules 'match /keys/{docId}'
const COLLECTION_NAME = 'keys';

// --- AUTHENTICATION SERVICE ---

/**
 * Logs in the user using Firebase Authentication.
 * NOTE: You must create the user in Firebase Console > Authentication > Users first.
 */
export const loginUser = async (email: string, pass: string) => {
  if (!auth) throw new Error("Firebase not initialized");
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return userCredential.user;
  } catch (error: any) {
    throw error;
  }
};

export const logoutUser = async () => {
  if (!auth) return;
  await signOut(auth);
};

/**
 * Subscribes to the Firebase Auth state.
 * Use this in App.tsx to know if a user is logged in or out.
 */
export const subscribeToAuth = (callback: (user: User | null) => void) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

// --- DATABASE SERVICE ---

export const getKeys = async (): Promise<LicenseKey[]> => {
  if (!db) throw new Error("Database not connected");
  // Removed try-catch to allow UI to handle 'insufficient permissions' errors
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as LicenseKey));
};

export const generateUniqueKey = (prefix: string = 'KEY'): string => {
  const randomPart = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return `${prefix.toUpperCase()}-${randomPart.toUpperCase().match(/.{1,4}/g)?.join('-')}`;
};

export const createKey = async (params: GenerateKeyParams): Promise<LicenseKey> => {
  if (!db) throw new Error("Database not connected");
  const now = Date.now();
  let expirationTime = 0;

  switch (params.durationType) {
    case DurationType.MINUTES:
      expirationTime = now + params.durationValue * 60 * 1000;
      break;
    case DurationType.HOURS:
      expirationTime = now + params.durationValue * 60 * 60 * 1000;
      break;
    case DurationType.DAYS:
      expirationTime = now + params.durationValue * 24 * 60 * 60 * 1000;
      break;
    case DurationType.YEARS:
      expirationTime = now + params.durationValue * 365 * 24 * 60 * 60 * 1000;
      break;
  }

  const newKeyData = {
    key: generateUniqueKey(params.prefix),
    note: params.note,
    createdAt: now,
    expiresAt: expirationTime,
    status: KeyStatus.ACTIVE,
    maxDevices: 1,
    boundDeviceId: null,
    lastUsed: null,
    ip: null
  };

  // Removed try-catch
  const docRef = await addDoc(collection(db, COLLECTION_NAME), newKeyData);
  return { id: docRef.id, ...newKeyData } as LicenseKey;
};

export const toggleKeyStatus = async (id: string, currentStatus: KeyStatus): Promise<void> => {
  if (!db) throw new Error("Database not connected");
  const keyRef = doc(db, COLLECTION_NAME, id);
  
  let newStatus = currentStatus;
  if (currentStatus === KeyStatus.PAUSED) newStatus = KeyStatus.ACTIVE;
  else if (currentStatus === KeyStatus.ACTIVE) newStatus = KeyStatus.PAUSED;

  await updateDoc(keyRef, { status: newStatus });
};

// Hard Delete (Permanent)
export const deleteKey = async (id: string): Promise<void> => {
  if (!db) throw new Error("Database not connected");
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};

export const resetHwid = async (id: string): Promise<void> => {
  if (!db) throw new Error("Database not connected");
  const keyRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(keyRef, { boundDeviceId: null });
};

export const banKey = async (id: string): Promise<void> => {
    if (!db) throw new Error("Database not connected");
    const keyRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(keyRef, { status: KeyStatus.BANNED });
};