import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// Firebase configuration - يجب تعبئتها من متغيرات البيئة
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

export function initFirebase(): { app: FirebaseApp; db: Firestore; auth: Auth } {
  if (app && db && auth) return { app, db, auth };

  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);

  return { app, db, auth };
}

export async function signInAnonymouslyWithTelegram(): Promise<string | null> {
  const { auth } = initFirebase();

  try {
    const result = await signInAnonymously(auth);
    console.log('✅ Firebase Anonymous Auth:', result.user.uid);
    return result.user.uid;
  } catch (error) {
    console.error('❌ Firebase Auth Error:', error);
    return null;
  }
}

export function onAuthChange(callback: (uid: string | null) => void): () => void {
  const { auth } = initFirebase();
  return onAuthStateChanged(auth, (user) => {
    callback(user?.uid || null);
  });
}

export { getFirestore, getAuth };
