import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BrainCircuit, ShieldCheck, Trophy, Users } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { api } from "../lib/api";
import { skillTracks } from "../data/skillTracks";
import { resolveMediaUrl } from "../lib/media";

export function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    let alive = true;

    Promise.all([
      api.get("/api/me/summary"),
      api.get("/api/results/leaderboard", {
        params: { activityType: "typing", take: 5 },
      }),
    ])
      .then(([summaryRes, leaderboardRes]) => {
        if (!alive) return;
        setSummary(summaryRes.data);
        setLeaderboard(leaderboardRes.data);
      })
      .catch(() => {
        if (!alive) return;
        setSummary({
          totals: { totalAttempts: 0, alertCount: 0 },
          bestResults: [],
          recentResults: [],
        });
      });

    return () => {
      alive = false;
    };
  }, []);

  const featuredTracks = skillTracks.slice(0, 4);
  const bestResults = summary?.bestResults || [];
  const recentResults = summary?.recentResults || [];

  return (
    <div className="space-y-6 pb-24">
      <Card className="overflow-hidden p-0">
        <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-8">
          <div>
            <div className="hero-kicker">Command Center</div>
            <div className="display-title mt-2 max-w-3xl text-4xl md:text-5xl">
              One platform for skills, games, profiles, AI, and competition.
            </div>
            <div className="mt-4 max-w-2xl text-sm leading-7 text-white/65 md:text-base">
              Your dashboard now reads from persistent backend data, so attempts, alerts, and best
              scores survive refreshes and work across devices.
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button as={Link} to="/activities">
                Explore skill labs
              </Button>
              <Button as={Link} to="/multiplayer" variant="secondary">
                Open multiplayer rooms
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <MetricBox label="Attempts logged" value={String(summary?.totals?.totalAttempts ?? 0)} />
            <MetricBox label="Fair-play alerts" value={String(summary?.totals?.alertCount ?? 0)} />
            <MetricBox label="Best categories" value={String(bestResults.length)} />
            <MetricBox label="Typing leaderboard" value={`${leaderboard.length} live`} />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="hero-kicker">Featured Tracks</div>
              <div className="mt-2 text-2xl font-semibold">Where most players start</div>
            </div>
            <Button as={Link} to="/activities" variant="ghost" className="gap-2">
              See all
              <ArrowRight size={16} />
            </Button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {featuredTracks.map((track) => (
              <Link key={track.slug} to={track.route} className="group">
                <div className="h-full rounded-[26px] border border-white/10 bg-slate-950/28 p-5 transition hover:-translate-y-0.5 hover:border-cyan-200/20 hover:bg-slate-950/38">
                  <div className={`h-20 rounded-[20px] bg-gradient-to-br ${track.accent}`} />
                  <div className="mt-4 text-xs uppercase tracking-[0.22em] text-white/45">{track.eyebrow}</div>
                  <div className="mt-2 text-xl font-semibold">{track.title}</div>
                  <div className="mt-2 text-sm text-white/62">{track.summary}</div>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="hero-kicker">Your Bests</div>
          <div className="mt-2 text-2xl font-semibold">Saved to your profile</div>
          <div className="mt-5 space-y-3">
            {bestResults.map((result) => (
              <div key={result.activityType} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold capitalize">{result.activityType}</div>
                  <div className="text-lg font-semibold">{formatScore(result.bestScore)}</div>
                </div>
                <div className="mt-2 text-sm text-white/58">
                  {result.bestAccuracy != null ? `Best accuracy ${Math.round(result.bestAccuracy)}%` : "Score tracked"}
                </div>
              </div>
            ))}

            {bestResults.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-white/10 px-4 py-8 text-sm text-white/45">
                Start an activity to build your personal stats.
              </div>
            ) : null}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <Card className="p-6">
          <div className="hero-kicker">Recent Results</div>
          <div className="mt-2 text-2xl font-semibold">Latest saved sessions</div>
          <div className="mt-5 space-y-3">
            {recentResults.map((result) => (
              <div key={result.id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold capitalize">{result.activityType}</div>
                  <div className="text-lg font-semibold">{formatScore(result.score)}</div>
                </div>
                <div className="mt-2 text-sm text-white/58">
                  {result.accuracy != null ? `Accuracy ${Math.round(result.accuracy)}%` : "Accuracy not tracked"}
                </div>
              </div>
            ))}
            {recentResults.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-white/10 px-4 py-8 text-sm text-white/45">
                No saved sessions yet.
              </div>
            ) : null}
          </div>
        </Card>

        <Card className="p-6">
          <div className="hero-kicker">Typing Leaderboard</div>
          <div className="mt-2 text-2xl font-semibold">Shared competition layer</div>
          <div className="mt-5 space-y-3">
            {leaderboard.map((entry) => (
              <div key={entry.userId} className="flex items-center justify-between rounded-[24px] border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center gap-3">
                  {entry.dpUrl ? (
                    <img src={resolveMediaUrl(entry.dpUrl)} alt={entry.name} className="h-11 w-11 rounded-2xl object-cover" />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 font-semibold">
                      {entry.name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold">{entry.name}</div>
                    <div className="text-sm text-white/55">{entry.region || "Region hidden"}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-white/45">#{entry.rank}</div>
                  <div className="text-lg font-semibold">{formatScore(entry.bestScore)}</div>
                </div>
              </div>
            ))}

            {leaderboard.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-white/10 px-4 py-8 text-sm text-white/45">
                Leaderboard will appear once results are submitted.
              </div>
            ) : null}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SignalCard
          icon={BrainCircuit}
          title="AI coaching in context"
          copy="Hints are attached to the exact challenge surface, so the product feels useful instead of decorative."
        />
        <SignalCard
          icon={Users}
          title="Social by design"
          copy="Profiles, rooms, and public sharing make the platform feel alive rather than isolated."
        />
        <SignalCard
          icon={ShieldCheck}
          title="Fair-play logging"
          copy="Suspicious focus-loss and screenshot-key signals are logged against the authenticated account."
        />
      </div>
    </div>
  );
}

function MetricBox({ label, value }) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-[0.22em] text-white/45">{label}</div>
      <div className="mt-3 text-3xl font-semibold">{value}</div>
    </div>
  );
}

function SignalCard({ icon: Icon, title, copy }) {
  return (
    <Card className="p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
        <Icon size={18} className="text-cyan-200" />
      </div>
      <div className="mt-4 text-lg font-semibold">{title}</div>
      <div className="mt-2 text-sm leading-6 text-white/62">{copy}</div>
    </Card>
  );
}

function formatScore(value) {
  return Number.isFinite(value) ? Number(value).toFixed(value % 1 === 0 ? 0 : 1) : "0";
}
