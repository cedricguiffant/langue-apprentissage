import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { BookOpen, Gamepad2, Swords, Brain, Zap } from "lucide-react";
import StreakCounter from "@/components/StreakCounter";
import XPBar from "@/components/XPBar";
import DailyQuestPanel from "@/components/DailyQuest";
import Leaderboard from "@/components/Leaderboard";
import BadgeGrid from "@/components/BadgeGrid";
import type { UserProfile, DailyQuest, UserBadge, LeaderboardEntry } from "@/lib/types";

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_PROFILE: UserProfile = {
  id: "demo", username: "Samouraï", avatar_skin: "samurai",
  level: 1, xp: 0, xp_to_next_level: 100,
  streak: 0, longest_streak: 0, last_activity_date: null,
  total_reviews: 0, correct_reviews: 0,
  xp_this_week: 0, week_start: new Date().toISOString().split("T")[0],
  created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
};

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { username: "MasterKanji", level: 42, xp_this_week: 3200, avatar_skin: "samurai" },
  { username: "SakuraSan",   level: 38, xp_this_week: 2800, avatar_skin: "kawaii"  },
  { username: "RoninX",      level: 35, xp_this_week: 2400, avatar_skin: "shinobi" },
  { username: "TsukiHime",   level: 29, xp_this_week: 1900, avatar_skin: "kawaii"  },
  { username: "DragonJP",    level: 25, xp_this_week: 1500, avatar_skin: "samurai" },
];

const today = new Date().toISOString().split("T")[0];
const MOCK_QUESTS: DailyQuest[] = [
  { id: "q1", user_id: "demo", quest_date: today, quest_type: "review",    target: 10, current_progress: 0, xp_reward: 50, completed: false, completed_at: null, created_at: "" },
  { id: "q2", user_id: "demo", quest_date: today, quest_type: "learn_new", target: 5,  current_progress: 0, xp_reward: 30, completed: false, completed_at: null, created_at: "" },
  { id: "q3", user_id: "demo", quest_date: today, quest_type: "games",     target: 1,  current_progress: 0, xp_reward: 40, completed: false, completed_at: null, created_at: "" },
];

