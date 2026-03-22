import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let configured = false;

if (
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY &&
  !getApps().length
) {
  try {
    initializeApp({
      credential: cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey:  process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
    configured = true;
  } catch (e) {
    console.error("Firebase Admin init failed:", e);
  }
} else if (getApps().length) {
  configured = true;
}

export const adminAuth = configured ? getAuth()      : null as any;
export const adminDb   = configured ? getFirestore() : null as any;

/** Verify the session cookie and return the decoded token, or null. */
export async function getSessionUser(sessionCookie: string | undefined) {
  if (!sessionCookie || !configured || !adminAuth) return null;
  try {
    return await adminAuth.verifySessionCookie(sessionCookie, true);
  } catch {
    return null;
  }
}
