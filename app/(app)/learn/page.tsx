import Link from "next/link";
import { Brain, Gamepad2, Zap, Swords, BookOpen, TrendingUp } from "lucide-react";

const MODES = [
  {
    href: "/learn/srs",
    icon: Brain,
    label: "Révisions SRS",
    description: "Système de répétition espacée. Revois les mots au bon moment pour une mémorisation durable.",
    color: "from-blue-500/20 to-blue-600/5",
    border: "border-blue-500/25",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
    badge: "Recommandé",
    badgeColor: "bg-blue-500/20 text-blue-300",
  },
  {
    href: "/learn/games/matching",
    icon: Gamepad2,
    label: "Matching Game",
    description: "Associe les cartes japonaises à leur traduction. Course contre la montre !",
    color: "from-emerald-500/20 to-emerald-600/5",
    border: "border-emerald-500/25",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    badge: "Débutant",
    badgeColor: "bg-emerald-500/20 text-emerald-300",
  },
  {
    href: "/learn/games/vocab-duel",
    icon: Zap,
    label: "Vocab Duel",
    description: "QCM rapide + saisie libre. Teste ta vitesse et ta précision sur le vocabulaire.",
    color: "from-jp-gold/20 to-jp-gold/5",
    border: "border-jp-gold/25",
    iconBg: "bg-jp-gold/10",
    iconColor: "text-jp-gold",
    badge: "Intermédiaire",
    badgeColor: "bg-jp-gold/20 text-jp-gold",
  },
  {
    href: "/learn/games/boss-fight",
    icon: Swords,
    label: "Boss Fight",
    description: "Affronte un Yokai boss ! Chaque bonne réponse lui inflige des dégâts. Survie !",
    color: "from-jp-red/20 to-jp-red/5",
    border: "border-jp-red/25",
    iconBg: "bg-jp-red/10",
    iconColor: "text-jp-red-light",
    badge: "Avancé",
    badgeColor: "bg-jp-red/20 text-jp-red-light",
  },
];

export default function LearnPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <BookOpen className="w-7 h-7 text-jp-gold" />
          <h1 className="text-3xl font-black text-jp-text">Centre d&apos;apprentissage</h1>
        </div>
        <p className="text-jp-muted text-sm max-w-md mx-auto">
          Choisis ton mode d&apos;entraînement. Chaque session te rapporte de l&apos;XP et fait progresser ton SRS.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {MODES.map(({ href, icon: Icon, label, description, color, border, iconBg, iconColor, badge, badgeColor }) => (
          <Link
            key={href}
            href={href}
            className={`glass-hover rounded-2xl p-6 border ${border} bg-gradient-to-br ${color} flex flex-col gap-4`}
          >
            <div className="flex items-start justify-between">
              <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center ${iconColor}`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badgeColor}`}>{badge}</span>
            </div>
            <div>
              <h2 className="font-bold text-jp-text text-lg leading-tight">{label}</h2>
              <p className="text-jp-muted text-sm mt-1 leading-relaxed">{description}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-jp-muted mt-auto">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Gagne de l&apos;XP à chaque session</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
