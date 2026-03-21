"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Trophy, RotateCcw, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getRandomVocab } from "@/data/japanese-core-vocab";
import type { VocabItem } from "@/data/japanese-core-vocab";

const GRID_SIZE = 6; // 6 pairs = 12 cards

interface Card {
  id: string;
  vocabId: number;
  type: "japanese" | "french";
  text: string;
  matched: boolean;
  flipped: boolean;
}

function buildDeck(items: VocabItem[]): Card[] {
  const cards: Card[] = [];
  items.slice(0, GRID_SIZE).forEach((item) => {
    cards.push({ id: `${item.id}-jp`, vocabId: item.id, type: "japanese", text: item.japanese, matched: false, flipped: false });
    cards.push({ id: `${item.id}-fr`, vocabId: item.id, type: "french", text: item.french, matched: false, flipped: false });
  });
  return cards.sort(() => Math.random() - 0.5);
}

export default function MatchingPage() {
  const { toast } = useToast();
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [errors, setErrors] = useState(0);
  const [matches, setMatches] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startGame = useCallback(() => {
    const items = getRandomVocab(GRID_SIZE);
    setCards(buildDeck(items));
    setSelected([]);
    setErrors(0);
    setMatches(0);
    setSeconds(0);
    setDone(false);
    setRunning(true);
  }, []);

  useEffect(() => { startGame(); }, [startGame]);

  useEffect(() => {
    if (running && !done) {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running, done]);

  const flipCard = useCallback((id: string) => {
    if (selected.length >= 2) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.matched || card.flipped) return;

    const newSelected = [...selected, id];
    setCards((prev) => prev.map((c) => c.id === id ? { ...c, flipped: true } : c));
    setSelected(newSelected);

    if (newSelected.length === 2) {
      const [a, b] = newSelected.map((sid) => cards.find((c) => c.id === sid)!);
      const isMatch = a.vocabId === b.vocabId && a.type !== b.type;

      setTimeout(() => {
        if (isMatch) {
          setCards((prev) => prev.map((c) => newSelected.includes(c.id) ? { ...c, matched: true, flipped: false } : c));
          setMatches((m) => {
            const next = m + 1;
            if (next === GRID_SIZE) {
              setDone(true);
              setRunning(false);
              toast({ title: "Parfait ! 🎉", description: "Toutes les paires trouvées !", variant: "success" });
              if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
                import("@/lib/actions").then(({ addXP, updateQuestProgress }) => {
                  addXP(20);
                  updateQuestProgress("games", 1);
                }).catch(() => {});
              }
            }
            return next;
          });
        } else {
          setCards((prev) => prev.map((c) => newSelected.includes(c.id) ? { ...c, flipped: false } : c));
          setErrors((e) => e + 1);
        }
        setSelected([]);
      }, 900);
    }
  }, [cards, selected, toast]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const stars = done
    ? errors === 0 ? 3 : errors <= 3 ? 2 : 1
    : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-jp-text">Matching Game</h1>
          <p className="text-xs text-jp-muted">Associe chaque mot à sa traduction</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-jp-gold">
            <Timer className="w-4 h-4" />
            <span className="font-mono text-sm font-bold">{fmt(seconds)}</span>
          </div>
          <div className="text-sm text-jp-muted">
            ❌ <span className="text-red-400 font-bold">{errors}</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-10"
          >
            <Trophy className="w-14 h-14 text-jp-gold mx-auto mb-3" />
            <h2 className="text-2xl font-black text-jp-text mb-1">Terminé !</h2>
            <div className="flex justify-center gap-1 mb-4">
              {[1, 2, 3].map((n) => (
                <Star
                  key={n}
                  className={`w-7 h-7 ${n <= stars ? "text-jp-gold fill-jp-gold" : "text-jp-border"}`}
                />
              ))}
            </div>
            <div className="flex gap-4 justify-center mb-6">
              <div className="glass rounded-2xl px-5 py-3 border border-jp-border">
                <p className="text-lg font-black text-jp-text">{fmt(seconds)}</p>
                <p className="text-xs text-jp-muted">Temps</p>
              </div>
              <div className="glass rounded-2xl px-5 py-3 border border-jp-border">
                <p className="text-lg font-black text-red-400">{errors}</p>
                <p className="text-xs text-jp-muted">Erreurs</p>
              </div>
            </div>
            <button onClick={startGame} className="btn-gold text-sm py-2.5 px-6 rounded-xl inline-flex">
              <RotateCcw className="w-4 h-4" />Rejouer
            </button>
          </motion.div>
        ) : (
          <motion.div key="grid" className="grid grid-cols-4 gap-3">
            {cards.map((card) => (
              <motion.button
                key={card.id}
                onClick={() => flipCard(card.id)}
                disabled={card.matched || selected.length >= 2}
                layout
                whileHover={!card.matched && selected.length < 2 ? { scale: 1.04 } : {}}
                whileTap={!card.matched && selected.length < 2 ? { scale: 0.97 } : {}}
                className={`rounded-2xl p-3 min-h-[80px] flex items-center justify-center text-center transition-all duration-300 select-none font-medium text-sm leading-tight border ${
                  card.matched
                    ? "opacity-0 pointer-events-none border-transparent"
                    : card.flipped
                    ? card.type === "japanese"
                      ? "glass border-jp-gold/40 bg-jp-gold/10 text-jp-gold font-jp text-lg"
                      : "glass border-blue-500/40 bg-blue-500/10 text-blue-300"
                    : "glass border-jp-border hover:border-jp-gold/30 text-jp-muted cursor-pointer"
                }`}
              >
                {card.flipped || card.matched ? card.text : "？"}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
