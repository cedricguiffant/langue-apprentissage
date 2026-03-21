"use client";

import { motion } from "framer-motion";

interface Props {
  streak: number;
  longestStreak: number;
}

export default function StreakCounter({ streak, longestStreak }: Props) {
  const isActive = streak > 0;
  const intensity = streak >= 30 ? "legendary" : streak >= 7 ? "high" : streak >= 3 ? "mid" : "low";

  const glowMap = {
    legendary: "0 0 30px rgba(255,100,0,0.8), 0 0 60px rgba(255,50,0,0.4)",
    high:      "0 0 20px rgba(255,140,0,0.7), 0 0 40px rgba(255,100,0,0.3)",
    mid:       "0 0 15px rgba(255,160,0,0.5)",
    low:       "0 0 8px rgba(255,180,0,0.3)",
  };

  return (
    <div className="glass rounded-2xl p-5 border border-orange-500/15 flex flex-col items-center gap-2">
      <motion.div
        animate={isActive ? { scale: [1, 1.08, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-5xl"
        style={{ filter: isActive ? glowMap[intensity] : "none" }}
      >
        {isActive ? "🔥" : "💧"}
      </motion.div>

      <div className="text-center">
        <motion.p
          key={streak}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-3xl font-black text-orange-400 leading-none"
        >
          {streak}
        </motion.p>
        <p className="text-xs text-jp-muted mt-0.5">
          {streak === 1 ? "jour" : "jours"} de suite
        </p>
      </div>

      {longestStreak > 0 && (
        <p className="text-xs text-jp-muted border-t border-jp-border pt-2 w-full text-center mt-1">
          Record : <span className="text-jp-gold font-semibold">{longestStreak}</span>
        </p>
      )}
    </div>
  );
}
