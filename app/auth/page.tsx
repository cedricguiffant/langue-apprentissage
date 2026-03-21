"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Swords, Mail, Lock, Eye, EyeOff, Chrome, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

const KANJI = ["日","本","語","侍","学","剣","武","勝","愛","夢","力","心","火","風","龍"];

function BgKanji() {
  const chars = useRef(Array.from({ length: 12 }, (_, i) => ({
    char: KANJI[i % KANJI.length],
    left: (i / 12) * 100,
    duration: 10 + i * 1.5,
    delay: i * 0.8,
    size: 18 + (i % 3) * 8,
  }))).current;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {chars.map((c, i) => (
        <span key={i} className="absolute font-jp select-none"
          style={{ left: `${c.left}%`, fontSize: c.size, color: "rgba(196,30,58,0.1)", animation: `kanjiFall ${c.duration}s ${c.delay}s linear infinite` }}>
          {c.char}
        </span>
      ))}
    </div>
  );
}

const firebaseConfigured = !!(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);

type Mode = "signin" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const switchMode = (m: Mode) => { setMode(m); setError(null); setSuccess(null); };

  async function createSession(idToken: string) {
    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) throw new Error("Session creation failed");
  }

  const handleGoogle = async () => {
    if (!firebaseConfigured) {
      setError("Firebase non configuré. Ajoute les variables d'environnement.");
      return;
    }
    setGoogleLoading(true); setError(null);
    try {
      const { clientAuth } = await import("@/lib/firebase");
      const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(clientAuth, provider);
      const idToken = await result.user.getIdToken();
      await createSession(idToken);
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError("Erreur Google : " + (err.message ?? "inconnue"));
      setGoogleLoading(false);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseConfigured) {
      setError("Firebase non configuré. Ajoute les variables d'environnement.");
      return;
    }
    setLoading(true); setError(null); setSuccess(null);
    try {
      const { clientAuth } = await import("@/lib/firebase");
      if (mode === "signin") {
        const { signInWithEmailAndPassword } = await import("firebase/auth");
        const result = await signInWithEmailAndPassword(clientAuth, email, password);
        const idToken = await result.user.getIdToken();
        await createSession(idToken);
        router.push("/dashboard");
        router.refresh();
      } else {
        const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
        const result = await createUserWithEmailAndPassword(clientAuth, email, password);
        await updateProfile(result.user, { displayName: email.split("@")[0] });
        const idToken = await result.user.getIdToken();
        await createSession(idToken);
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      const msg: Record<string, string> = {
        "auth/email-already-in-use": "Cet email est déjà utilisé.",
        "auth/weak-password": "Mot de passe trop faible (6 caractères minimum).",
        "auth/invalid-credential": "Email ou mot de passe incorrect.",
        "auth/user-not-found": "Aucun compte avec cet email.",
      };
      setError(msg[err.code] ?? err.message ?? "Erreur inconnue.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <BgKanji />
      <div className="fixed top-1/4 -right-32 w-96 h-96 rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle,rgba(196,30,58,0.4) 0%,transparent 70%)" }} />

      <div className="relative z-10 w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-jp-red to-jp-red/70 flex items-center justify-center shadow-lg">
              <Swords className="w-7 h-7 text-white" />
            </div>
            <span className="font-bold text-xl">Samouraï <span className="text-gradient-red">Learn</span></span>
            <span className="text-jp-muted text-sm font-jp">侍学習</span>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass rounded-3xl p-8 border border-jp-border">
          {/* Toggle */}
          <div className="flex rounded-xl bg-jp-dark/60 p-1 mb-8">
            {(["signin", "signup"] as Mode[]).map((m) => (
              <button key={m} onClick={() => switchMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${mode === m ? "bg-jp-red text-white shadow-md" : "text-jp-muted hover:text-jp-text"}`}>
                {m === "signin" ? "Connexion" : "Inscription"}
              </button>
            ))}
          </div>

          {/* Google */}
          <button onClick={handleGoogle} disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-jp-border bg-jp-card/50 text-jp-text text-sm font-medium hover:border-jp-red/30 hover:bg-jp-red/5 transition-all duration-200 mb-6 disabled:opacity-50 disabled:cursor-not-allowed">
            {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Chrome className="w-4 h-4" />}
            Continuer avec Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-jp-border" />
            <span className="text-jp-muted text-xs">ou</span>
            <div className="flex-1 h-px bg-jp-border" />
          </div>

          <form onSubmit={handleEmail} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-jp-muted mb-1.5">Adresse email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-jp-muted" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="toi@exemple.com"
                  className="w-full bg-jp-dark/60 border border-jp-border rounded-xl pl-10 pr-4 py-3 text-sm text-jp-text placeholder:text-jp-muted/50 focus:outline-none focus:border-jp-red/60 focus:ring-1 focus:ring-jp-red/30 transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-jp-muted mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-jp-muted" />
                <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••"
                  className="w-full bg-jp-dark/60 border border-jp-border rounded-xl pl-10 pr-10 py-3 text-sm text-jp-text placeholder:text-jp-muted/50 focus:outline-none focus:border-jp-red/60 focus:ring-1 focus:ring-jp-red/30 transition-all" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-jp-muted hover:text-jp-text transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{error}
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                  ✅ {success}
                </motion.div>
              )}
            </AnimatePresence>

            <button type="submit" disabled={loading} className="btn-red w-full py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Swords className="w-4 h-4" />}
              {mode === "signin" ? "Se connecter" : "Créer mon compte"}
            </button>
          </form>

          <p className="text-center text-xs text-jp-muted mt-6">
            {mode === "signin" ? "Pas encore de compte ? " : "Déjà un compte ? "}
            <button onClick={() => switchMode(mode === "signin" ? "signup" : "signin")} className="text-jp-red hover:text-jp-red-light transition-colors font-medium">
              {mode === "signin" ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center mt-6">
          <Link href="/" className="text-jp-muted text-sm hover:text-jp-text transition-colors">← Retour à l&apos;accueil</Link>
        </motion.div>
      </div>
    </div>
  );
}
