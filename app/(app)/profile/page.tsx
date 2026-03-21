"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Shield, TrendingUp, Calendar, Trophy, Flame, BookOpen } from "lucide-react";
import { AVATAR_EMOJI, getLevelTitle } from "@/lib/types";
import type { UserProfile, UserBadge } from "@/lib/types";
import BadgeGrid from "@/components/BadgeGrid";

const MOCK_PROFILE: UserProfile = {
  id: "demo", username: "Samouraï", avatar_skin: "samurai",
  level: 1, xp: 0, xp_to_next_level: 100,
  streak: 0, longest_streak: 0, last_activity_date: null,
  total_reviews: 0, correct_reviews: 0,
  xp_this_week: 0, week_start: new Date().toISOString().split("T")[0],
  created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
};

const SKINS = Object.keys(AVATAR_EMOJI) as Array<keyof typeof AVATAR_EMOJI>;

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(MOCK_PROFILE);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [selectedSkin, setSelectedSkin] = useState<keyof typeof AVATAR_EMOJI>("samurai");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) { setLoading(false); return; }
      try {
        const { clientAuth, clientDb } = await import("@/lib/firebase");
        const { onAuthStateChanged } = await import("firebase/auth");
        const { doc, getDoc, collection, getDocs } = await import("firebase/firestore");

        onAuthStateChanged(clientAuth, async (user) => {
          if (!user) { setLoading(false); return; }

          const [profSnap, badgeSnap] = await Promise.all([
            getDoc(doc(clientDb, "users", user.uid)),
            getDocs(collection(clientDb, "users", user.uid, "badges")),
          ]);

          if (profSnap.exists()) {
            const p = { id: user.uid, ...profSnap.data() } as UserProfile;
            setProfile(p);
            setSelectedSkin(p.avatar_skin as keyof typeof AVATAR_EMOJI);
          }

          const BADGE_DEFS: Record<string, { name: string; emoji: string }> = {
            first_step:  { name: "Premier Pas",      emoji: "👣" },
            flame:       { name: "Flamme Naissante",  emoji: "🔥" },
            warrior:     { name: "Guerrier Assidu",   emoji: "⚔️"  },
            legend:      { name: "Légende Vivante",   emoji: "🏯" },
            apprentice:  { name: "Apprenti Samouraï", emoji: "🥷" },
            confirmed:   { name: "Samouraï Confirmé", emoji: "🎎" },
            dojo:        { name: "Maître du Dojo",    emoji: "⛩️"  },
            centurion:   { name: "Centurion",         emoji: "💯" },
            scholar:     { name: "Érudit",            emoji: "📚" },
            perfection:  { name: "Perfection",        emoji: "✨" },
          };

          setBadges(badgeSnap.docs.map((d) => ({
            id: d.id,
            user_id: user.uid,
            badge_id: d.id,
            earned_at: d.data().earned_at,
            badge: {
              id: d.id,
              name: BADGE_DEFS[d.id]?.name ?? d.id,
              emoji: BADGE_DEFS[d.id]?.emoji ?? "🏅",
              description: "",
              condition_type: "",
              condition_value: 0,
              created_at: "",
            },
          })) as UserBadge[]);

          setLoading(false);
        });
      } catch {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function saveAvatar() {
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) return;
    setSaving(true);
    try {
      const { clientAuth, clientDb } = await import("@/lib/firebase");
      const { doc, updateDoc } = await import("firebase/firestore");
      const user = clientAuth.currentUser;
      if (user) {
        await updateDoc(doc(clientDb, "users", user.uid), { avatar_skin: selectedSkin });
        setProfile((p) => ({ ...p, avatar_skin: selectedSkin }));
      }
    } catch { /* ignore */ }
    setSaving(false);
  }

  const accuracy = profile.total_reviews > 0
    ? Math.round((profile.correct_reviews / profile.total_reviews) * 100)
    : 0;
  const memberSince = new Date(profile.created_at).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 rounded-full border-2 border-jp-gold border-t-transparent animate-spin" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="glass rounded-3xl border border-jp-border p-6 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <motion.div whileHover={{ scale: 1.05 }}
          className="w-24 h-24 rounded-2xl bg-jp-card border border-jp-border flex items-center justify-center text-5xl flex-shrink-0">
          {AVATAR_EMOJI[profile.avatar_skin as keyof typeof AVATAR_EMOJI] ?? "🥷"}
        </motion.div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <h1 className="text-2xl font-black text-jp-text">{profile.username}</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-jp-gold/20 text-jp-gold">Niv. {profile.level}</span>
          </div>
          <p className="text-jp-muted text-sm mt-0.5">{getLevelTitle(profile.level)}</p>
          <div className="flex items-center gap-1 mt-1 justify-center sm:justify-start">
            <Calendar className="w-3.5 h-3.5 text-jp-muted" />
            <span className="text-xs text-jp-muted">Membre depuis le {memberSince}</span>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-jp-muted mb-1">
              <span>{profile.xp} XP</span>
              <span>{profile.xp_to_next_level} XP</span>
            </div>
            <div className="xp-track">
              <div className="xp-fill" style={{ width: `${Math.min(100, (profile.xp / profile.xp_to_next_level) * 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { icon: BookOpen, label: "Révisions",     value: profile.total_reviews.toLocaleString(), color: "text-blue-400"    },
          { icon: Shield,   label: "Précision",      value: `${accuracy}%`,                         color: "text-emerald-400" },
          { icon: Flame,    label: "Série actuelle", value: `${profile.streak}j`,                   color: "text-orange-400"  },
          { icon: Trophy,   label: "Meilleure série",value: `${profile.longest_streak}j`,           color: "text-jp-gold"     },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="glass rounded-2xl p-4 border border-jp-border text-center">
            <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
            <p className={`text-xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-jp-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Avatar picker */}
      <div className="glass rounded-3xl border border-jp-border p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-jp-gold" />
          <h2 className="font-bold text-jp-text">Choisir un avatar</h2>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
          {SKINS.map((skin) => (
            <button key={skin} onClick={() => setSelectedSkin(skin)}
              className={`rounded-2xl h-16 text-3xl flex items-center justify-center border transition-all duration-200 ${
                selectedSkin === skin
                  ? "border-jp-gold bg-jp-gold/15 scale-105"
                  : "border-jp-border bg-jp-card hover:border-jp-gold/40 hover:scale-105"
              }`}>
              {AVATAR_EMOJI[skin]}
            </button>
          ))}
        </div>
        {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && selectedSkin !== profile.avatar_skin && (
          <button onClick={saveAvatar} disabled={saving} className="btn-gold text-sm py-2 px-5 rounded-xl mt-4">
            {saving ? "Sauvegarde…" : "Sauvegarder"}
          </button>
        )}
      </div>

      <BadgeGrid earnedBadges={badges} />

      <div className="glass rounded-3xl border border-jp-border p-6 mt-6">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-jp-gold" />
          <h2 className="font-bold text-jp-text">XP cette semaine</h2>
        </div>
        <p className="text-3xl font-black text-jp-gold">{profile.xp_this_week.toLocaleString()} XP</p>
        <p className="text-xs text-jp-muted mt-1">Continue comme ça pour grimper dans le classement !</p>
      </div>
    </div>
  );
}
