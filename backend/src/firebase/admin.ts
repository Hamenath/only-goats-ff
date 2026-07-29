import * as admin from "firebase-admin";
import env from "../config/env";

let app: admin.app.App;

export function initFirebase(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const serviceAccount: admin.ServiceAccount = {
    projectId: env.FIREBASE_PROJECT_ID,
    privateKeyId: env.FIREBASE_PRIVATE_KEY_ID,
    privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    clientId: env.FIREBASE_CLIENT_ID,
  } as admin.ServiceAccount;

  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: env.FIREBASE_STORAGE_BUCKET,
  });

  return app;
}

export function getDb(): admin.firestore.Firestore {
  if (!admin.apps.length) initFirebase();
  return admin.firestore();
}

export function getBucket(): ReturnType<admin.storage.Storage["bucket"]> {
  if (!admin.apps.length) initFirebase();
  return admin.storage().bucket();
}

export { admin };
