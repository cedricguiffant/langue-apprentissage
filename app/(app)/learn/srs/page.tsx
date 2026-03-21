"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronRight, Trophy, RotateCcw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { VocabItem } from "@/data/japanese-core-vocab";
import { getRandomVocab } from "@/data/japanese-core-vocab";

type CardState = "front" | "back" | "grading";

interface SessionCard {
  item: VocabItem;
  result?: "correct" | "wrong";
}

const SESSION_SIZE = 10;

export default function SrsPage() {
  const { toast } = useToast();
  const [deck, setDeck] = useState<SessionCard[]>([]);
  const [index, setIndex] = useState(0);
  const [cardState, setCardState] = useState<CardState>("front");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showRomaji, setShowRomaji] = useState(false);

  const loadDeck = useCallback(async () => {
    setLoading(true);
    setDone(false);
    setIndex(0);
    setCardState("front");
    setShowRomaji(false);

    let items: VocabItem[] = [];

    // Try real due reviews first
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const { getDueReviews } = await import("@/lib/actions");
        const due = await getDueReviews(SESSION_SIZE);
        items = due;
      } catch {
        // fall through
      }
    }

    // Fall back to random vocab
    if (items.length === 0) {
      items = getRandomVocab(SESSION_SIZE);
    }

    setDeck(items.map((item) => ({ item })));
    setLoading(false);
  }, []);

  useEffect(() => { loadDeck(); }, [loadDeck]);

  const current = deck[index];
  const correct = deck.filter((c) => c.result === "correct").length;
  const wrong = deck.filter((c) => c.result === "wrong").length;

  function flipCard() {
    if (cardState === "front") setCardState("back");
  }

  async function grade(result: "correct" | "wrong") {
    if (!current || saving) return;
    setSaving(true);

    const updated = [...deck];
    updated[index] = { ...current, result };
    setDeck(updated);

    // Save to Supabase
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const { saveReview, addXP, updateQuestProgress } = await import("@/lib/actions");
        await saveReview(current.item.id, result === "correct");
        if (result === "correct") {
          await addXP(5);
          await updateQuestProgress("review", 1);
        }
      } catch {
        // offline — continue anyway
      }
    }

    setSaving(false);

    if (index + 1 >= deck.length) {
      setDone(true);
      const pct = Math.round(((correct + (result === "correct" ? 1 : 0)) / deck.length) * 100);
      toast({
        title: "Session terminée ! 🎉",
        description: `${pct}% de précision — ${correct + (result === "correct" ? 1 : 0)}/${deck.length} correct${correct !== 1 ? "s" : ""}`,
        variant: "success",
      });
    } else {
      setIndex(index + 1);
      setCardState("front");
      setShowRomaji(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-jp-gold" />
      </div>
    );
  }

  if (done) {
    const pct = Math.round((correct / deck.length) * 100);
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
          <Trophy className="w-16 h-16 text-jp-gold mx-auto mb-4" />
          <h1 className="text-3xl font-black text-jp-text mb-2">Session terminée !</h1>
          <p className="text-jp-muted mb-8">Tu as revu {deck.length} cartes</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Précision", value: `${pct}%`, color: pct >= 80 ? "text-emerald-400" : pct >= 60 ? "text-jp-gold" : "text-red-400" },
              { label: "Corrects", value: correct, color: "text-emerald-400" },
              { label: "Erreurs", value: wrong, color: "text-red-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass rounded-2xl p-4 border border-jp-border">
                <p className={`text-2xl font-black ${color}`}>{value}</p>
                <p className="text-xs text-jp-muted mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <button onClick={loadDeck} className="btn-gold text-sm py-2.5 px-6 rounded-xl inline-flex">
              <RotateCcw className="w-4 h-4" />Nouvelle session
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!current) return null;

  const progress = ((index) / deck.length) * 100;

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-jp-muted mb-2">
          <span>Carte {index + 1} / {deck.length}</span>
          <span className="text-emerald-400">{correct} ✓</span>
        </div>
        <div className="xp-track">
          <motion.div
            className="xp-fill"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="flip-card w-full" style={{ minHeight: 280 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${index}-${cardState}`}
            initial={{ opacity: 0, rotateY: cardState === "back" ? -90 : 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: cardState === "back" ? 90 : -90 }}
            transition={{ duration: 0.3 }}
            className={`glass rounded-3xl border p-8 flex flex-col items-center justify-center gap-4 cursor-pointer select-none ${
              cardState === "front" ? "border-jp-border" : "border-jp-gold/30"
            }`}
            style={{ minHeight: 280 }}
            onClick={cardState === "front" ? flipCard : undefined}
          >
            {cardState === "front" ? (
              <>
                <p className="text-7xl font-jp kanji-hero leading-none">{current.item.japanese}</p>
                <p className="text-jp-muted text-sm">Clique pour révéler</p>
                <div className="flex gap-2 mt-2">
                  <span className="pill-new">{current.item.jlpt}</span>
                  <span className="text-xs text-jp-muted bg-jp-border/30 px-2.5 py-0.5 rounded-full">{current.item.category}</span>
                </div>
              </>
            ) : (
              <>
                <p className="text-5xl font-jp kanji-hero leading-none">{current.item.japanese}</p>
                <div className="text-center space-y-1">
                  <p className="text-xl font-semibold text-jp-text">{current.item.kana}</p>
                  {showRomaji && <p className="text-sm text-jp-muted italic">{current.item.romaji}</p>}
                  <p className="text-lg text-jp-gold font-bold">{current.item.french}</p>
                  <p className="text-xs text-jp-muted capitalize">{current.item.pos}</p>
                </div>
                {current.item.exampleJp && (
                  <div className="w-full mt-2 p-3 bg-jp-dark/50 rounded-xl border border-jp-border/50 text-center">
                    <p className="text-sm text-jp-text font-jp">{current.item.exampleJp}</p>
                    <p className="text-xs text-jp-muted mt-1">{current.item.exampleFr}</p>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="mt-6 flex flex-col gap-3">
        {cardState === "front" ? (
          <div className="flex gap-3">
            <button
              onClick={() => setShowRomaji(!showRomaji)}
              className="btn-ghost flex-1 text-sm py-2.5 rounded-xl"
            >
              {showRomaji ? "Cacher" : "Romaji"}
            </button>
            <button onClick={flipCard} className="btn-gold flex-1 text-sm py-2.5 rounded-xl inline-flex">
              Retourner <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => grade("wrong")}
              disabled={saving}
              className="flex-1 btn-jp rounded-xl py-3 text-sm font-bold text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-all"
            >
              <XCircle className="w-5 h-5" />Difficile
            </button>
            <button
              onClick={() => grade("correct")}
              disabled={saving}
              className="flex-1 btn-jp rounded-xl py-3 text-sm font-bold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all"
            >
              <CheckCircle2 className="w-5 h-5" />Maîtrisé
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
