import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "jp-red": { DEFAULT: "#C41E3A", light: "#E8354F", dark: "#8B0000" },
        "jp-gold": { DEFAULT: "#D4A017", light: "#F0BE30", dark: "#A07810" },
        "jp-dark": "#0A0A14",
        "jp-navy": "#0D0D1A",
        "jp-card": "#13132A",
        "jp-card2": "#1A1A35",
        "jp-border": "#2A2A4A",
        "jp-sakura": "#FFB7C5",
        "jp-text": "#F0E6D3",
        "jp-muted": "#8888AA",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        jp: ["Noto Serif JP", "serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite alternate",
        "slide-up": "slideUp 0.4s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
        "bounce-in": "bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1)",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        "kanji-fall": "kanjiFall linear infinite",
        "shake": "shake 0.4s ease-in-out",
        "xp-pop": "xpPop 1s ease-out forwards",
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        glow: {
          "0%": { boxShadow: "0 0 10px rgba(196,30,58,0.3)" },
          "100%": { boxShadow: "0 0 25px rgba(196,30,58,0.7)" },
        },
        slideUp: { "0%": { transform: "translateY(20px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        bounceIn: { "0%": { transform: "scale(0.5)", opacity: "0" }, "60%": { transform: "scale(1.1)" }, "100%": { transform: "scale(1)", opacity: "1" } },
        pulseGold: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.7", boxShadow: "0 0 20px rgba(212,160,23,0.5)" } },
        kanjiFall: {
          "0%": { transform: "translateY(-10vh) rotate(0deg)", opacity: "0" },
          "8%": { opacity: "0.18" },
          "92%": { opacity: "0.18" },
          "100%": { transform: "translateY(110vh) rotate(20deg)", opacity: "0" },
        },
        shake: { "0%,100%": { transform: "translateX(0)" }, "25%": { transform: "translateX(-6px)" }, "75%": { transform: "translateX(6px)" } },
        xpPop: { "0%": { transform: "translateY(0) scale(1)", opacity: "1" }, "100%": { transform: "translateY(-60px) scale(0.8)", opacity: "0" } },
      },
      backgroundImage: {
        "gradient-jp": "linear-gradient(135deg,#0A0A14 0%,#0D0D1A 50%,#1A1028 100%)",
        "gradient-red": "linear-gradient(135deg,#C41E3A 0%,#8B0000 100%)",
        "gradient-gold": "linear-gradient(135deg,#F0BE30 0%,#D4A017 100%)",
        "gradient-card": "linear-gradient(145deg,#13132A 0%,#1A1A35 100%)",
      },
      boxShadow: {
        jp: "0 4px 30px rgba(196,30,58,0.2)",
        "jp-lg": "0 8px 50px rgba(196,30,58,0.35)",
        gold: "0 4px 20px rgba(212,160,23,0.3)",
        card: "0 4px 24px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.04)",
      },
    },
  },
  plugins: [animate],
};

export default config;
