import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "./cn";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((toast) => {
    const id = crypto.randomUUID();
    const next = { id, title: toast.title, message: toast.message, kind: toast.kind || "info" };
    setToasts((prev) => [next, ...prev].slice(0, 4));
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.durationMs || 3500);
  }, []);

  const api = useMemo(() => ({ push }), [push]);

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-[min(420px,calc(100vw-2rem))] flex-col gap-3">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className={cn(
                "relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 backdrop-blur-xl p-4 shadow-[0_25px_80px_-50px_rgba(0,0,0,0.85)]",
                t.kind === "success" && "border-emerald-400/20",
                t.kind === "error" && "border-rose-400/25",
                t.kind === "warning" && "border-amber-400/25",
              )}
            >
              <div
                className={cn(
                  "absolute left-0 top-0 h-full w-1.5",
                  t.kind === "success" && "bg-emerald-400/80",
                  t.kind === "error" && "bg-rose-400/80",
                  t.kind === "warning" && "bg-amber-400/80",
                  t.kind === "info" && "bg-indigo-400/80",
                )}
              />
              <button
                className="absolute right-3 top-3 rounded-lg p-1 text-white/60 hover:bg-white/10 hover:text-white"
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                aria-label="Dismiss toast"
              >
                <X size={16} />
              </button>
              <div className="pl-3 pr-6">
                <div className="text-sm font-semibold text-white">{t.title}</div>
                {t.message ? <div className="mt-1 text-sm text-white/70">{t.message}</div> : null}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

