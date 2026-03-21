import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

const SESSION_MS = 60 * 60 * 24 * 14 * 1000; // 14 days

/** POST /api/session — exchange Firebase ID token for a session cookie */
export async function POST(req: NextRequest) {
  if (!process.env.FIREBASE_PROJECT_ID) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }

  try {
    const { idToken } = await req.json();

    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn: SESSION_MS });

    // Create user profile on first sign-in
    const decoded = await adminAuth.verifyIdToken(idToken);
    const ref = adminDb.collection("users").doc(decoded.uid);
    const snap = await ref.get();
    if (!snap.exists) {
      const username = decoded.name ?? decoded.email?.split("@")[0] ?? "Samouraï";
      await ref.set({
        username,
        avatar_skin: "samurai",
        level: 1,
        xp: 0,
        xp_to_next_level: 100,
        streak: 0,
        longest_streak: 0,
        last_activity_date: null,
        total_reviews: 0,
        correct_reviews: 0,
        xp_this_week: 0,
        week_start: new Date().toISOString().split("T")[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    const cookieStore = await cookies();
    cookieStore.set("__session", sessionCookie, {
      maxAge: SESSION_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("session error", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

/** DELETE /api/session — sign out */
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("__session");
  return NextResponse.json({ status: "ok" });
}
