"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { adminDb, adminAuth } from "./firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import type { VocabItem } from "@/data/japanese-core-vocab";

const SRS_INTERVALS_HOURS = [0, 4, 8, 24, 72, 168, 336, 720, 2160, 8760];

// ── XP thresholds ─────────────────────────────────────────────────────────────
function xpForLevel(level: number) {
  return Math.floor(100 * Math.pow(1.4, level - 1));
}

// ── Helpers ───────────────────────────────────────────────────────────────────
async function getCurrentUid(): Promise<string | null> {
  if (!process.env.FIREBASE_PROJECT_ID) return null;
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("__session")?.value;
    if (!session) return null;
    const decoded = await adminAuth.verifySessionCookie(session, true);
    return decoded.uid;
  } catch {
    return null;
  }
}

function userRef(uid: string) {
  return adminDb.collection("users").doc(uid);
}

// ── Add XP ────────────────────────────────────────────────────────────────────
export async function addXP(amount: number) {
  const uid = await getCurrentUid();
  if (!uid) return { error: "Not authenticated" };

  const ref = userRef(uid);
  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return;
    const data = snap.data()!;
    let { xp, level, xp_this_week } = data;
    xp += amount;
    xp_this_week = (xp_this_week ?? 0) + amount;

    // level-up loop
    let xpToNext = xpForLevel(level);
    while (xp >= xpToNext) {
      xp -= xpToNext;
      level += 1;
      xpToNext = xpForLevel(level);
    }

    tx.update(ref, {
      xp,
      level,
      xp_to_next_level: xpToNext,
      xp_this_week,
      updated_at: new Date().toISOString(),
    });
  });

  await checkAndAwardBadges(uid);
  revalidatePath("/dashboard");
  return { error: null };
}

// ── Update Streak ─────────────────────────────────────────────────────────────
export async function updateStreak() {
  const uid = await getCurrentUid();
  if (!uid) return { error: "Not authenticated" };

  const snap = await userRef(uid).get();
  if (!snap.exists) return { error: "Profile not found" };

  const p = snap.data()!;
  const today     = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split("T")[0];

  if (p.last_activity_date === today) {
    return { data: { streak: p.streak, already_updated: true } };
  }

  const newStreak  = p.last_activity_date === yesterday ? p.streak + 1 : 1;
  const newLongest = Math.max(newStreak, p.longest_streak ?? 0);

  await userRef(uid).update({
    streak: newStreak,
    longest_streak: newLongest,
    last_activity_date: today,
    updated_at: new Date().toISOString(),
  });

  await checkAndAwardBadges(uid);
  revalidatePath("/dashboard");
  return { data: { streak: newStreak, longest_streak: newLongest } };
}

// ── Save SRS Review ───────────────────────────────────────────────────────────
export async function saveReview(vocabId: number, correct: boolean) {
  const uid = await getCurrentUid();
  if (!uid) return { error: "Not authenticated" };

  const reviewRef = userRef(uid).collection("reviews").doc(String(vocabId));
  const snap = await reviewRef.get();
  const existing = snap.exists ? snap.data()! : null;

  let srsLevel = existing?.srs_level ?? 0;
  srsLevel = correct ? Math.min(srsLevel + 1, 9) : Math.max(srsLevel - 2, 0);

  const intervalHours = SRS_INTERVALS_HOURS[Math.min(srsLevel, SRS_INTERVALS_HOURS.length - 1)];
  const nextReview = new Date(Date.now() + intervalHours * 3_600_000);

  await reviewRef.set({
    vocab_id: vocabId,
    srs_level: srsLevel,
    next_review_at: nextReview.toISOString(),
    last_reviewed_at: new Date().toISOString(),
    correct_count:   (existing?.correct_count   ?? 0) + (correct ? 1 : 0),
    incorrect_count: (existing?.incorrect_count ?? 0) + (correct ? 0 : 1),
  }, { merge: true });

  // Increment profile stats
  await userRef(uid).update({
    total_reviews:   FieldValue.increment(1),
    correct_reviews: FieldValue.increment(correct ? 1 : 0),
    updated_at: new Date().toISOString(),
  });

  const xpGain = correct
    ? srsLevel >= 7 ? 15 : srsLevel >= 5 ? 10 : srsLevel >= 3 ? 8 : 5
    : 0;

  if (xpGain > 0) await addXP(xpGain);
  await updateStreak();
  await updateQuestProgress("review", 1);

  return { data: { srs_level: srsLevel, next_review: nextReview, xp_gained: xpGain } };
}

// ── Get Due Reviews ───────────────────────────────────────────────────────────
export async function getDueReviews(limit = 20): Promise<VocabItem[]> {
  const uid = await getCurrentUid();
  if (!uid) return [];

  const now = new Date().toISOString();
  const snap = await userRef(uid)
    .collection("reviews")
    .where("next_review_at", "<=", now)
    .orderBy("next_review_at", "asc")
    .limit(limit)
    .get();

  if (snap.empty) return [];

  // Load vocab items by id
  const { japaneseVocab } = await import("@/data/japanese-core-vocab");
  const ids = snap.docs.map((d) => Number(d.data().vocab_id));
  return japaneseVocab.filter((v) => ids.includes(v.id));
}

