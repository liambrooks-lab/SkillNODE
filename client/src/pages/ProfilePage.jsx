import { useEffect, useMemo, useState } from "react";
import {
  Copy, Globe, Link2, MailCheck, MapPin, Phone, Save, Share2, Trophy, UserRound,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { ToastProvider, useToast } from "../components/ui/Toast";
import {
  encodePublicProfilePayload,
  getSessionProfile,
  getSummary,
  updateSessionProfile,
} from "../lib/localStore";
import { resolveMediaUrl } from "../lib/media";

const TABS = ["Profile", "Edit", "Sessions"];

function ProfileInner() {
  const toast = useToast();
  const [tab, setTab] = useState("Profile");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState({
    name: "", email: "", phone: "", region: "",
    bio: "", githubUrl: "", linkedinUrl: "", portfolioUrl: "", xUrl: "",
  });
  const [dpFile, setDpFile] = useState(null);

  const dpPreview = useMemo(() => {
    if (dpFile) return URL.createObjectURL(dpFile);
    return resolveMediaUrl(me?.dpUrl);
  }, [dpFile, me?.dpUrl]);

  const shareUrl = me
    ? `${window.location.origin}/u/${me.id}?profile=${encodeURIComponent(encodePublicProfilePayload(me.id))}`
    : "";

  const socialRows = [
    { key: "githubUrl",    label: "GitHub",      icon: Link2, placeholder: "https://github.com/username" },
    { key: "linkedinUrl",  label: "LinkedIn",    icon: Link2, placeholder: "https://linkedin.com/in/username" },
    { key: "portfolioUrl", label: "Portfolio",   icon: Globe, placeholder: "https://your-portfolio.com" },
    { key: "xUrl",         label: "X / Twitter", icon: Globe, placeholder: "https://x.com/username" },
  ];

  useEffect(() => {
    try {
      const data = getSessionProfile();
      if (!data) {
        setError("No local profile found.");
      } else {
        setMe(data);
        setSummary(getSummary(data.id));
        setDraft({
          name: data.name || "", email: data.email || "",
          phone: data.phone || "", region: data.region || "",
          bio: data.bio || "", githubUrl: data.githubUrl || "",
          linkedinUrl: data.linkedinUrl || "", portfolioUrl: data.portfolioUrl || "",
          xUrl: data.xUrl || "",
        });
      }
    } catch (err) {
      setError(err?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function saveProfile(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const profile = await updateSessionProfile({ ...draft, dpFile });
      setMe(profile);
      setSummary(getSummary(profile.id));
      setDraft({
        name: profile.name || "", email: profile.email || "",
        phone: profile.phone || "", region: profile.region || "",
        bio: profile.bio || "", githubUrl: profile.githubUrl || "",
        linkedinUrl: profile.linkedinUrl || "", portfolioUrl: profile.portfolioUrl || "",
        xUrl: profile.xUrl || "",
      });
      setDpFile(null);
      toast.push({ title: "Profile updated", message: "Your local profile card is now refreshed.", kind: "success" });
    } catch (err) {
      const message = err?.message || "Could not update profile.";
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
        await navigator.share({ title: `${me.name} on SkillNODE`, text: `Check out ${me.name}'s SkillNODE profile.`, url: shareUrl });
      } catch { /* Ignore cancelled shares */ }
      return;
    }
    await copyShareLink();
  }

  if (loading) {
    return (
      <div className="flex-col-fill" style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Loading profile…</div>
      </div>
    );
  }

  return (
    <div className="flex-col-fill" style={{ gap: 12 }}>

      {/* ── Tabs ── */}
      <div className="page-tabs" style={{ flexShrink: 0 }}>
        {TABS.map((t) => (
          <button key={t} className={`page-tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {/* ── Tab: Profile (view) ── */}
      {tab === "Profile" && (
        <div className="app-split-grid" style={{ display: "grid", gridTemplateColumns: "0.85fr 1.15fr", gap: 10, flex: 1, minHeight: 0 }}>

          {/* Left column: identity card */}
          <Card style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {/* Cover gradient */}
            <div style={{ height: 80, background: "linear-gradient(135deg,var(--accent-dim),var(--orb-1))" }} />
            <div style={{ padding: 20, flex: 1 }}>
              {/* Avatar */}
              <div style={{ marginTop: -36, marginBottom: 14, display: "flex", alignItems: "flex-end", gap: 12 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 14, overflow: "hidden",
                  border: "2px solid var(--border)", background: "var(--surface-2)", flexShrink: 0,
                }}>
                  {dpPreview
                    ? <img src={dpPreview} alt={draft.name || "Profile"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 800, color: "var(--accent)" }}>
                        {(draft.name || "S").slice(0, 1).toUpperCase()}
                      </div>
                  }
                </div>
                <div style={{ paddingBottom: 4 }}>
                  <div className="hero-kicker">Public Profile</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", marginTop: 2 }}>{draft.name || "Your profile"}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{draft.region || "Add your region"}</div>
                </div>
              </div>

              {/* Contact info */}
              <div style={{ display: "grid", gap: 6, marginBottom: 14 }}>
                <MetaLine icon={MailCheck} text={draft.email || "No email"} />
                <MetaLine icon={Phone}     text={draft.phone || "No phone"} />
                <MetaLine icon={MapPin}    text={draft.region || "No region"} />
              </div>

              {/* Bio */}
              <div style={{
                borderRadius: 8, border: "1px solid var(--border-subtle)",
                background: "var(--surface-2)", padding: "12px 14px", marginBottom: 14,
              }}>
                <div className="label-sm" style={{ marginBottom: 6 }}>Bio</div>
                <div style={{ fontSize: "0.85rem", lineHeight: 1.7, color: "var(--text-muted)" }}>
                  {draft.bio || "Add a short bio to tell people what you do, what you enjoy, or what you are building."}
                </div>
              </div>

              {/* Action buttons */}
              <div className="app-card-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                <Button variant="secondary" style={{ gap: 6 }} onClick={copyShareLink}>
                  <Copy size={14} /> Copy link
                </Button>
                <Button style={{ gap: 6 }} onClick={shareProfile}>
                  <Share2 size={14} /> Share profile
                </Button>
              </div>

              {/* Stats chips */}
              <div className="app-card-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <StatChip label="Attempts" value={String(summary?.totals?.totalAttempts ?? 0)} />
                <StatChip label="Alerts"   value={String(summary?.totals?.alertCount ?? 0)} />
              </div>
            </div>
          </Card>

          {/* Right column: social + recent sessions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 0 }}>
            <Card style={{ padding: 18 }}>
              <div className="hero-kicker" style={{ marginBottom: 4 }}>Social Links</div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>
                Your public touchpoints
              </div>
              <div className="app-card-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {socialRows.map((social) => (
                  <SocialCard key={social.key} label={social.label} href={draft[social.key]} />
                ))}
              </div>
            </Card>

            <Card style={{ padding: 18, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              <div className="hero-kicker" style={{ marginBottom: 4 }}>Recent Sessions</div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>
                Latest saved activity runs
              </div>
              <div className="inner-scroll flex-col-fill" style={{ gap: 6, display: "flex", flexDirection: "column" }}>
                {(summary?.recentResults || []).map((result) => (
                  <div key={result.id} style={{
                    padding: "10px 14px",
                    background: "var(--surface-2)", border: "1px solid var(--border-subtle)", borderRadius: 8,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, textTransform: "capitalize", fontSize: "0.875rem", color: "var(--text)" }}>
                        <Trophy size={14} style={{ color: "var(--accent)" }} />
                        {result.activityType}
                      </div>
                      <div style={{ fontWeight: 700, color: "var(--accent-bright)" }}>{formatScore(result.score)}</div>
                    </div>
                    <div style={{ marginTop: 4, fontSize: "0.775rem", color: "var(--text-muted)" }}>
                      {result.accuracy != null ? `Accuracy ${Math.round(result.accuracy)}%` : "Accuracy not tracked"}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── Tab: Edit Profile ── */}
      {tab === "Edit" && (
        <Card style={{ padding: 22, flex: 1, minHeight: 0 }} className="inner-scroll">
          <div className="hero-kicker" style={{ marginBottom: 4 }}>Profile Studio</div>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
            Edit and polish your identity
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.6 }}>
            Update your details, bio, and social presence so your local-first SkillNODE profile feels complete on desktop and mobile.
          </div>

          <form style={{ display: "flex", flexDirection: "column", gap: 16 }} onSubmit={saveProfile}>
            <div className="app-form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Name" icon={UserRound}><Input value={draft.name} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))} required /></Field>
              <Field label="Email" icon={MailCheck}><Input type="email" value={draft.email} onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))} required /></Field>
            </div>
            <div className="app-form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Phone" icon={Phone}><Input value={draft.phone} onChange={(e) => setDraft((p) => ({ ...p, phone: e.target.value }))} required /></Field>
              <Field label="Region" icon={MapPin}><Input value={draft.region} onChange={(e) => setDraft((p) => ({ ...p, region: e.target.value }))} required /></Field>
            </div>

            <div>
              <label className="label-sm" style={{ display: "block", marginBottom: 6 }}>Bio</label>
              <textarea
                className="field"
                value={draft.bio}
                onChange={(e) => setDraft((p) => ({ ...p, bio: e.target.value }))}
                placeholder="Write a short bio about yourself, your skills, or your goals."
                maxLength={280}
                style={{ minHeight: 80 }}
              />
              <div style={{ textAlign: "right", fontSize: "0.7rem", color: "var(--text-faint)", marginTop: 3 }}>
                {draft.bio.length}/280
              </div>
            </div>

            <div className="app-form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {socialRows.map((social) => (
                <Field key={social.key} label={social.label} icon={social.icon}>
                  <Input
                    value={draft[social.key]}
                    onChange={(e) => setDraft((p) => ({ ...p, [social.key]: e.target.value }))}
                    placeholder={social.placeholder}
                  />
                </Field>
              ))}
            </div>

            <div>
              <div className="label-sm" style={{ marginBottom: 6 }}>Display picture</div>
              <input
                type="file" accept="image/*"
                style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}
                onChange={(e) => setDpFile(e.target.files?.[0] || null)}
              />
            </div>

            {error ? <div style={{ fontSize: "0.825rem", color: "#f87171" }}>{error}</div> : null}

            <div className="app-action-row" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <Button style={{ gap: 6 }} disabled={busy}>
                <Save size={14} /> {busy ? "Saving..." : "Save profile"}
              </Button>
              <Button type="button" variant="secondary" onClick={copyShareLink}>
                Preview share route
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ── Tab: Sessions ── */}
      {tab === "Sessions" && (
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="app-split-grid" style={{ display: "grid", gridTemplateColumns: "0.85fr 1.15fr", gap: 10, flex: 1, minHeight: 0 }}>
            <Card style={{ padding: 18 }}>
              <div className="hero-kicker" style={{ marginBottom: 4 }}>Social Links</div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>Your public touchpoints</div>
              <div className="app-card-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {socialRows.map((social) => (
                  <SocialCard key={social.key} label={social.label} href={draft[social.key]} />
                ))}
              </div>
            </Card>

            <Card style={{ padding: 18, display: "flex", flexDirection: "column", minHeight: 0 }}>
              <div className="hero-kicker" style={{ marginBottom: 4 }}>Recent Sessions</div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>Latest saved activity runs</div>
              <div className="inner-scroll flex-col-fill" style={{ gap: 6, display: "flex", flexDirection: "column" }}>
                {(summary?.recentResults || []).map((result) => (
                  <div key={result.id} style={{
                    padding: "10px 14px",
                    background: "var(--surface-2)", border: "1px solid var(--border-subtle)", borderRadius: 8,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, textTransform: "capitalize", fontSize: "0.875rem", color: "var(--text)" }}>
                        <Trophy size={14} style={{ color: "var(--accent)" }} />
                        {result.activityType}
                      </div>
                      <div style={{ fontWeight: 700, color: "var(--accent-bright)" }}>{formatScore(result.score)}</div>
                    </div>
                    <div style={{ marginTop: 4, fontSize: "0.775rem", color: "var(--text-muted)" }}>
                      {result.accuracy != null ? `Accuracy ${Math.round(result.accuracy)}%` : "Accuracy not tracked"}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
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

/* ── Sub-components ── */

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label style={{
        display: "flex", alignItems: "center", gap: 5,
        fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.14em",
        textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 5,
      }}>
        {Icon && <Icon size={12} style={{ color: "var(--accent)" }} />}
        {label}
      </label>
      {children}
    </div>
  );
}

function MetaLine({ icon: Icon, text }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 12px",
      background: "var(--surface-2)", border: "1px solid var(--border-subtle)", borderRadius: 8,
    }}>
      <Icon size={13} style={{ color: "var(--accent)", flexShrink: 0 }} />
      <span style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>{text}</span>
    </div>
  );
}

function StatChip({ label, value }) {
  return (
    <div style={{
      padding: "12px 14px",
      background: "var(--surface-2)", border: "1px solid var(--border-subtle)", borderRadius: 8,
    }}>
      <div className="label-sm" style={{ marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text)" }}>{value}</div>
    </div>
  );
}

function SocialCard({ label, href }) {
  return (
    <div style={{
      padding: "10px 12px",
      background: "var(--surface-2)", border: "1px solid var(--border-subtle)", borderRadius: 8,
    }}>
      <div className="label-sm" style={{ marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", wordBreak: "break-all" }}>
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" style={{ color: "var(--accent-bright)" }}>
            {href}
          </a>
        ) : (
          "Not added yet"
        )}
      </div>
    </div>
  );
}

function formatScore(value) {
  return Number.isFinite(value) ? Number(value).toFixed(value % 1 === 0 ? 0 : 1) : "0";
}
