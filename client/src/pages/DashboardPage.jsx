import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Link } from "react-router-dom";

export function DashboardPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-6">
        <div className="text-sm text-white/60">Quick start</div>
        <div className="mt-1 text-lg font-semibold">Pick an activity</div>
        <div className="mt-2 text-sm text-white/70">
          Typing speed, math drills, guessing games — more coming fast.
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button as={Link} to="/activities">
            Open Activities
          </Button>
          <Button as={Link} to="/multiplayer" variant="secondary">
            Multiplayer lobby
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="text-sm text-white/60">AI</div>
        <div className="mt-1 text-lg font-semibold">Smart hints & feedback</div>
        <div className="mt-2 text-sm text-white/70">
          You’ll get optional AI-powered hints inside selected challenges.
        </div>
        <div className="mt-5">
          <Button as={Link} to="/activities" variant="secondary">
            Try a challenge
          </Button>
        </div>
      </Card>
    </div>
  );
}

