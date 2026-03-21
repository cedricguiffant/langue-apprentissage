"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getLevelTitle } from "@/lib/types";

interface Props {
  level: number;
  xp: number;
  xpToNext: number;
  showTitle?: boolean;
}

export default function XPBar({ level, xp, xpToNext, showTitle = true }: Props) {
  const [width, setWidth] = useState(0);
  const pct = Math.min(100, Math.round((xp / xpToNext) * 100));

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 100);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div className="glass rounded-2xl p-5 border border-jp-gold/15">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
            <span className="font-black text-jp-dark text-sm">{level}</span>
          </div>
          <div>
            <p className="font-bold text-jp-text text-sm">Niveau {level}</p>
            {showTitle && (
              <p className="text-xs text-jp-muted">{getLevelTitle(level)}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-jp-gold font-semibold text-sm">{xp.toLocaleString()}</p>
          <p className="text-xs text-jp-muted">/ {xpToNext.toLocaleString()} XP</p>
        </div>
      </div>

      <div className="xp-track">
        <motion.div
          className="xp-fill"
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-jp-muted">{pct}%</span>
        <span className="text-xs text-jp-muted">
          {(xpToNext - xp).toLocaleString()} XP pour le niveau {level + 1}
        </span>
      </div>
    </div>
  );
}
