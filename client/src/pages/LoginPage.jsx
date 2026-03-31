import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
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
  const [step, setStep] = useState("profile");
  const [debugCode, setDebugCode] = useState("");
  const [otp, setOtp] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    region: "",
  });
  const [dpFile, setDpFile] = useState(null);

  const dpPreview = useMemo(() => {
    if (!dpFile) return null;
    return URL.createObjectURL(dpFile);
  }, [dpFile]);

  async function requestCode(e) {
    e.preventDefault();
    setBusy(true);

    try {
      const payload = new FormData();
      payload.append("name", form.name.trim());
      payload.append("phone", form.phone.trim());
      payload.append("email", form.email.trim());
      payload.append("region", form.region.trim());
      if (dpFile) payload.append("dp", dpFile);

      const { data } = await api.post("/api/auth/request-code", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setDebugCode(data.debugCode || "");
      setStep("verify");
      toast.push({
        title: "Verification code sent",
        message: data.debugCode
          ? "Email delivery is in dev mode, so the verification code is shown on screen."
          : "Check your email to continue.",
        kind: "success",
      });
    } catch (err) {
      const message = err?.response?.data?.error || "Could not send verification code.";
      toast.push({ title: "Request failed", message, kind: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(e) {
    e.preventDefault();
    setBusy(true);

    try {
      const { data } = await api.post("/api/auth/verify-code", {
        email: form.email.trim(),
        code: otp.trim(),
      });

      setToken(data.token);
      toast.push({
        title: "Welcome to SkillNODE",
        message: "Secure sign-in complete. Login alert email triggered.",
        kind: "success",
      });
      navigate("/dashboard");
    } catch (err) {
      const message = err?.response?.data?.error || "Could not verify that code.";
      toast.push({ title: "Verification failed", message, kind: "error" });
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
                AI-powered skill arena | Secure email verification
              </div>

              <div className="display-title max-w-3xl text-5xl leading-[0.95] md:text-7xl">
                SkillNODE
              </div>

              <div className="max-w-2xl text-lg text-white/72">
                A premium web app for skill testing, games, coding battles, math drills, English
                practice, public profiles, and social competition.
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <FeaturePill
                  icon={MailCheck}
                  title="Verification first"
                  copy="Login now uses a proper email verification code before issuing a session token."
                />
                <FeaturePill
                  icon={ShieldCheck}
                  title="Fair-play sentinel"
                  copy="Best-effort screenshot and focus-loss alerts are built into challenge screens."
                />
                <FeaturePill
                  icon={Radio}
                  title="Live product core"
                  copy="Profiles, scores, leaderboards, and rooms now sit on persistent backend APIs."
                />
              </div>

              <div className="grid gap-4 rounded-[28px] border border-white/10 bg-slate-950/32 p-5 backdrop-blur-xl md:grid-cols-3">
                <Metric label="Auth mode" value="Email OTP" />
                <Metric label="Profile fields" value="DP + identity" />
                <Metric label="Deploy shape" value="MVP-ready" />
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
                <div className="hero-kicker">Secure Access Portal</div>
                <div className="mt-2 text-2xl font-semibold">
                  {step === "profile" ? "Create or enter your profile" : "Verify your email code"}
                </div>
                <div className="mt-2 text-sm text-white/60">
                  {step === "profile"
                    ? "Fill in your profile details and we will send a verification code to your email."
                    : `Enter the 6-digit code sent to ${form.email}.`}
                </div>
              </div>

              {step === "profile" ? (
                <form className="space-y-5 p-6 md:p-7" onSubmit={requestCode}>
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
                        Image uploads only. Max size is 3 MB.
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
                      />
                    </Field>

                    <Field label="Phone" icon={Phone}>
                      <Input
                        value={form.phone}
                        onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="+91 98..."
                        required
                      />
                    </Field>
                  </div>

                  <Field label="Email" icon={MailCheck}>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="you@domain.com"
                      required
                    />
                  </Field>

                  <Field label="Region" icon={MapPin}>
                    <Input
                      value={form.region}
                      onChange={(e) => setForm((prev) => ({ ...prev, region: e.target.value }))}
                      placeholder="City / State / Country"
                      required
                    />
                  </Field>

                  <div className="grid gap-3 rounded-[26px] border border-white/10 bg-slate-950/28 p-4 text-sm text-white/65">
                    <div className="flex items-start gap-3">
                      <MailCheck size={16} className="mt-0.5 text-cyan-200" />
                      <span>The backend sends a verification code first, then a login alert after successful sign-in.</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <ShieldCheck size={16} className="mt-0.5 text-emerald-300" />
                      <span>Challenge pages log suspicious focus-loss and screenshot-key events to the server.</span>
                    </div>
                  </div>

                  <Button className="w-full" size="lg" disabled={busy}>
                    {busy ? "Sending code..." : "Send verification code"}
                  </Button>
                </form>
              ) : (
                <form className="space-y-5 p-6 md:p-7" onSubmit={verifyCode}>
                  <div className="rounded-[26px] border border-white/10 bg-white/5 p-5">
                    <div className="text-xs uppercase tracking-[0.22em] text-white/45">Email</div>
                    <div className="mt-2 text-lg font-semibold">{form.email}</div>
                    <div className="mt-2 text-sm text-white/58">
                      We only create the session after this verification step succeeds.
                    </div>
                  </div>

                  <Field label="Verification code" icon={MailCheck}>
                    <Input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="Enter 6-digit code"
                      inputMode="numeric"
                      maxLength={6}
                      required
                    />
                  </Field>

                  {debugCode ? (
                    <div className="rounded-[24px] border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-50">
                      Dev mode code: <span className="font-semibold tracking-[0.2em]">{debugCode}</span>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-3">
                    <Button type="submit" className="flex-1" size="lg" disabled={busy || otp.length !== 6}>
                      {busy ? "Verifying..." : "Verify and sign in"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="gap-2"
                      onClick={() => {
                        setStep("profile");
                        setOtp("");
                      }}
                    >
                      <ArrowLeft size={16} />
                      Back
                    </Button>
                  </div>
                </form>
              )}
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