// ── Quick actions ─────────────────────────────────────────────────────────────
const ACTIONS = [
  { href: "/learn/srs",             icon: Brain,    label: "Révisions SRS",  sub: "Cartes à revoir",   color: "from-blue-500/20 to-blue-600/5",      border: "border-blue-500/25",    iconColor: "text-blue-400"    },
  { href: "/learn/games/matching",  icon: Gamepad2, label: "Matching Game",  sub: "Flip cards",        color: "from-emerald-500/20 to-emerald-600/5", border: "border-emerald-500/25", iconColor: "text-emerald-400" },
  { href: "/learn/games/vocab-duel",icon: Zap,      label: "Vocab Duel",     sub: "QCM + saisie",      color: "from-jp-gold/20 to-jp-gold/5",        border: "border-jp-gold/25",     iconColor: "text-jp-gold"     },
  { href: "/learn/games/boss-fight",icon: Swords,   label: "Boss Fight",     sub: "Affronte un Yokai", color: "from-jp-red/20 to-jp-red/5",          border: "border-jp-red/25",      iconColor: "text-jp-red-light"},
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  let profile: UserProfile = MOCK_PROFILE;
  let quests: DailyQuest[] = MOCK_QUESTS;
  let badges: UserBadge[] = [];
  let leaderboard: LeaderboardEntry[] = MOCK_LEADERBOARD;

  if (process.env.FIREBASE_PROJECT_ID) {
    try {
      const { getSessionUser, adminDb } = await import("@/lib/firebase-admin");
      const { ensureDailyQuests, getLeaderboard } = await import("@/lib/actions");
      const cookieStore = await cookies();
      const session = cookieStore.get("__session")?.value;
      const user = await getSessionUser(session);
      if (!user) redirect("/auth");

      const uid = user.uid;
      const [profileSnap, questSnap, badgeSnap, lb] = await Promise.all([
        adminDb.collection("users").doc(uid).get(),
        adminDb.collection("users").doc(uid).collection("quests").doc(today).get(),
        adminDb.collection("users").doc(uid).collection("badges").get(),
        getLeaderboard(),
      ]);

      if (profileSnap.exists) {
        profile = { id: uid, ...profileSnap.data() } as UserProfile;
      }

      // Ensure today's quests exist
      if (!questSnap.exists) await ensureDailyQuests();
      const freshQuestSnap = questSnap.exists
        ? questSnap
        : await adminDb.collection("users").doc(uid).collection("quests").doc(today).get();

      if (freshQuestSnap.exists) {
        const rawQuests: any[] = freshQuestSnap.data()?.quests ?? [];
        quests = rawQuests.map((q, i) => ({
          id: q.id ?? `q${i}`,
          user_id: uid,
          quest_date: today,
          quest_type: q.quest_type,
          target: q.target,
          current_progress: q.current_progress,
          xp_reward: q.xp_reward,
          completed: q.completed,
          completed_at: q.completed_at ?? null,
          created_at: "",
        }));
      }

      badges = badgeSnap.docs.map((d: import("firebase-admin/firestore").QueryDocumentSnapshot) => ({
        id: d.id,
        badge_id: d.id,
        earned_at: d.data().earned_at ?? "",
        badge: { id: d.id, name: d.id, icon: "🏅", description: "", condition_type: "reviews" as const, condition_value: 0 },
      })) as UserBadge[];

      leaderboard = lb;
    } catch {
      // Fall through to mock data
    }
  }

  const dateLabel = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const accuracy  = profile.total_reviews > 0
    ? Math.round((profile.correct_reviews / profile.total_reviews) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Welcome header */}
      <div className="mb-8">
        <p className="text-jp-muted text-sm mb-1 capitalize">{dateLabel}</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-jp-text">
          Salut, <span className="text-gradient-red">{profile.username}</span> 👋
        </h1>
        <p className="text-jp-muted text-sm mt-1">
          {profile.streak > 0
            ? `🔥 ${profile.streak} jour${profile.streak > 1 ? "s" : ""} de suite — continue comme ça !`
            : "Commence ta session pour allumer ta flamme !"}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Révisions",  value: profile.total_reviews.toLocaleString(), icon: "📚", color: "text-blue-400"    },
          { label: "Précision",  value: `${accuracy}%`,                          icon: "🎯", color: "text-emerald-400" },
          { label: "XP semaine", value: profile.xp_this_week.toLocaleString(),   icon: "⚡", color: "text-jp-gold"    },
          { label: "Badges",     value: `${badges.length}/10`,                   icon: "🏅", color: "text-purple-400"  },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="glass rounded-2xl p-4 border border-jp-border text-center">
            <p className="text-2xl mb-1">{icon}</p>
            <p className={`text-xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-jp-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left col */}
        <div className="lg:col-span-2 space-y-6">

          <XPBar level={profile.level} xp={profile.xp} xpToNext={profile.xp_to_next_level} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StreakCounter streak={profile.streak} longestStreak={profile.longest_streak} />
            <div className="glass rounded-2xl p-5 border border-jp-border flex flex-col justify-between">
              <p className="text-sm font-bold text-jp-text mb-3">Quêtes du jour ✨</p>
              <div className="space-y-2">
                {quests.slice(0, 3).map((q) => {
                  const pct = Math.min(100, Math.round((q.current_progress / q.target) * 100));
                  return (
                    <div key={q.id}>
                      <div className="flex justify-between text-xs text-jp-muted mb-0.5">
                        <span>{q.quest_type === "review" ? "Révisions" : q.quest_type === "learn_new" ? "Nouveaux mots" : "Mini-jeux"}</span>
                        <span>{q.current_progress}/{q.target}</span>
                      </div>
                      <div className="h-1.5 bg-jp-border rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${q.completed ? "bg-emerald-400" : "bg-jp-gold"}`}
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div>
            <h2 className="text-sm font-bold text-jp-muted uppercase tracking-wider mb-3">Actions rapides</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ACTIONS.map(({ href, icon: Icon, label, sub, color, border, iconColor }) => (
                <Link key={href} href={href}
                  className={`glass-hover rounded-2xl p-4 border ${border} bg-gradient-to-br ${color} flex flex-col items-center gap-2 text-center`}>
                  <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-jp-text text-xs leading-tight">{label}</p>
                    <p className="text-jp-muted text-xs mt-0.5">{sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <BadgeGrid earnedBadges={badges} compact />
        </div>

        {/* Right col */}
        <div className="space-y-6">
          <DailyQuestPanel quests={quests} />
          <Leaderboard entries={leaderboard} currentUsername={profile.username} />

          <div className="glass rounded-2xl p-5 border border-jp-red/20 bg-gradient-to-br from-jp-red/10 to-jp-red/5 text-center">
            <p className="font-jp text-2xl text-gradient-red mb-2">頑張れ！</p>
            <p className="text-xs text-jp-muted mb-4">Tu peux le faire ! Chaque révision te rapproche de la maîtrise.</p>
            <Link href="/learn/srs" className="btn-red text-sm py-2.5 px-5 rounded-xl inline-flex">
              <BookOpen className="w-4 h-4" />Commencer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
