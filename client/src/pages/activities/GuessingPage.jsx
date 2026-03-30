import { useMemo, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../components/ui/Toast";

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function GuessingPage() {
  const toast = useToast();
  const [target, setTarget] = useState(() => randomInt(1, 100));
  const [guess, setGuess] = useState("");
  const [tries, setTries] = useState(0);
  const [best, setBest] = useState(() => loadBest());

  const hint = useMemo(() => {
    const g = Number(guess);
    if (!guess) return "Enter a number from 1 to 100.";
    if (!Number.isFinite(g)) return "That’s not a number.";
    if (g === target) return "Perfect.";
    return g < target ? "Too low." : "Too high.";
  }, [guess, target]);

  function submit() {
    const g = Number(guess);
    if (!Number.isFinite(g)) {
      toast.push({ title: "Invalid guess", message: "Enter a valid number.", kind: "error" });
      return;
    }
    const nextTries = tries + 1;
    setTries(nextTries);

    if (g === target) {
      toast.push({ title: "You got it", message: `Solved in ${nextTries} tries.`, kind: "success" });
      if (!best || nextTries < best) {
        setBest(nextTries);
        saveBest(nextTries);
      }
    } else {
      toast.push({ title: "Keep going", message: hint, kind: "info" });
    }
  }

  function reset() {
    setTarget(randomInt(1, 100));
    setGuess("");
    setTries(0);
    toast.push({ title: "New round", message: "Fresh number generated.", kind: "success" });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-6">
        <div className="text-sm text-white/60">Guessing game</div>
        <div className="mt-1 text-lg font-semibold">Find the number</div>
        <div className="mt-2 text-sm text-white/70">
          Difficulty: 1–100 (more modes will be added).
        </div>

        <div className="mt-5">
          <label className="block text-xs font-medium text-white/70">Your guess</label>
          <div className="mt-1 flex gap-2">
            <Input
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="e.g. 42"
              inputMode="numeric"
            />
            <Button onClick={submit} variant="secondary">
              Try
            </Button>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
          Hint: {hint}
        </div>

        <div className="mt-4 flex gap-3">
          <Button onClick={reset}>New game</Button>
          <div className="text-sm text-white/60 self-center">Tries: {tries}</div>
          <div className="text-sm text-white/60 self-center">Best: {best || "—"}</div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="text-sm text-white/60">Pro tip</div>
        <div className="mt-1 text-lg font-semibold">Make it competitive</div>
        <div className="mt-2 text-sm text-white/70">
          We’ll hook this into multiplayer rooms so friends can race to solve first.
        </div>
      </Card>
    </div>
  );
}

const KEY = "skillnode_guess_best";

function loadBest() {
  try {
    const raw = localStorage.getItem(KEY);
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

function saveBest(n) {
  try {
    localStorage.setItem(KEY, String(n));
  } catch {
    // ignore
  }
}

