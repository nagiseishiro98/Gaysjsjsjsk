import { LicenseKey, KeyStatus, GenerateKeyParams, DurationType } from '../types';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp, onSnapshot, where } from 'firebase/firestore';
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

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

// --- DATABASE SERVICE ---

/**
 * Real-time subscription to keys.
 * Now filters by the authenticated user's ID (Multi-tenant).
 */
export const subscribeToKeys = (callback: (keys: LicenseKey[]) => void, onError?: (error: any) => void) => {
  if (!db) {
    if (onError) onError(new Error("Database not connected"));
    return () => {};
  }

  if (!auth.currentUser) {
    if (onError) onError(new Error("User not authenticated"));
    return () => {};
  }

  // Filter by ownerId to ensure data isolation
  // We rely on client-side sorting to avoid complex composite index requirements during setup
  const q = query(collection(db, COLLECTION_NAME), where('ownerId', '==', auth.currentUser.uid));
  
  // returns the unsubscribe function
  return onSnapshot(q, (snapshot) => {
    const keys = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as LicenseKey));
    
    // Sort manually by createdAt desc
    keys.sort((a, b) => b.createdAt - a.createdAt);
    
    callback(keys);
  }, (error) => {
    if (onError) onError(error);
    else console.error("Real-time sync error:", error);
  });
};

export const getKeys = async (): Promise<LicenseKey[]> => {
  if (!db) throw new Error("Database not connected");
  if (!auth.currentUser) throw new Error("User not authenticated");

  const q = query(collection(db, COLLECTION_NAME), where('ownerId', '==', auth.currentUser.uid));
  const querySnapshot = await getDocs(q);
  
  const keys = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as LicenseKey));

  return keys.sort((a, b) => b.createdAt - a.createdAt);
};

export const generateUniqueKey = (prefix: string = 'KEY'): string => {
  const randomPart = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return `${prefix.toUpperCase()}-${randomPart.toUpperCase().match(/.{1,4}/g)?.join('-')}`;
};

export const createKey = async (params: GenerateKeyParams): Promise<LicenseKey> => {
  if (!db) throw new Error("Database not connected");
  if (!auth.currentUser) throw new Error("User not authenticated");
  
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
    boundDeviceId: params.hwid || null, // Set manual HWID if provided
    deviceName: null, // Initialize as null
    lastUsed: null,
    ip: null,
    ownerId: auth.currentUser.uid // Bind key to current admin
  };

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

export const deleteKey = async (id: string): Promise<void> => {
  if (!db) throw new Error("Database not connected");
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};

export const resetHwid = async (id: string): Promise<void> => {
  if (!db) throw new Error("Database not connected");
  const keyRef = doc(db, COLLECTION_NAME, id);
  // Also clear the IP, DeviceName and Last Used to perform a "Session Reset"
  await updateDoc(keyRef, { boundDeviceId: null, deviceName: null, ip: null, lastUsed: null });
};

export const banKey = async (id: string): Promise<void> => {
    if (!db) throw new Error("Database not connected");
    const keyRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(keyRef, { status: KeyStatus.BANNED });
};