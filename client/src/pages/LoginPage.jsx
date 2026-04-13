import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MailCheck, MapPin, Phone, ShieldCheck, Sparkles, UploadCloud, UserRound } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { ToastProvider, useToast } from "../components/ui/Toast";
import { createSessionProfile, getSessionProfile } from "../lib/localStore";

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

  useEffect(() => {
    const profile = getSessionProfile();
    if (!profile) return;
    setForm({
      name: profile.name || "",
      phone: profile.phone || "",
      email: profile.email || "",
      region: profile.region || "",
    });
  }, []);

  const dpPreview = useMemo(() => {
    if (!dpFile) return null;
    return URL.createObjectURL(dpFile);
  }, [dpFile]);

  async function enterSkillNode(e) {
    e.preventDefault();
    setBusy(true);

    try {
      await createSessionProfile({
        name: form.name,
        phone: form.phone,
        email: form.email,
        region: form.region,
        dpFile,
      });
      toast.push({
        title: "Welcome to SkillNODE",
        message: "Your local skill profile is ready.",
        kind: "success",
      });
      navigate("/dashboard");
    } catch (err) {
      toast.push({
        title: "Sign-in failed",
        message: err?.message || "Unable to create your local profile right now.",
        kind: "error",
        durationMs: 4500,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-scene">
      <div className="login-shell mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-8 md:px-6">
        <div className="grid w-full grid-cols-1 gap-10 lg:grid-cols-[1.04fr_0.96fr]">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="hidden flex-col justify-center lg:flex"
          >
            <div className="space-y-6">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/70 backdrop-blur-xl">
                <Sparkles size={14} className="text-[#8be6cf]" />
                Skill arena
              </div>

              <div className="flex items-center gap-4">
                <img
                  src="/logo-vortex.svg"
                  alt="SkillNODE logo"
                  className="h-16 w-16 rounded-[20px] shadow-[0_24px_45px_-26px_rgba(0,0,0,0.8)]"
                />
                <div>
                  <div className="display-title login-text-dark text-5xl md:text-6xl">SkillNODE</div>
                  <div className="login-muted-dark mt-2 max-w-xl text-lg">
                    Train your skills, play sharp challenges, build a public profile, and compete in a product that feels built to last.
                  </div>
                </div>
              </div>

              <div className="grid max-w-xl gap-3">
                <InfoRow icon={ShieldCheck} text="Typing, coding, math, grammar, reading, and multiplayer in one connected experience." />
                <InfoRow icon={MailCheck} text="Clean onboarding with profile, display picture, and a fast local-first sign-in flow." />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="flex items-center justify-center"
          >
            <Card className="login-glass-card w-full max-w-md overflow-hidden rounded-[30px] border-white/12 bg-transparent p-0">
              <div className="p-7">
                <div className="mb-6 flex items-center gap-4 lg:hidden">
                  <img
                    src="/logo-vortex.svg"
                    alt="SkillNODE logo"
                    className="h-14 w-14 rounded-[18px] shadow-[0_18px_40px_-24px_rgba(0,0,0,0.7)]"
                  />
                  <div>
                    <div className="display-title login-text-dark text-3xl">SkillNODE</div>
                    <div className="login-muted-dark mt-1 text-sm">Sign in to your skill arena</div>
                  </div>
                </div>

                <div className="mb-6 hidden lg:block">
                  <div className="hero-kicker">Access Portal</div>
                  <div className="login-text-dark mt-2 text-3xl font-semibold">Enter your profile</div>
                  <div className="login-muted-dark mt-2 text-sm">
                    Create your presence and continue into the arena.
                  </div>
                </div>

                <form className="space-y-4" onSubmit={enterSkillNode}>
                  <div className="login-frost rounded-[24px] p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-[68px] w-[68px] overflow-hidden rounded-[20px] border border-white/10 bg-white/5">
                        {dpPreview ? (
                          <img src={dpPreview} alt="DP preview" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-white/35">
                            <UploadCloud size={20} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <label className="mb-2 block text-xs font-medium uppercase tracking-[0.22em] text-white/45">
                          Display picture
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          className="block w-full text-sm text-white/70 file:mr-3 file:rounded-2xl file:border-0 file:bg-white/10 file:px-4 file:py-2.5 file:text-sm file:text-white hover:file:bg-white/15"
                          onChange={(e) => setDpFile(e.target.files?.[0] || null)}
                        />
                      </div>
                    </div>
                  </div>

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

                  <Button className="mt-2 w-full" size="lg" disabled={busy}>
                    {busy ? "Entering..." : "Enter SkillNODE"}
                  </Button>
                </form>
              </div>
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

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-white/45">
        <Icon size={14} className="text-white/45" />
        {label}
      </label>
      {children}
    </div>
  );
}

function InfoRow({ icon: Icon, text }) {
  return (
    <div className="login-frost flex items-start gap-3 rounded-[22px] px-4 py-3">
      <Icon size={16} className="mt-0.5 text-[#8be6cf]" />
      <span className="login-muted-dark text-sm leading-6">{text}</span>
    </div>
  );
}
