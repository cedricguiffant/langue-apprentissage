"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => {
          const isSuccess = t.variant === "success";
          const isError = t.variant === "destructive";
          const Icon = isSuccess ? CheckCircle2 : isError ? AlertCircle : Info;
          const borderColor = isSuccess ? "border-emerald-500/30" : isError ? "border-red-500/30" : "border-jp-border";
          const iconColor = isSuccess ? "text-emerald-400" : isError ? "text-red-400" : "text-jp-gold";

          return (
            <motion.div key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`pointer-events-auto glass rounded-2xl p-4 border ${borderColor} flex items-start gap-3`}>
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 min-w-0">
                {t.title && <p className="font-semibold text-jp-text text-sm">{t.title}</p>}
                {t.description && <p className="text-jp-muted text-xs mt-0.5 leading-relaxed">{t.description}</p>}
              </div>
              <button onClick={() => dismiss(t.id)} className="flex-shrink-0 text-jp-muted hover:text-jp-text transition-colors">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
