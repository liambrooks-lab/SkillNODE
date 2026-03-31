import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MailCheck,
  MapPin,
  Phone,
  Radio,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  UserRound,
} from "lucide-react";
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
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState("");

  const dpPreview = useMemo(() => {
    if (!dpFile) return null;
    return URL.createObjectURL(dpFile);
  }, [dpFile]);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);

    try {
      const form = new FormData();
      form.append("name", name.trim());
      form.append("phone", phone.trim());
      form.append("email", email.trim());
      form.append("region", region.trim());
      if (dpFile) form.append("dp", dpFile);

      const { data } = await api.post("/api/auth/login", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setToken(data.token);
      toast.push({
        title: "Welcome to SkillNODE",
        message: "Profile synced. Login alert email triggered.",
        kind: "success",
      });
      navigate("/dashboard");
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        "Could not sign you in. Check the form and try again.";

      toast.push({ title: "Login failed", message, kind: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-shell-bg">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-8 md:px-6">
        <div className="grid w-full grid-cols-1 gap-10 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="relative flex flex-col justify-center overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,16,29,0.92),rgba(9,16,29,0.62))] p-7 shadow-[0_30px_90px_-50px_rgba(0,0,0,0.85)] md:p-10">
            <div className="absolute inset-y-0 right-0 w-2/3 bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.18),transparent_55%)]" />

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="relative z-10 space-y-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 backdrop-blur-xl">
                <Sparkles size={14} className="text-cyan-200" />
                AI-powered skill arena | Multiplayer-ready
              </div>

              <div className="display-title max-w-3xl text-5xl leading-[0.95] md:text-7xl">
                SkillNODE
              </div>

              <div className="max-w-2xl text-lg text-white/72">
                A premium web app for skill testing, games, coding battles, math pressure drills,
                English practice, public profiles, and serious collaboration.
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <FeaturePill
                  icon={MailCheck}
                  title="Login email alerts"
                  copy="Every sign-in can trigger a mail to the user who logs in."
                />
                <FeaturePill
                  icon={ShieldCheck}
                  title="Fair-play sentinel"
                  copy="Best-effort screenshot and focus-loss alerts are built into challenge screens."
                />
                <FeaturePill
                  icon={Radio}
                  title="Live social energy"
                  copy="Presence, room flow, and multiplayer foundations are ready for growth."
                />
              </div>

              <div className="grid gap-4 rounded-[28px] border border-white/10 bg-slate-950/32 p-5 backdrop-blur-xl md:grid-cols-3">
                <Metric label="Skill tracks" value="6+" />
                <Metric label="Modes" value="Solo / multi" />
                <Metric label="Look & feel" value="MNC-grade" />
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            <Card className="overflow-hidden p-0">
              <div className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 md:p-7">
                <div className="hero-kicker">Access Portal</div>
                <div className="mt-2 text-2xl font-semibold">Create or enter your profile</div>
                <div className="mt-2 text-sm text-white/60">
                  Upload your DP, add your details, and the backend will handle the login alert
                  email after sign-in.
                </div>
              </div>

              <form className="space-y-5 p-6 md:p-7" onSubmit={onSubmit}>
                <div className="flex items-center gap-4 rounded-[26px] border border-white/10 bg-white/5 p-4">
                  <div className="relative h-[72px] w-[72px] overflow-hidden rounded-[24px] border border-white/10 bg-white/5">
                    {dpPreview ? (
                      <img src={dpPreview} alt="DP preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white/30">
                        <UploadCloud size={22} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <label className="block text-xs font-medium uppercase tracking-[0.22em] text-white/50">
                      Display picture
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      className="mt-2 block w-full text-sm text-white/70 file:mr-3 file:rounded-2xl file:border-0 file:bg-white/10 file:px-4 file:py-2.5 file:text-sm file:text-white hover:file:bg-white/15"
                      onChange={(e) => setDpFile(e.target.files?.[0] || null)}
                    />
                    <div className="mt-2 text-xs text-white/45">
                      Ideal for a clean profile preview and share card.
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Field label="Name" icon={UserRound}>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
                  </Field>

                  <Field label="Phone" icon={Phone}>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98..." required />
                  </Field>
                </div>

                <Field label="Email" icon={MailCheck}>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    required
                  />
                </Field>

                <Field label="Region" icon={MapPin}>
                  <Input
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="City / State / Country"
                    required
                  />
                </Field>

                <div className="grid gap-3 rounded-[26px] border border-white/10 bg-slate-950/28 p-4 text-sm text-white/65">
                  <div className="flex items-start gap-3">
                    <MailCheck size={16} className="mt-0.5 text-cyan-200" />
                    <span>Sign-in email alerts are triggered asynchronously on the server after login.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShieldCheck size={16} className="mt-0.5 text-emerald-300" />
                    <span>Competition screens show alerts when Print Screen or focus-loss is detected.</span>
                  </div>
                </div>

                <Button className="w-full" size="lg" disabled={busy}>
                  {busy ? "Signing in..." : "Enter SkillNODE"}
                </Button>

                <div className="text-xs text-white/50">
                  By continuing, you agree to competitive integrity rules. Screenshot detection on
                  the web is best-effort, not guaranteed, but the alerting pipeline is in place.
                </div>
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

function FeaturePill({ icon: Icon, title, copy }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Icon size={16} className="text-cyan-200" />
        {title}
      </div>
      <div className="mt-2 text-sm text-white/60">{copy}</div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-xs uppercase tracking-[0.22em] text-white/45">{label}</div>
      <div className="mt-2 text-xl font-semibold">{value}</div>
    </div>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-white/50">
        <Icon size={14} className="text-white/50" />
        {label}
      </label>
      {children}
    </div>
  );
}
