import { redirect } from "next/navigation";
import LandingPage from "@/components/landing/LandingPage";

export default async function Home() {
  if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    try {
      const { cookies } = await import("next/headers");
      const { getSessionUser } = await import("@/lib/firebase-admin");
      const cookieStore = await cookies();
      const session = cookieStore.get("__session")?.value;
      const user = await getSessionUser(session);
      if (user) redirect("/dashboard");
    } catch {}
  }

  return <LandingPage />;
}
