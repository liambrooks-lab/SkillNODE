import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutGrid, Swords, Trophy, UserCircle2, LogOut } from "lucide-react";
import { cn } from "../ui/cn";
import { Button } from "../ui/Button";
import { clearToken } from "../../lib/auth";
import { ToastProvider, useToast } from "../ui/Toast";

function ShellInner() {
  const navigate = useNavigate();
  const toast = useToast();

  const items = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { to: "/activities", label: "Activities", icon: Trophy },
    { to: "/multiplayer", label: "Multiplayer", icon: Swords },
    { to: "/profile", label: "Profile", icon: UserCircle2 },
  ];

  return (
    <div className="min-h-screen app-shell-bg">
      <div className="mx-auto flex w-full max-w-6xl gap-6 px-4 py-6 md:px-6">
        <aside className="hidden w-64 shrink-0 md:block">
          <div className="sticky top-6 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-white/60">Welcome to</div>
                  <div className="text-lg font-semibold tracking-tight">SkillNODE</div>
                </div>
                <div className="h-10 w-10 rounded-2xl bg-indigo-500/20 ring-1 ring-indigo-400/30" />
              </div>
            </div>

            <nav className="rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-xl">
              {items.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition",
                      isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/7 hover:text-white",
                    )
                  }
                >
                  <it.icon size={18} className="text-white/80 group-hover:text-white" />
                  <span className="font-medium">{it.label}</span>
                </NavLink>
              ))}
            </nav>

            <Button
              variant="secondary"
              className="w-full justify-start gap-2"
              onClick={() => {
                clearToken();
                toast.push({ title: "Signed out", message: "See you soon.", kind: "success" });
                navigate("/login");
              }}
            >
              <LogOut size={18} />
              Sign out
            </Button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm text-white/60">SkillNODE</div>
              <div className="text-xl font-semibold tracking-tight">Level up. Compete. Connect.</div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="md:hidden"
                onClick={() => {
                  toast.push({
                    title: "Tip",
                    message: "Open Activities to start playing.",
                    kind: "info",
                  });
                }}
              >
                Quick tip
              </Button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-6"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      <nav className="fixed bottom-4 left-1/2 z-40 w-[min(520px,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-950/50 p-2 backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-4 gap-2">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-xs transition",
                  isActive ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/7 hover:text-white",
                )
              }
            >
              <it.icon size={18} />
              {it.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function AppShell() {
  return (
    <ToastProvider>
      <ShellInner />
    </ToastProvider>
  );
}

