"use client";

import { motion } from "framer-motion";
import { BookOpen, Gamepad2, Flame, Sparkles, CheckCircle2 } from "lucide-react";
import type { DailyQuest } from "@/lib/types";

const QUEST_CONFIG = {
  review:    { icon: BookOpen,   label: "Révisions SRS",  color: "text-blue-400",    bg: "bg-blue-500/10",   border: "border-blue-500/20" },
  learn_new: { icon: Sparkles,   label: "Nouveaux mots",  color: "text-purple-400",  bg: "bg-purple-500/10", border: "border-purple-500/20" },
  games:     { icon: Gamepad2,   label: "Mini-jeux",      color: "text-emerald-400", bg: "bg-emerald-500/10",border: "border-emerald-500/20" },
  streak:    { icon: Flame,      label: "Maintien streak",color: "text-orange-400",  bg: "bg-orange-500/10", border: "border-orange-500/20" },
};

interface Props {
  quests: DailyQuest[];
}

export default function DailyQuestPanel({ quests }: Props) {
  const totalXP = quests.filter((q) => q.completed).reduce((s, q) => s + q.xp_reward, 0);
  const maxXP   = quests.reduce((s, q) => s + q.xp_reward, 0);

  return (
    <div className="glass rounded-2xl border border-jp-border overflow-hidden">
      <div className="px-5 py-4 border-b border-jp-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-jp-gold" />
          <h3 className="font-bold text-jp-text text-sm">Quêtes du jour</h3>
        </div>
        <span className="text-xs font-semibold text-jp-gold bg-jp-gold/10 border border-jp-gold/20 px-2.5 py-0.5 rounded-full">
          {totalXP}/{maxXP} XP
        </span>
      </div>

      <div className="p-4 space-y-3">
        {quests.map((quest, i) => {
          const cfg = QUEST_CONFIG[quest.quest_type] ?? QUEST_CONFIG.review;
          const Icon = cfg.icon;
          const pct = Math.min(100, Math.round((quest.current_progress / quest.target) * 100));

          return (
            <motion.div key={quest.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-xl p-4 border ${cfg.border} ${cfg.bg} ${quest.completed ? "opacity-80" : ""}`}>

              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${cfg.color}`}>
                    {quest.completed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-semibold text-jp-text text-sm">{cfg.label}</p>
                    <p className="text-xs text-jp-muted">
                      {quest.current_progress}/{quest.target} · {quest.xp_reward} XP
                    </p>
                  </div>
                </div>
                {quest.completed && (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 rounded-full">
                    Terminé ✓
                  </span>
                )}
              </div>

              <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${quest.completed ? "bg-emerald-400" : `bg-gradient-to-r from-[currentColor] to-[currentColor] ${cfg.color}`}`}
                  style={{ backgroundColor: quest.completed ? "#4ADE80" : undefined }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.7, delay: i * 0.1, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          );
        })}

        {quests.length === 0 && (
          <div className="text-center py-6 text-jp-muted text-sm">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30" />
            Les quêtes se génèrent au premier lancement du jour.
          </div>
        )}
      </div>
    </div>
  );
}
