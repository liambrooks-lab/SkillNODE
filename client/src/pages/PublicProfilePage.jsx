import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin, MailCheck, MoveRight, Phone, Trophy } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { api } from "../lib/api";
import { resolveMediaUrl } from "../lib/media";

export function PublicProfilePage() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    api
      .get(`/api/public/users/${userId}`)
      .then(({ data }) => {
        if (alive) setProfile(data);
      })
      .catch((err) => {
        if (alive) setError(err?.response?.data?.error || "Profile not found.");
      });

    return () => {
      alive = false;
    };
  }, [userId]);

  return (
    <div className="app-shell-bg flex min-h-screen items-center px-4 py-8 md:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <Card className="overflow-hidden p-0">
          <div className="h-36 bg-[linear-gradient(135deg,rgba(125,211,252,0.4),rgba(52,211,153,0.24),rgba(245,158,11,0.18))]" />
          <div className="p-6 md:p-8">
            {error ? (
              <div className="space-y-4">
                <div className="display-title text-4xl">Profile unavailable</div>
                <div className="text-white/62">{error}</div>
                <Button as={Link} to="/login">
                  Return to login
                </Button>
              </div>
            ) : profile ? (
              <div className="space-y-8">
                <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
                  <div className="-mt-20">
                    <div className="h-28 w-28 overflow-hidden rounded-[30px] border border-white/10 bg-slate-950 shadow-lg">
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
                    <div className="mt-2 text-4xl font-semibold">{profile.name}</div>
                    <div className="mt-2 text-sm text-white/62">
                      Shared from SkillNODE to showcase identity and performance inside the platform.
                    </div>

                    <div className="mt-6 grid gap-3 text-sm">
                      <PublicMeta icon={MailCheck} text={profile.email} />
                      <PublicMeta icon={Phone} text={profile.phone} />
                      <PublicMeta icon={MapPin} text={profile.region} />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
                  <div className="space-y-4">
                    <div className="hero-kicker">Best Results</div>
                    {(profile.bestResults || []).map((result) => (
                      <div key={result.activityType} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-semibold capitalize">{result.activityType}</div>
                          <div className="text-lg font-semibold">{formatScore(result.bestScore)}</div>
                        </div>
                        <div className="mt-2 text-sm text-white/58">
                          {result.bestAccuracy != null ? `Best accuracy ${Math.round(result.bestAccuracy)}%` : "Score stored"}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="hero-kicker">Recent Sessions</div>
                    {(profile.recentResults || []).map((result) => (
                      <div key={result.id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 font-semibold capitalize">
                            <Trophy size={16} className="text-cyan-200" />
                            {result.activityType}
                          </div>
                          <div className="text-lg font-semibold">{formatScore(result.score)}</div>
                        </div>
                        <div className="mt-2 text-sm text-white/58">
                          {result.accuracy != null ? `Accuracy ${Math.round(result.accuracy)}%` : "Accuracy not tracked"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-white/55">Loading public profile...</div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
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
    <div className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/5 px-4 py-3">
      <Icon size={16} className="text-cyan-200" />
      <span>{text}</span>
    </div>
  );
}

function formatScore(value) {
  return Number.isFinite(value) ? Number(value).toFixed(value % 1 === 0 ? 0 : 1) : "0";
}
