"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Swords, Zap, Trophy, BookOpen, Brain, Star, ChevronRight, Flame, Shield, Target } from "lucide-react";

const KANJI_CHARS = ["日","本","語","侍","学","習","力","剣","道","心","火","水","木","金","土","天","地","風","月","花","愛","夢","勝","知","武","英","雄","龍","虎","山"];

function KanjiRain() {
  const columns = useRef(
    Array.from({ length: 18 }, (_, i) => ({
      char: KANJI_CHARS[Math.floor(Math.random() * KANJI_CHARS.length)],
      left: (i / 18) * 100 + Math.random() * 3,
      duration: 8 + Math.random() * 14,
      delay: Math.random() * 10,
      size: 16 + Math.random() * 20,
    }))
  );
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      {columns.current.map((col, i) => (
        <span key={i} className="absolute font-jp select-none"
          style={{ left: `${col.left}%`, top: "-10%", fontSize: col.size, color: "rgba(196,30,58,0.1)", animation: `kanjiFall ${col.duration}s ${col.delay}s linear infinite` }}>
          {col.char}
        </span>
      ))}
    </div>
  );
}

const FEATURES = [
  { icon: Brain, title: "SRS Intelligent", desc: "Répétition espacée adaptative. Chaque mot revient au bon moment pour ancrer la mémoire à long terme.", color: "from-blue-500/20 to-blue-600/5", border: "border-blue-500/20", iconColor: "text-blue-400" },
  { icon: Swords, title: "Boss Yokai", desc: "Affronte des yokai légendaires en répondant aux questions. Un boss vaincu = une compétence maîtrisée.", color: "from-jp-red/20 to-jp-red/5", border: "border-jp-red/25", iconColor: "text-jp-red-light" },
  { icon: Zap, title: "XP & Niveaux", desc: "Gagne de l'XP à chaque bonne réponse. Monte de niveau 1 à 50 et débloque des badges samouraï.", color: "from-jp-gold/20 to-jp-gold/5", border: "border-jp-gold/25", iconColor: "text-jp-gold-light" },
  { icon: Flame, title: "Streak Quotidien", desc: "Maintiens ta série de jours consécutifs. Plus longue est la flamme, plus grands sont les bonus XP.", color: "from-orange-500/20 to-orange-600/5", border: "border-orange-500/20", iconColor: "text-orange-400" },
  { icon: Trophy, title: "Classement", desc: "Rivalise chaque semaine avec d'autres apprenants. Atteins le rang de Grand Maître Samouraï.", color: "from-purple-500/20 to-purple-600/5", border: "border-purple-500/20", iconColor: "text-purple-400" },
  { icon: BookOpen, title: "200+ Vocabulaires", desc: "Base JLPT N5→N3 avec phrases d'exemple. Hiragana, Katakana, Kanji et expressions du quotidien.", color: "from-emerald-500/20 to-emerald-600/5", border: "border-emerald-500/20", iconColor: "text-emerald-400" },
];

const STATS = [{ value: "200+", label: "Mots JLPT" }, { value: "10", label: "Badges" }, { value: "50", label: "Niveaux" }, { value: "3", label: "Mini-jeux" }];

