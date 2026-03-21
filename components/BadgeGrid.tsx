"use client";

import { motion } from "framer-motion";
import { Award } from "lucide-react";
import type { UserBadge, Badge } from "@/lib/types";

const ALL_BADGES: Badge[] = [
  { id: "first_step",  name: "Premier Pas",       description: "Complète ta première révision",  icon: "🌸", condition_type: "reviews",        condition_value: 1   },
  { id: "streak_3",    name: "Flamme Naissante",   description: "3 jours de suite",               icon: "🔥", condition_type: "streak",         condition_value: 3   },
  { id: "streak_7",    name: "Guerrier Assidu",    description: "7 jours de suite",               icon: "⚔️", condition_type: "streak",         condition_value: 7   },
  { id: "streak_30",   name: "Légende Vivante",    description: "30 jours de suite",              icon: "🏯", condition_type: "streak",         condition_value: 30  },
  { id: "level_5",     name: "Apprenti Samouraï",  description: "Atteins le niveau 5",            icon: "🗡️", condition_type: "level",          condition_value: 5   },
  { id: "level_10",    name: "Samouraï Confirmé",  description: "Atteins le niveau 10",           icon: "🎌", condition_type: "level",          condition_value: 10  },
  { id: "level_25",    name: "Maître du Dojo",     description: "Atteins le niveau 25",           icon: "⛩️", condition_type: "level",          condition_value: 25  },
  { id: "reviews_100", name: "Centurion",          description: "100 révisions complétées",       icon: "📚", condition_type: "reviews",        condition_value: 100 },
  { id: "reviews_500", name: "Érudit",             description: "500 révisions complétées",       icon: "🎓", condition_type: "reviews",        condition_value: 500 },
  { id: "perfect_10",  name: "Perfection",         description: "10 réponses correctes d'affilée",icon: "✨", condition_type: "perfect_session",condition_value: 10  },
];

interface Props {
  earnedBadges: UserBadge[];
  compact?: boolean;
}

export default function BadgeGrid({ earnedBadges, compact = false }: Props) {
  const earnedIds = new Set(earnedBadges.map((b) => b.badge_id));
  const earnedCount = earnedIds.size;

  return (
    <div className="glass rounded-2xl border border-jp-border overflow-hidden">
      <div className="px-5 py-4 border-b border-jp-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-jp-gold" />
          <h3 className="font-bold text-jp-text text-sm">Badges</h3>
        </div>
        <span className="text-xs text-jp-muted">
          <span className="text-jp-gold font-semibold">{earnedCount}</span>/{ALL_BADGES.length}
        </span>
      </div>

      <div className={`p-4 grid ${compact ? "grid-cols-5" : "grid-cols-5 sm:grid-cols-5"} gap-3`}>
        {ALL_BADGES.map((badge, i) => {
          const unlocked = earnedIds.has(badge.id);
          const earned = earnedBadges.find((b) => b.badge_id === badge.id);

          return (
            <motion.div key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              title={`${badge.name}: ${badge.description}${earned ? `\nObtenu le ${new Date(earned.earned_at).toLocaleDateString("fr-FR")}` : " (verrouillé)"}`}
              className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl border cursor-default transition-all duration-200 ${
                unlocked
                  ? "bg-jp-gold/10 border-jp-gold/30 hover:border-jp-gold/60"
                  : "bg-jp-card2/50 border-jp-border opacity-40 grayscale"
              }`}>

              <span className="text-2xl leading-none">{badge.icon}</span>
              {!compact && (
                <p className="text-xs text-center leading-tight text-jp-text font-medium line-clamp-2">
                  {badge.name}
                </p>
              )}
              {unlocked && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-jp-dark"
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
