import { NextResponse, type NextRequest } from "next/server";

// Firebase handles OAuth via signInWithPopup — no server callback needed.
// Kept as a safe fallback for any redirect-based flows.
export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/dashboard`);
}
