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
              className="app-toast"
              style={{
                borderColor:
                  t.kind === "success" ? "rgba(16,185,129,0.24)"
                    : t.kind === "error" ? "rgba(244,63,94,0.24)"
                    : t.kind === "warning" ? "rgba(245,158,11,0.24)"
                    : "var(--border)",
              }}
            >
              <div
                className="absolute left-0 top-0 h-full w-1.5"
                style={{
                  background:
                    t.kind === "success" ? "rgba(16,185,129,0.84)"
                      : t.kind === "error" ? "rgba(244,63,94,0.84)"
                      : t.kind === "warning" ? "rgba(245,158,11,0.84)"
                      : "rgba(99,102,241,0.84)",
                }}
              />
              <button
                className="app-toast-dismiss"
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                aria-label="Dismiss toast"
              >
                <X size={16} />
              </button>
              <div className="pl-3 pr-6">
                <div className="app-toast-title">{t.title}</div>
                {t.message ? <div className="app-toast-message">{t.message}</div> : null}
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

