import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MailCheck, MapPin, Phone, ShieldCheck, Sparkles, UploadCloud, UserRound,
} from "lucide-react";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { ToastProvider, useToast } from "../components/ui/Toast";
import { createSessionProfile, getSessionProfile } from "../lib/localStore";

function LoginInner() {
  const toast = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [dpFile, setDpFile] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", region: "" });

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
      await createSessionProfile({ name: form.name, phone: form.phone, email: form.email, region: form.region, dpFile });
      toast.push({ title: "Welcome to SkillNODE", message: "Your local skill profile is ready.", kind: "success" });
      navigate("/dashboard");
    } catch (err) {
      toast.push({ title: "Sign-in failed", message: err?.message || "Unable to create your local profile right now.", kind: "error", durationMs: 4500 });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-scene">
      {/* Theme switcher — top right */}
      <div style={{ position: "absolute", top: 18, right: 22, zIndex: 10 }}>
        <ThemeToggle />
      </div>

      {/* Two-column layout */}
      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: 1100,
        margin: "0 auto", padding: "0 24px",
        display: "grid", gridTemplateColumns: "1.04fr 0.96fr",
        gap: 48, alignItems: "center",
      }}>

        {/* ── Left: Brand hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{ display: "flex", flexDirection: "column", gap: 20 }}
        >
          {/* Logo + name */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <img
              src="/logo-vortex.svg"
              alt="SkillNODE logo"
              style={{ width: 56, height: 56, borderRadius: 14, boxShadow: "0 24px 45px -26px rgba(0,0,0,0.8)" }}
            />
            <div>
              <div className="hero-kicker">Skill Arena</div>
              <div className="display-title" style={{ fontSize: "2.2rem", color: "var(--text)", lineHeight: 1.1 }}>SkillNODE</div>
            </div>
          </div>

          <div style={{ fontSize: "1.65rem", fontWeight: 800, color: "var(--text)", lineHeight: 1.25, letterSpacing: "-0.03em" }}>
            Train your skills, play sharp challenges, build a public profile, and compete in a product that feels built to last.
          </div>

          {/* Info rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 480 }}>
            <InfoRow icon={ShieldCheck} text="Typing, coding, math, grammar, reading, and multiplayer in one connected experience." />
            <InfoRow icon={MailCheck}  text="Clean onboarding with profile, display picture, and a fast local-first sign-in flow." />
            <InfoRow icon={Sparkles}   text="AI coaching hints, fair-play monitoring, and real-time multiplayer powered by Socket.IO." />
          </div>
        </motion.div>

        {/* ── Right: Login card ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div className="login-card">
            <div className="hero-kicker" style={{ marginBottom: 4 }}>Access Portal</div>
            <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text)", marginBottom: 2 }}>
              Enter your profile
            </div>
            <div style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginBottom: 24, lineHeight: 1.6 }}>
              Create your presence and continue into the arena.
            </div>

            <form style={{ display: "flex", flexDirection: "column", gap: 14 }} onSubmit={enterSkillNode}>
              {/* DP upload block */}
              <div style={{
                background: "var(--surface-2)", border: "1px solid var(--border-subtle)",
                borderRadius: 10, padding: 12,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 62, height: 62, borderRadius: 10, overflow: "hidden",
                    background: "var(--input-bg)", border: "1px solid var(--input-border)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    {dpPreview
                      ? <img src={dpPreview} alt="DP preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <UploadCloud size={20} style={{ color: "var(--text-faint)" }} />
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="label-sm" style={{ marginBottom: 6 }}>Display picture</div>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ fontSize: "0.78rem", color: "var(--text-muted)", width: "100%" }}
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

              <Button className="mt-1" size="lg" disabled={busy} style={{ width: "100%" }}>
                {busy ? "Entering..." : "Enter SkillNODE →"}
              </Button>
            </form>
          </div>
        </motion.div>
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

/* ── Sub-components ── */

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label style={{
        display: "flex", alignItems: "center", gap: 5,
        fontSize: "0.72rem", fontWeight: 600,
        letterSpacing: "0.14em", textTransform: "uppercase",
        color: "var(--text-faint)", marginBottom: 5,
      }}>
        <Icon size={12} style={{ color: "var(--accent)" }} />
        {label}
      </label>
      {children}
    </div>
  );
}

function InfoRow({ icon: Icon, text }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      padding: "10px 14px",
      background: "var(--surface-2)", border: "1px solid var(--border-subtle)",
      borderRadius: 10,
    }}>
      <Icon size={15} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 1 }} />
      <span style={{ fontSize: "0.825rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{text}</span>
    </div>
  );
}
