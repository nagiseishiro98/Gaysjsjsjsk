import { LicenseKey, KeyStatus, GenerateKeyParams, DurationType } from '../types';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';

// ==========================================================================
// FIREBASE CONFIGURATION
// REPLACE THIS OBJECT WITH YOUR OWN FROM: Firebase Console > Project Settings
// ==========================================================================
const firebaseConfig = {
  apiKey: "AIzaSyB-REPLACE_THIS_WITH_YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
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

const COLLECTION_NAME = 'licenses';

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
  if (!db) return [];
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as LicenseKey));
  } catch (error) {
    console.error("Error fetching keys:", error);
    return [];
  }
};

export const generateUniqueKey = (prefix: string = 'KEY'): string => {
  const randomPart = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return `${prefix.toUpperCase()}-${randomPart.toUpperCase().match(/.{1,4}/g)?.join('-')}`;
};

export const createKey = async (params: GenerateKeyParams): Promise<LicenseKey | null> => {
  if (!db) return null;
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

  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), newKeyData);
    return { id: docRef.id, ...newKeyData } as LicenseKey;
  } catch (error) {
    console.error("Error creating key:", error);
    return null;
  }
};

export const toggleKeyStatus = async (id: string, currentStatus: KeyStatus): Promise<void> => {
  if (!db) return;
  const keyRef = doc(db, COLLECTION_NAME, id);
  
  let newStatus = currentStatus;
  if (currentStatus === KeyStatus.PAUSED) newStatus = KeyStatus.ACTIVE;
  else if (currentStatus === KeyStatus.ACTIVE) newStatus = KeyStatus.PAUSED;

  try {
    await updateDoc(keyRef, { status: newStatus });
  } catch (error) {
    console.error("Error updating status:", error);
  }
};

// Hard Delete (Permanent)
export const deleteKey = async (id: string): Promise<void> => {
  if (!db) return;
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error deleting key:", error);
  }
};

export const resetHwid = async (id: string): Promise<void> => {
  if (!db) return;
  const keyRef = doc(db, COLLECTION_NAME, id);
  try {
    await updateDoc(keyRef, { boundDeviceId: null });
  } catch (error) {
    console.error("Error resetting HWID:", error);
  }
};

export const banKey = async (id: string): Promise<void> => {
    if (!db) return;
    const keyRef = doc(db, COLLECTION_NAME, id);
    try {
        await updateDoc(keyRef, { status: KeyStatus.BANNED });
    } catch (error) {
        console.error("Error banning key:", error);
    }
};