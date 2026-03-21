"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, CheckCircle2, XCircle, Trophy, RotateCcw, Keyboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getRandomVocab } from "@/data/japanese-core-vocab";
import type { VocabItem } from "@/data/japanese-core-vocab";

const ROUND_COUNT = 10;
const CHOICES = 4;
const TIME_PER_Q = 12; // seconds

type Mode = "mcq" | "type";
type Phase = "playing" | "feedback" | "done";

interface Round {
  item: VocabItem;
  choices: string[];
  correct: string;
  mode: Mode;
}

function buildRounds(items: VocabItem[]): Round[] {
  const pool = getRandomVocab(40);
  return items.slice(0, ROUND_COUNT).map((item, i) => {
    const mode: Mode = i % 3 === 2 ? "type" : "mcq";
    const wrong = pool.filter((p) => p.id !== item.id).sort(() => Math.random() - 0.5).slice(0, CHOICES - 1).map((p) => p.french);
    const choices = [...wrong, item.french].sort(() => Math.random() - 0.5);
    return { item, choices, correct: item.french, mode };
  });
}

export default function VocabDuelPage() {
  const { toast } = useToast();
  const [rounds, setRounds] = useState<Round[]>([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("playing");
  const [selected, setSelected] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const start = useCallback(() => {
    const items = getRandomVocab(ROUND_COUNT);
    setRounds(buildRounds(items));
    setIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setPhase("playing");
    setSelected(null);
    setTyped("");
    setTimeLeft(TIME_PER_Q);
  }, []);

  useEffect(() => { start(); }, [start]);

  const round = rounds[index];

  // Timer
  useEffect(() => {
    if (phase !== "playing" || !round) return;
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          handleAnswer("__timeout__");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, phase]);

  useEffect(() => {
    if (phase === "playing" && round?.mode === "type") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [phase, round?.mode, index]);

  function handleAnswer(answer: string) {
    if (phase !== "playing" || !round) return;
    const isCorrect = answer.trim().toLowerCase() === round.correct.toLowerCase();

    setSelected(answer);
    setPhase("feedback");

    if (isCorrect) {
      const bonus = Math.ceil(timeLeft / 3);
      setScore((s) => s + 10 + bonus);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      if (index + 1 >= ROUND_COUNT) {
        setPhase("done");
        if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
          import("@/lib/actions").then(({ addXP, updateQuestProgress }) => {
            addXP(15);
            updateQuestProgress("games", 1);
          }).catch(() => {});
        }
        toast({ title: "Duel terminé ! ⚡", variant: "success" });
      } else {
        setIndex((i) => i + 1);
        setPhase("playing");
        setSelected(null);
        setTyped("");
        setTimeLeft(TIME_PER_Q);
      }
    }, 1400);
  }

  if (!round || rounds.length === 0) return null;

  const progress = (index / ROUND_COUNT) * 100;
  const timeColor = timeLeft <= 3 ? "text-red-400" : timeLeft <= 6 ? "text-jp-gold" : "text-emerald-400";

  if (phase === "done") {
    const pct = Math.round((score / (ROUND_COUNT * (10 + Math.ceil(TIME_PER_Q / 3)))) * 100);
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
          <Trophy className="w-14 h-14 text-jp-gold mx-auto mb-3" />
          <h1 className="text-3xl font-black text-jp-text mb-1">Duel terminé !</h1>
          <p className="text-jp-muted mb-8">Voici tes résultats</p>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: "Score", value: score, color: "text-jp-gold" },
              { label: "Meilleure série", value: `×${bestStreak}`, color: "text-jp-red-light" },
              { label: "Efficacité", value: `${pct}%`, color: "text-blue-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass rounded-2xl p-4 border border-jp-border">
                <p className={`text-xl font-black ${color}`}>{value}</p>
                <p className="text-xs text-jp-muted mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <button onClick={start} className="btn-gold text-sm py-2.5 px-6 rounded-xl inline-flex">
            <RotateCcw className="w-4 h-4" />Rejouer
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-jp-gold" />
          <span className="font-bold text-jp-gold text-lg">{score}</span>
          {streak >= 2 && (
            <motion.span
              key={streak}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-xs font-bold text-jp-red-light bg-jp-red/20 px-2 py-0.5 rounded-full"
            >
              ×{streak} série !
            </motion.span>
          )}
        </div>
        <div className={`font-mono font-black text-2xl ${timeColor}`}>{timeLeft}</div>
      </div>

      {/* Progress */}
      <div className="xp-track mb-6">
        <motion.div className="xp-fill" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
        >
          <div className="glass rounded-3xl border border-jp-border p-8 text-center mb-6">
            <p className="text-xs text-jp-muted mb-3 uppercase tracking-wider">
              {round.mode === "type" ? <><Keyboard className="w-3.5 h-3.5 inline mr-1" />Écris la traduction</> : "Choisis la traduction"}
            </p>
            <p className="text-6xl font-jp kanji-hero leading-none mb-2">{round.item.japanese}</p>
            <p className="text-jp-muted text-sm">{round.item.kana}</p>
            <div className="flex gap-2 justify-center mt-3">
              <span className="pill-new">{round.item.jlpt}</span>
              <span className="text-xs text-jp-muted bg-jp-border/30 px-2.5 py-0.5 rounded-full">{round.item.pos}</span>
            </div>
          </div>

          {/* Timer bar */}
          <div className="h-1 bg-jp-border rounded-full mb-6 overflow-hidden">
            <motion.div
              className={`h-full rounded-full transition-colors ${timeLeft <= 3 ? "bg-red-400" : timeLeft <= 6 ? "bg-jp-gold" : "bg-emerald-400"}`}
              animate={{ width: `${(timeLeft / TIME_PER_Q) * 100}%` }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </div>

          {round.mode === "mcq" ? (
            <div className="grid grid-cols-2 gap-3">
              {round.choices.map((choice) => {
                const isCorrect = choice === round.correct;
                const isSelected = choice === selected;
                let bg = "glass border-jp-border hover:border-jp-gold/30 hover:bg-jp-gold/5";
                if (phase === "feedback") {
                  bg = isCorrect
                    ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-300"
                    : isSelected
                    ? "border-red-500/60 bg-red-500/15 text-red-300"
                    : "glass border-jp-border opacity-40";
                }
                return (
                  <button
                    key={choice}
                    onClick={() => handleAnswer(choice)}
                    disabled={phase === "feedback"}
                    className={`rounded-2xl p-4 text-sm font-semibold text-jp-text border transition-all duration-200 ${bg}`}
                  >
                    {phase === "feedback" && isCorrect && <CheckCircle2 className="w-4 h-4 inline mr-1.5 text-emerald-400" />}
                    {phase === "feedback" && isSelected && !isCorrect && <XCircle className="w-4 h-4 inline mr-1.5 text-red-400" />}
                    {choice}
                  </button>
                );
              })}
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleAnswer(typed); }} className="flex gap-3">
              <input
                ref={inputRef}
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                disabled={phase === "feedback"}
                placeholder="Traduction en français…"
                className="flex-1 bg-jp-card border border-jp-border rounded-2xl px-4 py-3 text-jp-text placeholder:text-jp-muted focus:outline-none focus:border-jp-gold/50 text-sm"
              />
              <button
                type="submit"
                disabled={phase === "feedback" || !typed.trim()}
                className="btn-gold text-sm py-3 px-5 rounded-2xl"
              >
                OK
              </button>
            </form>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
