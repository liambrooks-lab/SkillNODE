import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

const tiles = [
  {
    id: "typing",
    title: "Typing speed",
    desc: "WPM, accuracy, smooth timer UI.",
  },
  {
    id: "guess",
    title: "Guessing game",
    desc: "Word/number guessing with difficulty.",
  },
  {
    id: "math",
    title: "Math drills",
    desc: "Timed arithmetic, streaks, levels.",
  },
];

export function ActivitiesPage() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {tiles.map((t) => (
        <Card key={t.id} className="p-6">
          <div className="text-lg font-semibold">{t.title}</div>
          <div className="mt-2 text-sm text-white/70">{t.desc}</div>
          <div className="mt-5">
            <Button as={Link} to={`/activities/${t.id}`} variant="secondary">
              Open
            </Button>
          </div>
        </Card>
      ))}

      <Card className="p-6 md:col-span-3">
        <div className="text-sm text-white/60">Next</div>
        <div className="mt-1 text-lg font-semibold">Coding challenges • Grammar • Comprehension</div>
        <div className="mt-2 text-sm text-white/70">
          Scaffolding is in place — we’ll add modules incrementally while keeping the UI consistently premium.
        </div>
      </Card>
    </div>
  );
}

