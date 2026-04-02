import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MailCheck, MapPin, Phone, UploadCloud, UserRound } from "lucide-react";
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
      let message = err?.response?.data?.error || "Could not enter SkillNODE right now.";

      if (err?.response?.status === 404 || err?.response?.status === 405) {
        message = "Backend is still on the old deploy. Redeploy Render once.";
      } else if (!err?.response) {
        message = "Could not reach the server. Check the deployed API URL and backend status.";
      }

      toast.push({ title: "Sign-in failed", message, kind: "error", durationMs: 5000 });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-scene">
      <div className="login-shell mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-8 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md"
        >
          <Card className="login-glass-card overflow-hidden rounded-[30px] bg-transparent p-0">
            <div className="p-7">
              <div className="mb-6 flex items-center gap-4">
                <img
                  src="/logo-vortex.svg"
                  alt="SkillNODE logo"
                  className="h-14 w-14 rounded-[18px] shadow-[0_18px_40px_-24px_rgba(0,0,0,0.7)]"
                />
                <div>
                  <div className="display-title login-text-dark text-3xl">SkillNODE</div>
                  <div className="login-muted-dark mt-1 text-sm">
                    Sign in to your skill arena
                  </div>
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
