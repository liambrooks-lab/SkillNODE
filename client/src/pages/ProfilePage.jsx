import { useEffect, useMemo, useState } from "react";
import { Copy, MailCheck, MapPin, Phone, Save, Share2, UserRound } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { ToastProvider, useToast } from "../components/ui/Toast";
import { api } from "../lib/api";
import { resolveMediaUrl } from "../lib/media";

function ProfileInner() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState({
    name: "",
    email: "",
    phone: "",
    region: "",
  });
  const [dpFile, setDpFile] = useState(null);

  const dpPreview = useMemo(() => {
    if (dpFile) return URL.createObjectURL(dpFile);
    return resolveMediaUrl(me?.dpUrl);
  }, [dpFile, me?.dpUrl]);

  const shareUrl = me ? `${window.location.origin}/u/${me.id}` : "";

  useEffect(() => {
    let alive = true;

    api
      .get("/api/me")
      .then(({ data }) => {
        if (!alive) return;
        setMe(data);
        setDraft({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          region: data.region || "",
        });
      })
      .catch((err) => {
        if (!alive) return;
        setError(err?.response?.data?.error || "Failed to load profile.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  async function saveProfile(e) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const form = new FormData();
      form.append("name", draft.name.trim());
      form.append("email", draft.email.trim());
      form.append("phone", draft.phone.trim());
      form.append("region", draft.region.trim());
      if (dpFile) form.append("dp", dpFile);

      const { data } = await api.patch("/api/me", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMe(data);
      setDraft({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        region: data.region || "",
      });
      setDpFile(null);
      toast.push({ title: "Profile updated", message: "Your public card is now refreshed.", kind: "success" });
    } catch (err) {
      const message = err?.response?.data?.error || "Could not update profile.";
      setError(message);
      toast.push({ title: "Update failed", message, kind: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function copyShareLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.push({ title: "Share link copied", message: shareUrl, kind: "success" });
    } catch {
      toast.push({ title: "Copy unavailable", message: shareUrl, kind: "warning" });
    }
  }

  async function shareProfile() {
    if (!shareUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${me.name} on SkillNODE`,
          text: `Check out ${me.name}'s SkillNODE profile.`,
          url: shareUrl,
        });
      } catch {
        // Ignore cancelled share interactions.
      }
      return;
    }

    await copyShareLink();
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-sm text-white/55">Loading profile...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="overflow-hidden p-0">
          <div className="h-28 bg-[linear-gradient(135deg,rgba(125,211,252,0.4),rgba(52,211,153,0.24),rgba(245,158,11,0.18))]" />
          <div className="p-6">
            <div className="-mt-16 flex items-end gap-4">
              <div className="h-24 w-24 overflow-hidden rounded-[28px] border border-white/10 bg-slate-950">
                {dpPreview ? (
                  <img src={dpPreview} alt={draft.name || "Profile"} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-semibold">
                    {(draft.name || "S").slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="pb-3">
                <div className="hero-kicker">Public Profile</div>
                <div className="mt-2 text-2xl font-semibold">{draft.name || "Your profile"}</div>
                <div className="mt-1 text-sm text-white/58">{draft.region || "Add your region"}</div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 text-sm">
              <MetaLine icon={MailCheck} text={draft.email || "No email"} />
              <MetaLine icon={Phone} text={draft.phone || "No phone"} />
              <MetaLine icon={MapPin} text={draft.region || "No region"} />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button variant="secondary" className="gap-2" onClick={copyShareLink}>
                <Copy size={16} />
                Copy link
              </Button>
              <Button className="gap-2" onClick={shareProfile}>
                <Share2 size={16} />
                Share profile
              </Button>
            </div>

            <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-white/62">
              Anyone with your share link can open your public profile card. Private account editing
              stays behind login.
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="hero-kicker">Profile Studio</div>
          <div className="mt-2 text-2xl font-semibold">Edit and polish your identity</div>
          <div className="mt-2 text-sm text-white/60">
            Update your core details, swap the DP, and keep your public share card fresh.
          </div>

          <form className="mt-6 space-y-5" onSubmit={saveProfile}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Name" icon={UserRound}>
                <Input
                  value={draft.name}
                  onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </Field>
              <Field label="Email" icon={MailCheck}>
                <Input
                  type="email"
                  value={draft.email}
                  onChange={(e) => setDraft((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Phone" icon={Phone}>
                <Input
                  value={draft.phone}
                  onChange={(e) => setDraft((prev) => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </Field>
              <Field label="Region" icon={MapPin}>
                <Input
                  value={draft.region}
                  onChange={(e) => setDraft((prev) => ({ ...prev, region: e.target.value }))}
                  required
                />
              </Field>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-white/50">
                Display picture
              </label>
              <input
                type="file"
                accept="image/*"
                className="block w-full text-sm text-white/70 file:mr-3 file:rounded-2xl file:border-0 file:bg-white/10 file:px-4 file:py-2.5 file:text-sm file:text-white hover:file:bg-white/15"
                onChange={(e) => setDpFile(e.target.files?.[0] || null)}
              />
            </div>

            {error ? <div className="text-sm text-rose-300">{error}</div> : null}

            <div className="flex flex-wrap gap-3">
              <Button className="gap-2" disabled={busy}>
                <Save size={16} />
                {busy ? "Saving..." : "Save profile"}
              </Button>
              <Button type="button" variant="secondary" onClick={copyShareLink}>
                Preview share route
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export function ProfilePage() {
  return (
    <ToastProvider>
      <ProfileInner />
    </ToastProvider>
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

function MetaLine({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/5 px-4 py-3">
      <Icon size={16} className="text-cyan-200" />
      <span>{text}</span>
    </div>
  );
}
