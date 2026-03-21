import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "Samouraï Learn — Maîtrise le japonais",
  description: "Application gamifiée d'apprentissage du japonais. SRS, mini-jeux, Boss Yokai, badges. 100 % en français.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${geist.variable} font-sans bg-jp-dark text-jp-text antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