const HOW = [
  { step: "01", title: "Connexion en 1 clic", desc: "Google OAuth ou email. Ton profil samouraï est créé instantanément.", icon: "⚡" },
  { step: "02", title: "Choisis ton mode", desc: "SRS pour mémoriser, mini-jeux pour t'amuser, Boss Fight pour le frisson.", icon: "🎮" },
  { step: "03", title: "Gagne de l'XP", desc: "Chaque bonne réponse rapporte des points, des badges et des niveaux.", icon: "✨" },
  { step: "04", title: "Reviens chaque jour", desc: "Ta streak grandit, tes bonus augmentent. Le japonais devient une habitude.", icon: "🔥" },
];

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -50]);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <KanjiRain />
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <div className="absolute rounded-full orb-animate opacity-25" style={{ width: 600, height: 600, top: "-15%", right: "-10%", background: "radial-gradient(circle,rgba(196,30,58,0.2) 0%,transparent 70%)", animationDuration: "20s" }} />
        <div className="absolute rounded-full orb-animate opacity-15" style={{ width: 400, height: 400, bottom: "10%", left: "-5%", background: "radial-gradient(circle,rgba(212,160,23,0.15) 0%,transparent 70%)", animationDuration: "15s", animationDelay: "5s" }} />
      </div>

      {/* Nav */}
      <header className="relative z-50 border-b border-white/5 bg-jp-dark/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-red flex items-center justify-center shadow-jp">
              <Swords className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">Samouraï <span className="text-gradient-red">Learn</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-jp-muted">
            <a href="#fonctionnalites" className="hover:text-jp-text transition-colors">Fonctionnalités</a>
            <a href="#comment" className="hover:text-jp-text transition-colors">Comment ça marche</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth" className="text-sm text-jp-muted hover:text-jp-text transition-colors hidden sm:block">Connexion</Link>
            <Link href="/auth" className="btn-red text-sm py-2 px-4">Commencer <ChevronRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 pt-24 pb-20 px-4">
        <motion.div style={{ y: heroY }} className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-jp-gold/30 bg-jp-gold/10 text-jp-gold-light text-sm font-medium">
            <Star className="w-3.5 h-3.5 fill-jp-gold text-jp-gold" />
            Apprendre le japonais, version gamifiée
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="font-jp text-6xl sm:text-8xl font-black kanji-hero mb-6 leading-none">
            侍学習
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-bold text-jp-text leading-tight mb-6">
            Maîtrise le japonais.{" "}<br className="hidden sm:block" />
            <span className="text-gradient-full">Deviens un Samouraï.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg sm:text-xl text-jp-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            SRS intelligent, combats de Yokai, classements hebdomadaires et système XP ultra-addictif. 100&nbsp;% en français.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth" className="btn-red text-base py-4 px-8 rounded-2xl"><Swords className="w-5 h-5" />Commencer gratuitement</Link>
            <Link href="#fonctionnalites" className="btn-ghost text-base py-4 px-8 rounded-2xl"><BookOpen className="w-5 h-5" />Voir les fonctionnalités</Link>
          </motion.div>
        </motion.div>

        {/* App preview */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
          className="relative max-w-3xl mx-auto mt-20 px-4">
          <div className="glass rounded-3xl p-6 sm:p-8 border border-jp-red/15 shadow-jp-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-red flex items-center justify-center"><Swords className="w-5 h-5 text-white" /></div>
                <div><p className="font-bold text-jp-text">Samouraï Learn</p><p className="text-xs text-jp-muted">Niveau 12 · Ronin</p></div>
              </div>
              <div className="flex items-center gap-2 text-orange-400"><span className="text-2xl fire">🔥</span><span className="font-bold text-lg">7</span><span className="text-xs text-jp-muted">jours</span></div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-xs text-jp-muted mb-1.5"><span>XP · Niveau 12</span><span>2 340 / 3 000</span></div>
              <div className="xp-track"><div className="xp-fill" style={{ width: "78%" }} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[{ icon: Target, label: "Quête du jour", val: "5/10", color: "text-jp-gold" }, { icon: Brain, label: "SRS à revoir", val: "12 cartes", color: "text-blue-400" }, { icon: Shield, label: "Boss actif", val: "Oni Lvl 3", color: "text-jp-red-light" }].map(({ icon: Icon, label, val, color }) => (
                <div key={label} className="glass rounded-xl p-3 text-center">
                  <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
                  <p className="text-xs text-jp-muted leading-tight">{label}</p>
                  <p className={`text-xs font-bold ${color} mt-0.5`}>{val}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -inset-4 rounded-3xl bg-jp-red/5 blur-2xl -z-10" />
        </motion.div>
      </section>

      {/* Stats */}
      <section className="relative z-10 py-12 border-y border-white/5 bg-jp-card/30">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {STATS.map(({ value, label }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
              <p className="text-3xl font-bold text-gradient-full">{value}</p>
              <p className="text-sm text-jp-muted mt-1">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="fonctionnalites" className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-jp-text mb-4">Tout ce qu&apos;il faut pour <span className="text-gradient-red">progresser vite</span></h2>
            <p className="text-jp-muted text-lg max-w-xl mx-auto">Une combinaison scientifiquement prouvée de mémorisation et de jeu.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, color, border, iconColor }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }}
                className={`glass rounded-2xl p-6 border ${border} bg-gradient-to-br ${color} cursor-default`}>
                <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 ${iconColor}`}><Icon className="w-6 h-6" /></div>
                <h3 className="font-bold text-jp-text text-lg mb-2">{title}</h3>
                <p className="text-jp-muted text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="comment" className="relative z-10 py-20 px-4 bg-jp-card/20">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-jp-text mb-4">Comment ça <span className="text-gradient-gold">marche ?</span></h2>
          </motion.div>
          <div className="space-y-5">
            {HOW.map(({ step, title, desc, icon }, i) => (
              <motion.div key={step} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex items-start gap-6 glass rounded-2xl p-6">
                <div className="text-4xl flex-shrink-0">{icon}</div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono text-jp-red font-bold">{step}</span>
                    <h3 className="font-bold text-jp-text text-lg">{title}</h3>
                  </div>
                  <p className="text-jp-muted text-sm leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="max-w-2xl mx-auto text-center">
          <div className="glass rounded-3xl p-10 sm:p-14 border border-jp-red/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-jp-red/5 to-jp-gold/5" />
            <div className="relative z-10">
              <div className="font-jp text-5xl font-black text-gradient-full mb-4">始めよう</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-jp-text mb-4">Prêt à devenir un Samouraï ?</h2>
              <p className="text-jp-muted mb-8 text-sm sm:text-base">Gratuit, sans carte bancaire. Commence en 30 secondes.</p>
              <Link href="/auth" className="btn-red text-lg py-4 px-10 rounded-2xl inline-flex"><Swords className="w-5 h-5" />Rejoindre maintenant</Link>
            </div>
          </div>
        </motion.div>
      </section>

      <footer className="relative z-10 border-t border-white/5 py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-2 text-jp-muted text-sm">
          <Swords className="w-4 h-4 text-jp-red" />
          <span>Samouraï Learn © 2025 — Forgé avec ❤️ pour les amoureux du Japon</span>
        </div>
      </footer>
    </div>
  );
}
