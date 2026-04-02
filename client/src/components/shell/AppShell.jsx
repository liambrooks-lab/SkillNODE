import { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutGrid, Swords, Trophy, UserCircle2, LogOut, ShieldCheck, Radio } from "lucide-react";
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
            <div className="rounded-[30px] border border-white/8 bg-[#151a20] p-5 shadow-[0_24px_60px_-42px_rgba(0,0,0,0.88)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img src="/logo-vortex.svg" alt="SkillNODE logo" className="h-12 w-12 rounded-2xl" />
                  <div>
                    <div className="hero-kicker">SkillNODE</div>
                    <div className="display-title text-2xl">Train Hard. Look Sharp.</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-[24px] border border-white/8 bg-[#101419] p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-white/40">Player</div>
                <div className="mt-3 flex items-center gap-3">
                  {me?.dpUrl ? (
                    <img src={resolveMediaUrl(me.dpUrl)} alt={me.name} className="h-12 w-12 rounded-2xl object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/8 text-base font-semibold">
                      {me?.name?.slice(0, 1)?.toUpperCase() || "S"}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold">{me?.name || "Loading profile"}</div>
                    <div className="text-sm text-white/55">{me?.region || "Syncing region"}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-[22px] border border-white/8 bg-[#101419] p-3">
                  <div className="flex items-center gap-2 text-white/55">
                    <ShieldCheck size={15} className="text-[#8be6cf]" />
                    Fair play
                  </div>
                  <div className="mt-2 text-lg font-semibold">Active</div>
                </div>
                <div className="rounded-[22px] border border-white/8 bg-[#101419] p-3">
                  <div className="flex items-center gap-2 text-white/55">
                    <Radio size={15} className="text-white/75" />
                    Presence
                  </div>
                  <div className="mt-2 text-lg font-semibold">Live</div>
                </div>
              </div>
            </div>

            <nav className="rounded-[28px] border border-white/8 bg-[#151a20] p-2.5 shadow-[0_24px_60px_-42px_rgba(0,0,0,0.88)]">
              {items.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                      isActive
                        ? "bg-[#f4f6f8] text-slate-950"
                        : "text-white/72 hover:bg-white/6 hover:text-white",
                    )
                  }
                >
                  <it.icon size={18} className="opacity-85 group-hover:opacity-100" />
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
          <div className="rounded-[30px] border border-white/8 bg-[#151a20] px-5 py-4 shadow-[0_24px_60px_-42px_rgba(0,0,0,0.88)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <img src="/logo-vortex.svg" alt="SkillNODE logo" className="hidden h-12 w-12 rounded-2xl md:block" />
                <div>
                  <div className="hero-kicker">Professional Skill Platform</div>
                  <div className="display-title text-3xl">Level up, compete, connect.</div>
                  <div className="mt-2 max-w-2xl text-sm text-white/58">
                    Cleaner surfaces, sharper hierarchy, and stronger product polish across the whole experience.
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="rounded-[22px] border border-white/8 bg-[#101419] px-4 py-3">
                  <div className="text-white/42">AI coach</div>
                  <div className="mt-1 font-semibold">Contextual hints</div>
                </div>
                <div className="rounded-[22px] border border-white/8 bg-[#101419] px-4 py-3">
                  <div className="text-white/42">Modes</div>
                  <div className="mt-1 font-semibold">Solo + multiplayer</div>
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

      <nav className="fixed bottom-4 left-1/2 z-40 w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 rounded-[28px] border border-white/8 bg-[#151a20] p-2.5 shadow-[0_24px_60px_-42px_rgba(0,0,0,0.88)] lg:hidden">
        <div className="grid grid-cols-4 gap-2">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 rounded-2xl py-2.5 text-xs transition",
                  isActive ? "bg-[#f4f6f8] text-slate-950" : "text-white/60 hover:bg-white/6 hover:text-white",
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
