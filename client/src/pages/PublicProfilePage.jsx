import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Globe, Link2, MapPin, MailCheck, MoveRight, Phone, Trophy } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { decodePublicProfilePayload, getPublicProfile } from "../lib/localStore";
import { resolveMediaUrl } from "../lib/media";

export function PublicProfilePage() {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  const socialRows = [
    { key: "githubUrl", label: "GitHub", icon: Link2 },
    { key: "linkedinUrl", label: "LinkedIn", icon: Link2 },
    { key: "portfolioUrl", label: "Portfolio", icon: Globe },
    { key: "xUrl", label: "X / Twitter", icon: Globe },
  ];

  useEffect(() => {
    const shared = decodePublicProfilePayload(searchParams.get("profile"));
    const local = getPublicProfile(userId);
    const nextProfile = shared || local;

    if (nextProfile) {
      setProfile(nextProfile);
      setError("");
      return;
    }

    setProfile(null);
    setError("This public profile link does not have shared data attached.");
  }, [searchParams, userId]);

  return (
    <div className="flex min-h-screen items-center px-4 py-8 md:px-6" style={{ background: "var(--bg)" }}>
      <div className="mx-auto w-full max-w-5xl">
        <Card className="overflow-hidden p-0">
          <div
            className="h-36"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in srgb, var(--accent) 20%, transparent), color-mix(in srgb, var(--accent-bright) 18%, transparent), color-mix(in srgb, var(--text) 8%, transparent))",
            }}
          />
          <div className="p-6 md:p-8">
            {error ? (
              <div className="space-y-4">
                <div className="display-title text-4xl" style={{ color: "var(--text)" }}>Profile unavailable</div>
                <div style={{ color: "var(--text-muted)" }}>{error}</div>
                <Button as={Link} to="/login">
                  Return to login
                </Button>
              </div>
            ) : profile ? (
              <div className="space-y-8">
                <div className="grid app-split-grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
                  <div className="-mt-20">
                    <div
                      className="h-28 w-28 overflow-hidden rounded-[30px] shadow-lg"
                      style={{
                        border: "1px solid var(--border)",
                        background: "var(--surface-2)",
                        color: "var(--text)",
                        boxShadow: "var(--card-shadow)",
                      }}
                    >
                      {profile.dpUrl ? (
                        <img src={resolveMediaUrl(profile.dpUrl)} alt={profile.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-3xl font-semibold">
                          {profile.name.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="hero-kicker">Public SkillNODE Profile</div>
                    <div className="mt-2 text-4xl font-semibold" style={{ color: "var(--text)" }}>{profile.name}</div>
                    <div className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
                      Shared from SkillNODE to showcase identity, performance, and social presence.
                    </div>

                    <div className="mt-6 grid gap-3 text-sm">
                      <PublicMeta icon={MailCheck} text={profile.email} />
                      <PublicMeta icon={Phone} text={profile.phone} />
                      <PublicMeta icon={MapPin} text={profile.region} />
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-[24px] p-5"
                  style={{
                    border: "1px solid var(--border)",
                    background: "linear-gradient(180deg, var(--surface), var(--surface-2))",
                  }}
                >
                  <div className="hero-kicker">Bio</div>
                  <div className="mt-3 text-sm leading-7" style={{ color: "var(--text-muted)" }}>
                    {profile.bio || "This player has not added a bio yet."}
                  </div>
                </div>

                <div className="grid app-split-grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
                  <div className="space-y-4">
                    <div className="hero-kicker">Social Links</div>
                    <div className="grid app-card-grid-2 gap-3 sm:grid-cols-2">
                      {socialRows.map((social) => (
                        <PublicLinkCard
                          key={social.key}
                          icon={social.icon}
                          label={social.label}
                          href={profile[social.key]}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="hero-kicker">Best Results</div>
                    {(profile.bestResults || []).map((result) => (
                      <div
                        key={result.activityType}
                        className="rounded-[24px] p-4"
                        style={{
                          border: "1px solid var(--border)",
                          background: "linear-gradient(180deg, var(--surface), var(--surface-2))",
                        }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-semibold capitalize" style={{ color: "var(--text)" }}>{result.activityType}</div>
                          <div className="text-lg font-semibold" style={{ color: "var(--text)" }}>{formatScore(result.bestScore)}</div>
                        </div>
                        <div className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
                          {result.bestAccuracy != null ? `Best accuracy ${Math.round(result.bestAccuracy)}%` : "Score stored"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="hero-kicker">Recent Sessions</div>
                  <div className="grid gap-3">
                    {(profile.recentResults || []).map((result) => (
                      <div
                        key={result.id}
                        className="rounded-[24px] p-4"
                        style={{
                          border: "1px solid var(--border)",
                          background: "linear-gradient(180deg, var(--surface), var(--surface-2))",
                        }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 font-semibold capitalize" style={{ color: "var(--text)" }}>
                            <Trophy size={16} style={{ color: "var(--accent-bright)" }} />
                            {result.activityType}
                          </div>
                          <div className="text-lg font-semibold" style={{ color: "var(--text)" }}>{formatScore(result.score)}</div>
                        </div>
                        <div className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
                          {result.accuracy != null ? `Accuracy ${Math.round(result.accuracy)}%` : "Accuracy not tracked"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm" style={{ color: "var(--text-muted)" }}>Loading public profile...</div>
            )}

            <div className="mt-8 app-action-row flex flex-wrap gap-3">
              <Button as={Link} to="/login" className="gap-2">
                Join SkillNODE
                <MoveRight size={16} />
              </Button>
              <Button as={Link} to="/login" variant="secondary">
                Open app
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function PublicMeta({ icon: Icon, text }) {
  return (
    <div
      className="flex items-center gap-3 rounded-[20px] px-4 py-3"
      style={{
        border: "1px solid var(--border)",
        background: "linear-gradient(180deg, var(--surface), var(--surface-2))",
        color: "var(--text)",
      }}
    >
      <Icon size={16} style={{ color: "var(--accent-bright)" }} />
      <span style={{ color: "var(--text)" }}>{text}</span>
    </div>
  );
}

function PublicLinkCard({ icon: Icon, label, href }) {
  return (
    <div
      className="rounded-[20px] p-4"
      style={{
        border: "1px solid var(--border)",
        background: "linear-gradient(180deg, var(--surface), var(--surface-2))",
      }}
    >
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em]" style={{ color: "var(--text-faint)" }}>
        <Icon size={14} style={{ color: "var(--accent-bright)" }} />
        {label}
      </div>
      <div className="mt-3 break-all text-sm" style={{ color: "var(--text-muted)" }}>
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
