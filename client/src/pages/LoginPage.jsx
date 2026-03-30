import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UploadCloud, Sparkles } from "lucide-react";
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
      toast.push({ title: "Welcome to SkillNODE", message: "You’re in.", kind: "success" });
      navigate("/dashboard");
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        "Could not sign you in. Check details and try again.";
      toast.push({ title: "Login failed", message, kind: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen app-shell-bg">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 md:px-6">
        <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
          <div className="flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur-xl">
                <Sparkles size={14} className="text-indigo-300" />
                AI-powered skill arena • Multiplayer-ready
              </div>
              <div className="text-4xl font-semibold tracking-tight md:text-5xl">
                SkillNODE
              </div>
              <div className="text-white/70">
                Compete in typing, math, puzzles, challenges — and build a profile worth
                flexing.
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            <Card className="p-6 md:p-7">
              <div className="mb-6">
                <div className="text-lg font-semibold">Login / Create profile</div>
                <div className="mt-1 text-sm text-white/60">
                  Add your details and we’ll email you a login alert.
                </div>
              </div>

              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    {dpPreview ? (
                      // eslint-disable-next-line jsx-a11y/img-redundant-alt
                      <img src={dpPreview} alt="DP preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white/30">
                        <UploadCloud size={18} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-white/70">Display picture</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="mt-1 block w-full text-sm text-white/70 file:mr-3 file:rounded-xl file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:text-white hover:file:bg-white/15"
                      onChange={(e) => setDpFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-white/70">Name</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/70">Phone</label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91…" required />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/70">Email</label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@domain.com" required />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/70">Region</label>
                  <Input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="City / Country" required />
                </div>

                <Button className="w-full" disabled={busy}>
                  {busy ? "Signing in…" : "Enter SkillNODE"}
                </Button>

                <div className="text-xs text-white/50">
                  By continuing, you agree to fair play rules. In competition modes we may
                  flag tab switches and suspicious behavior.
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

