import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Phone, ShieldCheck, Sparkles, UploadCloud, UserRound } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { ToastProvider, useToast } from "../components/ui/Toast";
import { api } from "../lib/api";
import { setToken } from "../lib/auth";

function LoginInner() {
  const toast = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [dpFile, setDpFile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    region: "",
  });

  const dpPreview = useMemo(() => {
    if (!dpFile) return null;
    return URL.createObjectURL(dpFile);
  }, [dpFile]);

  async function enterSkillNode(e) {
    e.preventDefault();
    setBusy(true);

    try {
      const payload = new FormData();
      payload.append("name", form.name.trim());
      payload.append("phone", form.phone.trim());
      payload.append("email", form.email.trim());
      payload.append("region", form.region.trim());
      if (dpFile) payload.append("dp", dpFile);

      const { data } = await api.post("/api/auth/login", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setToken(data.token);
      toast.push({
        title: "Welcome to SkillNODE",
        message: "Profile synced. You are in.",
        kind: "success",
      });
      navigate("/dashboard");
    } catch (err) {
      const message = err?.response?.data?.error || "Could not enter SkillNODE right now.";
      toast.push({ title: "Sign-in failed", message, kind: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-scene">
      <div className="login-shell mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-8 md:px-6">
        <div className="grid w-full grid-cols-1 gap-10 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="space-y-7"
            >
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/40 bg-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">
                <Sparkles size={14} className="text-slate-700" />
                Professional skill arena
              </div>

              <div className="flex items-center gap-4">
                <img src="/logo-vortex.svg" alt="SkillNODE logo" className="h-16 w-16 rounded-[20px] shadow-[0_20px_40px_-25px_rgba(15,23,42,0.55)]" />
                <div>
                  <div className="display-title login-text-dark text-5xl md:text-7xl">SkillNODE</div>
                  <div className="login-muted-dark mt-2 text-lg">
                    Skill testing, games, coding, profiles, and competition in one serious product.
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <LoginSignal title="Glass login" copy="Soft blur, watery layers, and a polished first impression." />
                <LoginSignal title="Direct access" copy="Fast entry for now, while OTP remains available in the backend." />
                <LoginSignal title="Product-grade flow" copy="Once inside, the UI becomes cleaner, sharper, and more corporate." />
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            <Card className="login-glass-card overflow-hidden border-white/30 bg-transparent p-0 shadow-[0_35px_80px_-45px_rgba(15,23,42,0.4)]">
              <div className="border-b border-white/25 p-6 md:p-7">
                <div className="hero-kicker !text-slate-500">Access Portal</div>
                <div className="login-text-dark mt-2 text-3xl font-semibold">Enter your profile</div>
                <div className="login-muted-dark mt-2 text-sm">
                  Email OTP is still preserved in the backend, but this live product now uses a smoother direct entry flow.
                </div>
              </div>

              <form className="space-y-5 p-6 md:p-7" onSubmit={enterSkillNode}>
                <div className="rounded-[26px] border border-white/30 bg-white/22 p-4 backdrop-blur-xl">
                  <div className="flex items-center gap-4">
                    <div className="relative h-[72px] w-[72px] overflow-hidden rounded-[24px] border border-white/35 bg-white/35">
                      {dpPreview ? (
                        <img src={dpPreview} alt="DP preview" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-500">
                          <UploadCloud size={22} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <label className="block text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
                        Display picture
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        className="mt-2 block w-full text-sm text-slate-600 file:mr-3 file:rounded-2xl file:border-0 file:bg-slate-900 file:px-4 file:py-2.5 file:text-sm file:text-white hover:file:bg-slate-800"
                        onChange={(e) => setDpFile(e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Field label="Name" icon={UserRound}>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Your name"
                      required
                      className="border-white/25 bg-white/38 text-slate-800 placeholder:text-slate-500 focus:border-white/60 focus:bg-white/52"
                    />
                  </Field>

                  <Field label="Phone" icon={Phone}>
                    <Input
                      value={form.phone}
                      onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 98..."
                      required
                      className="border-white/25 bg-white/38 text-slate-800 placeholder:text-slate-500 focus:border-white/60 focus:bg-white/52"
                    />
                  </Field>
                </div>

                <Field label="Email" icon={Sparkles}>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="you@domain.com"
                    required
                    className="border-white/25 bg-white/38 text-slate-800 placeholder:text-slate-500 focus:border-white/60 focus:bg-white/52"
                  />
                </Field>

                <Field label="Region" icon={MapPin}>
                  <Input
                    value={form.region}
                    onChange={(e) => setForm((prev) => ({ ...prev, region: e.target.value }))}
                    placeholder="City / State / Country"
                    required
                    className="border-white/25 bg-white/38 text-slate-800 placeholder:text-slate-500 focus:border-white/60 focus:bg-white/52"
                  />
                </Field>

                <div className="rounded-[24px] border border-white/25 bg-white/18 p-4 text-sm text-slate-600">
                  <div className="flex items-start gap-3">
                    <ShieldCheck size={16} className="mt-0.5 text-slate-700" />
                    <span>Login alert and OTP code paths are still kept in the backend, but the live flow is intentionally smoother right now.</span>
                  </div>
                </div>

                <Button className="w-full" size="lg" disabled={busy}>
                  {busy ? "Entering..." : "Enter SkillNODE"}
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function LoginPage() {
  return (
    <ToastProvider>
      <LoginInner />
    </ToastProvider>
  );
}

function LoginSignal({ title, copy }) {
  return (
    <div className="rounded-[24px] border border-white/30 bg-white/20 p-4 backdrop-blur-lg">
      <div className="login-text-dark text-sm font-semibold">{title}</div>
      <div className="login-muted-dark mt-2 text-sm leading-6">{copy}</div>
    </div>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
        <Icon size={14} className="text-slate-500" />
        {label}
      </label>
      {children}
    </div>
  );
}
