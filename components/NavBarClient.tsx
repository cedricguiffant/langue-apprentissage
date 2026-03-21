"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, LayoutDashboard, BookOpen, User, LogOut, Menu, X, Flame, ChevronDown } from "lucide-react";
import { AVATAR_EMOJI, getLevelTitle, type UserProfile } from "@/lib/types";

const NAV_LINKS = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/learn", label: "Apprendre", icon: BookOpen },
  { href: "/profile", label: "Profil", icon: User },
];

export default function NavBarClient({ profile }: { profile: UserProfile | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      const { clientAuth } = await import("@/lib/firebase");
      const { signOut } = await import("firebase/auth");
      await signOut(clientAuth);
    } catch {}
    await fetch("/api/session", { method: "DELETE" });
    router.push("/");
    router.refresh();
  };

  const xpPct = profile
    ? Math.min(100, Math.round((profile.xp / profile.xp_to_next_level) * 100))
    : 0;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-jp-dark/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-red flex items-center justify-center shadow-jp">
            <Swords className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-jp-text hidden sm:block">
            Samouraï <span className="text-gradient-red">Learn</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active ? "bg-jp-red/15 text-jp-red-light border border-jp-red/20" : "text-jp-muted hover:text-jp-text hover:bg-white/5"
                }`}>
                <Icon className="w-4 h-4" />{label}
              </Link>
            );
          })}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Streak badge */}
          {profile && profile.streak > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <span className="text-lg fire">🔥</span>
              <span className="font-bold text-orange-400 text-sm">{profile.streak}</span>
            </div>
          )}

          {/* Level badge */}
          {profile && (
            <div className="hidden sm:flex flex-col items-end gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-jp-muted">Niv.</span>
                <span className="font-bold text-jp-gold text-sm">{profile.level}</span>
                <span className="text-xs text-jp-muted hidden lg:block">· {getLevelTitle(profile.level)}</span>
              </div>
              <div className="w-20 h-1 bg-jp-border rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-jp-gold transition-all duration-700" style={{ width: `${xpPct}%` }} />
              </div>
            </div>
          )}

          {/* User dropdown */}
          {profile ? (
            <div className="relative">
              <button onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-jp-border hover:border-jp-red/30 hover:bg-jp-red/5 transition-all duration-200">
                <div className="w-7 h-7 rounded-lg bg-jp-card2 flex items-center justify-center text-sm">
                  {AVATAR_EMOJI[profile.avatar_skin] ?? "⚔️"}
                </div>
                <span className="text-sm font-medium text-jp-text hidden sm:block max-w-[80px] truncate">{profile.username}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-jp-muted transition-transform ${dropOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {dropOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropOpen(false)} />
                    <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-48 glass rounded-2xl border border-jp-border overflow-hidden z-50">
                      {[
                        { href: "/profile", label: "Mon profil", icon: User },
                        { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
                      ].map(({ href, label, icon: Icon }) => (
                        <Link key={href} href={href} onClick={() => setDropOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-jp-text hover:bg-jp-red/10 transition-colors">
                          <Icon className="w-4 h-4 text-jp-muted" />{label}
                        </Link>
                      ))}
                      <div className="border-t border-jp-border" />
                      <button onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                        <LogOut className="w-4 h-4" />Déconnexion
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link href="/auth" className="btn-red text-sm py-2 px-4">Connexion</Link>
          )}

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-xl border border-jp-border hover:bg-white/5 transition-colors">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-jp-border bg-jp-dark/95 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      active ? "bg-jp-red/15 text-jp-red-light" : "text-jp-muted hover:text-jp-text hover:bg-white/5"
                    }`}>
                    <Icon className="w-4 h-4" />{label}
                  </Link>
                );
              })}
              {profile?.streak ? (
                <div className="flex items-center gap-2 px-4 py-2 text-sm text-orange-400">
                  <Flame className="w-4 h-4" />{profile.streak} jours de suite
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
