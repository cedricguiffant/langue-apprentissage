"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { AVATAR_EMOJI, getLevelTitle, type LeaderboardEntry } from "@/lib/types";

const RANK_STYLES = [
  { bg: "bg-yellow-500/15", border: "border-yellow-500/30", text: "text-yellow-400", medal: "🥇" },
  { bg: "bg-gray-400/10",   border: "border-gray-400/20",   text: "text-gray-300",   medal: "🥈" },
  { bg: "bg-amber-600/10",  border: "border-amber-600/20",  text: "text-amber-500",  medal: "🥉" },
];

interface Props {
  entries: LeaderboardEntry[];
  currentUsername?: string;
}

export default function Leaderboard({ entries, currentUsername }: Props) {
  return (
    <div className="glass rounded-2xl border border-jp-border overflow-hidden">
      <div className="px-5 py-4 border-b border-jp-border flex items-center gap-2">
        <Trophy className="w-4 h-4 text-jp-gold" />
        <h3 className="font-bold text-jp-text text-sm">Classement de la semaine</h3>
      </div>

      <div className="divide-y divide-jp-border/50">
        {entries.map((entry, i) => {
          const style = RANK_STYLES[i] ?? { bg: "", border: "border-transparent", text: "text-jp-muted", medal: "" };
          const isMe = entry.username === currentUsername;

          return (
            <motion.div key={entry.username}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${isMe ? "bg-jp-red/8" : "hover:bg-white/3"}`}>

              {/* Rank */}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${i < 3 ? `${style.bg} border ${style.border}` : "bg-jp-card2"}`}>
                {i < 3 ? style.medal : <span className={`text-xs font-bold ${style.text}`}>{i + 1}</span>}
              </div>

              {/* Avatar + name */}
              <div className="w-8 h-8 rounded-lg bg-jp-card2 flex items-center justify-center text-sm flex-shrink-0">
                {AVATAR_EMOJI[entry.avatar_skin] ?? "⚔️"}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isMe ? "text-jp-red-light" : "text-jp-text"}`}>
                  {entry.username}{isMe && " (toi)"}
                </p>
                <p className="text-xs text-jp-muted">Niv. {entry.level} · {getLevelTitle(entry.level)}</p>
              </div>

              {/* XP */}
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-bold text-jp-gold">{entry.xp_this_week.toLocaleString()}</p>
                <p className="text-xs text-jp-muted">XP</p>
              </div>
            </motion.div>
          );
        })}

        {entries.length === 0 && (
          <div className="px-5 py-8 text-center text-jp-muted text-sm">
            <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
            Aucune donnée cette semaine.<br />Sois le premier à jouer !
          </div>
        )}
      </div>
    </div>
  );
}
