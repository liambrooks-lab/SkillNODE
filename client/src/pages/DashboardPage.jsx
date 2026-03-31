import { Link } from "react-router-dom";
import { ArrowRight, BrainCircuit, Layers3, Trophy, Users } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { experiencePillars, skillTracks } from "../data/skillTracks";

const spotlightStats = [
  { label: "Active tracks", value: "06" },
  { label: "AI surfaces", value: "05" },
  { label: "Public profile mode", value: "Live" },
  { label: "Multiplayer rooms", value: "Ready" },
];

export function DashboardPage() {
  const featuredTracks = skillTracks.slice(0, 4);

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
              This is not a landing page shell anymore. It now behaves like a real product with
              separate labs, collaboration space, public profiles, and focused challenge flows.
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
            {spotlightStats.map((stat) => (
              <div key={stat.label} className="rounded-[26px] border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-white/45">{stat.label}</div>
                <div className="mt-3 text-3xl font-semibold">{stat.value}</div>
              </div>
            ))}
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
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/55">
                    <span className="rounded-full border border-white/10 px-3 py-1">{track.duration}</span>
                    <span className="rounded-full border border-white/10 px-3 py-1">{track.ai}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="hero-kicker">Why It Feels Premium</div>
          <div className="mt-2 text-2xl font-semibold">Experience pillars</div>
          <div className="mt-5 space-y-3">
            {experiencePillars.map((pillar) => (
              <div key={pillar.title} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="font-semibold">{pillar.title}</div>
                <div className="mt-2 text-sm leading-6 text-white/62">{pillar.description}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SignalCard
          icon={BrainCircuit}
          title="AI coaching in context"
          copy="Hints are attached to the exact challenge surface, so the product feels intelligent instead of gimmicky."
        />
        <SignalCard
          icon={Users}
          title="Social by design"
          copy="Profiles, rooms, and public sharing make the platform feel alive rather than like isolated mini games."
        />
        <SignalCard
          icon={Layers3}
          title="Different pages, same system"
          copy="Every section uses the same premium shell, motion language, and responsive behavior across devices."
        />
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="hero-kicker">Next Up</div>
            <div className="mt-2 text-2xl font-semibold">Jump into the competitive side</div>
            <div className="mt-2 max-w-2xl text-sm text-white/60">
              Multiplayer rooms are live, fair-play events are logged, and the coding, grammar,
              and comprehension pages are now part of the main product flow.
            </div>
          </div>
          <Button as={Link} to="/multiplayer" className="gap-2">
            Enter rooms
            <Trophy size={16} />
          </Button>
        </div>
      </Card>
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
