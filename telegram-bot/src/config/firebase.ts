import admin from 'firebase-admin';
import { env } from './env';

let firebaseApp: admin.app.App;

export function initFirebase(): admin.app.App {
  if (firebaseApp) return firebaseApp;

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.firebase.projectId,
      privateKey: env.firebase.privateKey,
      clientEmail: env.firebase.clientEmail,
    }),
    databaseURL: `https://${env.firebase.projectId}.firebaseio.com`,
  });

  console.log('🔥 Firebase Admin initialized');
  return firebaseApp;
}

export function getFirestore(): admin.firestore.Firestore {
  return admin.firestore();
}

export function getAuth(): admin.auth.Auth {
  return admin.auth();
}

export { admin };
