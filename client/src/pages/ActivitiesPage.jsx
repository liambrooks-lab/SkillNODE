import { Link } from "react-router-dom";
import { ArrowUpRight, Sparkles, Swords, Users } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { skillTracks } from "../data/skillTracks";

const labHighlights = [
  "Typing speed and rhythm testing",
  "Coding challenge workflows and test execution",
  "Math pressure drills with level progression",
  "Word and number guessing for lighter game loops",
  "Grammar and comprehension for language improvement",
  "AI hints, profile sharing, and multiplayer foundations",
];

export function ActivitiesPage() {
  return (
    <div className="space-y-6 pb-24">
      <Card className="p-6 md:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="hero-kicker">Skill Labs</div>
            <div className="display-title mt-2 text-4xl md:text-5xl">
              Different dynamic pages for every kind of player.
            </div>
            <div className="mt-4 max-w-3xl text-sm leading-7 text-white/64 md:text-base">
              Each module below opens its own screen with its own interactions, stats, and flow.
              That makes the platform feel like a real product suite instead of a single hero page
              with buttons.
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button as={Link} to="/activities/code">
                Open Code Arena
              </Button>
              <Button as={Link} to="/multiplayer" variant="secondary">
                View social rooms
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {labHighlights.map((item) => (
              <div key={item} className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-white/68">
                {item}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {skillTracks.map((track) => (
          <Link key={track.slug} to={track.route} className="group">
            <Card className="h-full p-5 transition group-hover:-translate-y-0.5 group-hover:border-cyan-200/20">
              <div className={`h-24 rounded-[24px] bg-gradient-to-br ${track.accent}`} />
              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-white/45">{track.eyebrow}</div>
                  <div className="mt-2 text-xl font-semibold">{track.title}</div>
                </div>
                <ArrowUpRight size={18} className="text-white/45 transition group-hover:text-white" />
              </div>
              <div className="mt-3 text-sm leading-6 text-white/62">{track.summary}</div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/55">
                <span className="rounded-full border border-white/10 px-3 py-1">{track.duration}</span>
                <span className="rounded-full border border-white/10 px-3 py-1">{track.multiplayer}</span>
                <span className="rounded-full border border-white/10 px-3 py-1">{track.ai}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <PromoCard
          icon={Sparkles}
          title="AI hints where they matter"
          copy="Typing, math, coding, grammar, and reading pages can call the backend hint service for lightweight coaching."
        />
        <PromoCard
          icon={Swords}
          title="Competition-ready surfaces"
          copy="Use challenge pages for practice now, then extend them into duels, tournaments, and coding contests."
        />
        <PromoCard
          icon={Users}
          title="Built for connections"
          copy="Profiles, room presence, and public sharing make it easy to connect learning with community."
        />
      </div>
    </div>
  );
}

function PromoCard({ icon: Icon, title, copy }) {
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
