import { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutGrid,
  Swords,
  Trophy,
  UserCircle2,
  LogOut,
  Sparkles,
  ShieldCheck,
  Radio,
} from "lucide-react";
import { cn } from "../ui/cn";
import { Button } from "../ui/Button";
import { clearToken } from "../../lib/auth";
import { ToastProvider, useToast } from "../ui/Toast";
import { api } from "../../lib/api";
import { resolveMediaUrl } from "../../lib/media";
import { closeSocket } from "../../lib/socket";

function ShellInner() {
  const navigate = useNavigate();
  const toast = useToast();
  const [me, setMe] = useState(null);

  const items = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { to: "/activities", label: "Skill Labs", icon: Trophy },
    { to: "/multiplayer", label: "Multiplayer", icon: Swords },
    { to: "/profile", label: "Profile", icon: UserCircle2 },
  ];

  useEffect(() => {
    let alive = true;

    api
      .get("/api/me")
      .then(({ data }) => {
        if (alive) setMe(data);
      })
      .catch(() => {
        if (!alive) return;
        clearToken();
        navigate("/login", { replace: true });
      });

    return () => {
      alive = false;
    };
  }, [navigate]);

  return (
    <div className="app-shell-bg">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-5 md:px-6">
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-5 space-y-4">
            <div className="glass-border overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(160deg,rgba(10,18,32,0.95),rgba(8,15,28,0.76))] p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="hero-kicker">SkillNODE</div>
                  <div className="display-title text-2xl">Train Hard. Look Sharp.</div>
                  <div className="text-sm text-white/60">
                    AI-powered skill platform with multiplayer energy.
                  </div>
                </div>
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3">
                  <Sparkles size={18} className="text-cyan-200" />
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-xs uppercase tracking-[0.22em] text-white/45">Player</div>
                  <div className="mt-2 flex items-center gap-3">
                    {me?.dpUrl ? (
                      <img
                        src={resolveMediaUrl(me.dpUrl)}
                        alt={me.name}
                        className="h-12 w-12 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-base font-semibold">
                        {me?.name?.slice(0, 1)?.toUpperCase() || "S"}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold">{me?.name || "Loading profile"}</div>
                      <div className="text-sm text-white/55">{me?.region || "Syncing region"}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center gap-2 text-white/55">
                      <ShieldCheck size={15} className="text-emerald-300" />
                      Fair play
                    </div>
                    <div className="mt-2 text-lg font-semibold">Active</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center gap-2 text-white/55">
                      <Radio size={15} className="text-sky-300" />
                      Presence
                    </div>
                    <div className="mt-2 text-lg font-semibold">Live</div>
                  </div>
                </div>
              </div>
            </div>

            <nav className="glass-border rounded-[28px] border border-white/10 bg-slate-950/40 p-2.5">
              {items.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                      isActive
                        ? "bg-[linear-gradient(135deg,rgba(125,211,252,0.18),rgba(52,211,153,0.16))] text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white",
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
                closeSocket();
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
          <div className="glass-border rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,17,29,0.82),rgba(10,17,29,0.58))] px-5 py-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="hero-kicker">Professional Skill Gaming Platform</div>
                <div className="display-title text-3xl">Level up, compete, connect.</div>
                <div className="mt-2 max-w-2xl text-sm text-white/60">
                  Every screen is built to feel like one serious product: challenge labs,
                  multiplayer rooms, AI coaching, and public profiles in one smooth flow.
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-white/45">AI coach</div>
                  <div className="mt-1 font-semibold">Contextual hints</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-white/45">Modes</div>
                  <div className="mt-1 font-semibold">Solo + multi</div>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="page-shell mt-6"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      <nav className="fixed bottom-4 left-1/2 z-40 w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 rounded-[28px] border border-white/10 bg-slate-950/70 p-2.5 backdrop-blur-2xl lg:hidden">
        <div className="grid grid-cols-4 gap-2">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 rounded-2xl py-2.5 text-xs transition",
                  isActive
                    ? "bg-[linear-gradient(135deg,rgba(125,211,252,0.18),rgba(52,211,153,0.16))] text-white"
                    : "text-white/60 hover:bg-white/10 hover:text-white",
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

