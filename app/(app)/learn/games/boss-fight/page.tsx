"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Heart, Zap, Shield, RotateCcw, Skull } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getRandomVocab } from "@/data/japanese-core-vocab";
import type { VocabItem } from "@/data/japanese-core-vocab";

const BOSSES = [
  { name: "Kappa", kanji: "河童", emoji: "🐸", hp: 80,  color: "text-emerald-400", glow: "shadow-emerald-500/30" },
  { name: "Tengu", kanji: "天狗", emoji: "👺", hp: 120, color: "text-red-400",     glow: "shadow-red-500/30"     },
  { name: "Oni",   kanji: "鬼",   emoji: "👹", hp: 160, color: "text-purple-400",  glow: "shadow-purple-500/30"  },
] as const;

const PLAYER_HP = 5;
const CHOICES = 4;
const DAMAGE_PER_HIT = 10;
const BOSS_DAMAGE = 1;

type Phase = "intro" | "playing" | "victory" | "defeat";

function buildChoices(correct: VocabItem, pool: VocabItem[]) {
  const wrong = pool.filter((p) => p.id !== correct.id).sort(() => Math.random() - 0.5).slice(0, CHOICES - 1);
  return [...wrong, correct].sort(() => Math.random() - 0.5);
}

export default function BossFightPage() {
  const { toast } = useToast();
  const poolRef = useRef<VocabItem[]>([]);
  const [bossIdx, setBossIdx] = useState(0);
  const boss = BOSSES[bossIdx];
  const [bossHp, setBossHp] = useState(boss.hp);
  const [playerHp, setPlayerHp] = useState(PLAYER_HP);
  const [phase, setPhase] = useState<Phase>("intro");
  const [question, setQuestion] = useState<VocabItem | null>(null);
  const [choices, setChoices] = useState<VocabItem[]>([]);
  const [feedback, setFeedback] = useState<{ id: number; correct: boolean } | null>(null);
  const [shaking, setShaking] = useState(false);
  const [bossHit, setBossHit] = useState(false);

  const nextQuestion = useCallback(() => {
    const pool = poolRef.current;
    const q = pool[Math.floor(Math.random() * pool.length)];
    setQuestion(q);
    setChoices(buildChoices(q, pool));
    setFeedback(null);
  }, []);

  const startFight = useCallback(() => {
    poolRef.current = getRandomVocab(30);
    setBossHp(boss.hp);
    setPlayerHp(PLAYER_HP);
    setPhase("playing");
    const q = poolRef.current[0];
    setQuestion(q);
    setChoices(buildChoices(q, poolRef.current));
    setFeedback(null);
  }, [boss.hp]);

  function handleAnswer(choice: VocabItem) {
    if (feedback || !question) return;
    const correct = choice.id === question.id;
    setFeedback({ id: choice.id, correct });

    if (correct) {
      setBossHit(true);
      setTimeout(() => setBossHit(false), 400);
      setBossHp((hp) => {
        const next = hp - DAMAGE_PER_HIT;
        if (next <= 0) {
          setTimeout(() => {
            if (bossIdx + 1 < BOSSES.length) {
              const nextBoss = bossIdx + 1;
              setBossIdx(nextBoss);
              setBossHp(BOSSES[nextBoss].hp);
              setPhase("playing");
              nextQuestion();
              toast({ title: `${BOSSES[nextBoss].name} apparaît ! 👹`, description: "Un boss plus puissant attaque !", variant: "default" });
            } else {
              setPhase("victory");
              if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
                import("@/lib/actions").then(({ addXP, updateQuestProgress }) => {
                  addXP(50);
                  updateQuestProgress("games", 1);
                }).catch(() => {});
              }
            }
          }, 800);
        } else {
          setTimeout(nextQuestion, 900);
        }
        return Math.max(0, next);
      });
    } else {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setPlayerHp((hp) => {
        const next = hp - BOSS_DAMAGE;
        if (next <= 0) {
          setTimeout(() => setPhase("defeat"), 800);
        } else {
          setTimeout(nextQuestion, 900);
        }
        return Math.max(0, next);
      });
    }
  }

  // Reset bossIdx when starting fresh
  useEffect(() => {
    if (phase === "intro") setBossIdx(0);
  }, [phase]);

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <AnimatePresence mode="wait">

        {/* ── Intro ── */}
        {phase === "intro" && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12">
            <p className="text-6xl mb-4">👹</p>
            <h1 className="text-3xl font-black text-jp-text mb-2">Boss Fight</h1>
            <p className="text-jp-muted text-sm mb-6 max-w-xs mx-auto">
              Réponds correctement pour infliger des dégâts au boss. Une erreur et il t'attaque ! Bats les 3 boss pour gagner.
            </p>
            <div className="flex justify-center gap-4 mb-8">
              {BOSSES.map((b, i) => (
                <div key={b.name} className="glass rounded-2xl p-3 border border-jp-border text-center">
                  <p className="text-2xl">{b.emoji}</p>
                  <p className={`text-xs font-bold ${b.color} mt-1`}>{b.name}</p>
                  <p className="text-xs text-jp-muted">{b.hp} HP</p>
                </div>
              ))}
            </div>
            <button onClick={startFight} className="btn-red text-sm py-3 px-8 rounded-xl inline-flex">
              <Swords className="w-4 h-4" />Combattre !
            </button>
          </motion.div>
        )}

        {/* ── Playing ── */}
        {phase === "playing" && question && (
          <motion.div key={`fight-${bossIdx}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Boss header */}
            <div className="glass rounded-2xl border border-jp-border p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{boss.emoji}</span>
                  <div>
                    <p className={`font-black text-sm ${boss.color}`}>{boss.name}</p>
                    <p className="text-xs text-jp-muted font-jp">{boss.kanji}</p>
                  </div>
                </div>
                <p className={`font-mono font-bold ${boss.color}`}>{bossHp}/{boss.hp} HP</p>
              </div>
              <div className="h-3 bg-jp-border rounded-full overflow-hidden">
                <motion.div
                  className="hp-fill h-full rounded-full"
                  animate={{ width: `${(bossHp / boss.hp) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Player HP */}
            <div className="flex items-center gap-2 mb-5">
              <Shield className="w-4 h-4 text-jp-muted" />
              <div className="flex gap-1">
                {Array.from({ length: PLAYER_HP }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={i === playerHp && shaking ? { scale: [1, 1.3, 0] } : {}}
                  >
                    <Heart className={`w-5 h-5 ${i < playerHp ? "text-red-400 fill-red-400" : "text-jp-border"}`} />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Boss sprite (animated) */}
            <motion.div
              animate={bossHit ? { x: [0, -8, 8, -8, 0], opacity: [1, 0.4, 1] } : shaking ? { x: [0, 6, -6, 6, 0] } : {}}
              className={`text-center py-4 text-8xl leading-none filter ${bossHit ? "grayscale brightness-150" : ""}`}
            >
              {boss.emoji}
            </motion.div>

            {/* Question */}
            <div className="glass rounded-3xl border border-jp-border p-6 text-center mb-5">
              <p className="text-xs text-jp-muted mb-2 uppercase tracking-wider">Traduis ce mot</p>
              <p className="text-5xl font-jp kanji-hero leading-none mb-1">{question.japanese}</p>
              <p className="text-jp-muted text-sm">{question.kana}</p>
            </div>

            {/* Choices */}
            <div className="grid grid-cols-2 gap-3">
              {choices.map((c) => {
                const isSelected = feedback?.id === c.id;
                const isCorrectAnswer = c.id === question.id;
                let style = "glass border-jp-border hover:border-jp-gold/40 hover:bg-jp-gold/5 text-jp-text";
                if (feedback) {
                  if (isCorrectAnswer) style = "border-emerald-500/60 bg-emerald-500/15 text-emerald-300";
                  else if (isSelected) style = "border-red-500/60 bg-red-500/15 text-red-300";
                  else style = "glass border-jp-border opacity-30 text-jp-muted";
                }
                return (
                  <button
                    key={c.id}
                    onClick={() => handleAnswer(c)}
                    disabled={!!feedback}
                    className={`rounded-2xl p-4 text-sm font-semibold border transition-all duration-200 ${style}`}
                  >
                    {c.french}
                  </button>
                );
              })}
            </div>

            {/* Damage feedback */}
            <AnimatePresence>
              {feedback && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`text-center mt-4 font-bold text-sm ${feedback.correct ? "text-emerald-400" : "text-red-400"}`}
                >
                  {feedback.correct ? `💥 -${DAMAGE_PER_HIT} HP !` : `💔 Le boss t'attaque !`}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Victory ── */}
        {phase === "victory" && (
          <motion.div key="victory" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
            <p className="text-6xl mb-4">🏆</p>
            <h1 className="text-3xl font-black text-jp-gold mb-2">Victoire !</h1>
            <p className="text-jp-muted mb-2">Tu as vaincu tous les Yokai !</p>
            <p className="text-emerald-400 font-bold mb-8">+50 XP gagnés</p>
            <button onClick={() => setPhase("intro")} className="btn-gold text-sm py-2.5 px-6 rounded-xl inline-flex">
              <RotateCcw className="w-4 h-4" />Rejouer
            </button>
          </motion.div>
        )}

        {/* ── Defeat ── */}
        {phase === "defeat" && (
          <motion.div key="defeat" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
            <Skull className="w-14 h-14 text-red-400 mx-auto mb-4" />
            <h1 className="text-3xl font-black text-red-400 mb-2">Défaite…</h1>
            <p className="text-jp-muted mb-8">Le boss t'a vaincu. Entraîne-toi et reviens !</p>
            <button onClick={() => setPhase("intro")} className="btn-red text-sm py-2.5 px-6 rounded-xl inline-flex">
              <RotateCcw className="w-4 h-4" />Réessayer
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
