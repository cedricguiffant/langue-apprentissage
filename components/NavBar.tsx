import { cookies } from "next/headers";
import NavBarClient from "./NavBarClient";
import type { UserProfile } from "@/lib/types";

export default async function NavBar() {
  let profile: UserProfile | null = null;

  try {
    if (process.env.FIREBASE_PROJECT_ID) {
      const { getSessionUser, adminDb } = await import("@/lib/firebase-admin");
      const cookieStore = await cookies();
      const session = cookieStore.get("__session")?.value;
      const user = await getSessionUser(session);
      if (user) {
        const snap = await adminDb.collection("users").doc(user.uid).get();
        if (snap.exists) {
          profile = { id: user.uid, ...snap.data() } as UserProfile;
        }
      }
    }
  } catch {
    // Firebase not configured — render nav without profile
  }

  return <NavBarClient profile={profile} />;
}