// ── Daily Quests ──────────────────────────────────────────────────────────────
export async function ensureDailyQuests() {
  const uid = await getCurrentUid();
  if (!uid) return;

  const today = new Date().toISOString().split("T")[0];
  const ref   = userRef(uid).collection("quests").doc(today);
  const snap  = await ref.get();

  if (snap.exists) return;

  await ref.set({
    quests: [
      { id: "q1", quest_type: "review",    target: 10, current_progress: 0, xp_reward: 50, completed: false, completed_at: null },
      { id: "q2", quest_type: "learn_new", target: 5,  current_progress: 0, xp_reward: 30, completed: false, completed_at: null },
      { id: "q3", quest_type: "games",     target: 1,  current_progress: 0, xp_reward: 40, completed: false, completed_at: null },
    ],
  });
}

export async function getDailyQuests() {
  const uid = await getCurrentUid();
  if (!uid) return [];

  const today = new Date().toISOString().split("T")[0];
  await ensureDailyQuests();
  const snap = await userRef(uid).collection("quests").doc(today).get();
  if (!snap.exists) return [];
  return (snap.data()?.quests ?? []) as {
    id: string; quest_type: string; target: number;
    current_progress: number; xp_reward: number;
    completed: boolean; completed_at: string | null;
  }[];
}

export async function updateQuestProgress(questType: string, increment = 1) {
  const uid = await getCurrentUid();
  if (!uid) return;

  const today = new Date().toISOString().split("T")[0];
  const ref   = userRef(uid).collection("quests").doc(today);
  const snap  = await ref.get();
  if (!snap.exists) return;

  const quests: any[] = snap.data()?.quests ?? [];
  let xpToAward = 0;

  const updated = quests.map((q) => {
    if (q.quest_type !== questType || q.completed) return q;
    const newProgress = Math.min(q.current_progress + increment, q.target);
    const completed   = newProgress >= q.target;
    if (completed) xpToAward = q.xp_reward;
    return {
      ...q,
      current_progress: newProgress,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    };
  });

  await ref.update({ quests: updated });
  if (xpToAward > 0) await addXP(xpToAward);
  revalidatePath("/dashboard");
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
export async function getLeaderboard() {
  if (!process.env.FIREBASE_PROJECT_ID) return [];
  const snap = await adminDb
    .collection("users")
    .orderBy("xp_this_week", "desc")
    .limit(10)
    .get();

  return snap.docs.map((d) => ({
    username:    d.data().username    ?? "?",
    avatar_skin: d.data().avatar_skin ?? "samurai",
    level:       d.data().level       ?? 1,
    xp_this_week:d.data().xp_this_week ?? 0,
  }));
}

// ── Badge Check ───────────────────────────────────────────────────────────────
const BADGE_DEFINITIONS = [
  { id: "first_step",    name: "Premier Pas",      emoji: "👣", condition_type: "reviews", condition_value: 1   },
  { id: "flame",         name: "Flamme Naissante",  emoji: "🔥", condition_type: "streak",  condition_value: 3   },
  { id: "warrior",       name: "Guerrier Assidu",   emoji: "⚔️",  condition_type: "reviews", condition_value: 50  },
  { id: "legend",        name: "Légende Vivante",   emoji: "🏯", condition_type: "streak",  condition_value: 7   },
  { id: "apprentice",    name: "Apprenti Samouraï", emoji: "🥷", condition_type: "level",   condition_value: 5   },
  { id: "confirmed",     name: "Samouraï Confirmé", emoji: "🎎", condition_type: "reviews", condition_value: 200 },
  { id: "dojo",          name: "Maître du Dojo",    emoji: "⛩️",  condition_type: "level",   condition_value: 10  },
  { id: "centurion",     name: "Centurion",         emoji: "💯", condition_type: "reviews", condition_value: 100 },
  { id: "scholar",       name: "Érudit",            emoji: "📚", condition_type: "streak",  condition_value: 30  },
  { id: "perfection",    name: "Perfection",        emoji: "✨", condition_type: "level",   condition_value: 20  },
];

async function checkAndAwardBadges(uid: string) {
  const profileSnap = await userRef(uid).get();
  if (!profileSnap.exists) return;

  const p = profileSnap.data()!;
  const badgesRef = userRef(uid).collection("badges");
  const earnedSnap = await badgesRef.get();
  const earned = new Set(earnedSnap.docs.map((d) => d.id));

  const batch = adminDb.batch();
  let changed = false;

  for (const badge of BADGE_DEFINITIONS) {
    if (earned.has(badge.id)) continue;
    const met =
      (badge.condition_type === "level"   && (p.level   ?? 0) >= badge.condition_value) ||
      (badge.condition_type === "streak"  && (p.streak  ?? 0) >= badge.condition_value) ||
      (badge.condition_type === "reviews" && (p.total_reviews ?? 0) >= badge.condition_value);
    if (met) {
      batch.set(badgesRef.doc(badge.id), { earned_at: new Date().toISOString() });
      changed = true;
    }
  }

  if (changed) await batch.commit();
}
