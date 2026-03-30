import { useEffect, useMemo, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useToast } from "../../components/ui/Toast";

function makeQuestion(level) {
  const max = level <= 2 ? 10 : level <= 4 ? 25 : 60;
  const a = Math.floor(Math.random() * max) + 1;
  const b = Math.floor(Math.random() * max) + 1;
  const ops = level <= 2 ? ["+"] : level <= 4 ? ["+", "-"] : ["+", "-", "×"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  const answer = op === "+" ? a + b : op === "-" ? a - b : a * b;
  return { a, b, op, answer };
}

export function MathDrillsPage() {
  const toast = useToast();
  const [level, setLevel] = useState(1);
  const [q, setQ] = useState(() => makeQuestion(1));
  const [input, setInput] = useState("");
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(() => loadBestStreak());
  const [seconds, setSeconds] = useState(45);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSeconds((s) => s - 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    if (seconds <= 0) {
      setRunning(false);
      toast.push({ title: "Time", message: `Streak: ${streak}`, kind: "success" });
      if (!bestStreak || streak > bestStreak) {
        setBestStreak(streak);
        saveBestStreak(streak);
      }
    }
  }, [running, seconds, streak, toast]);

  const label = useMemo(() => `${q.a} ${q.op} ${q.b}`, [q]);

  function start() {
    setSeconds(45);
    setStreak(0);
    setInput("");
    setQ(makeQuestion(level));
    setRunning(true);
  }

  function submit() {
    const n = Number(input);
    if (!Number.isFinite(n)) return;
    if (n === q.answer) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak % 6 === 0) setLevel((l) => Math.min(6, l + 1));
      setQ(makeQuestion(level));
      setInput("");
    } else {
      toast.push({ title: "Wrong", message: `Answer was ${q.answer}.`, kind: "error" });
      setStreak(0);
      setInput("");
      setQ(makeQuestion(level));
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="p-6 md:col-span-2">
        <div className="text-sm text-white/60">Math drills</div>
        <div className="mt-1 text-lg font-semibold">Speed + accuracy</div>

        <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5">
          <div>
            <div className="text-xs text-white/60">Question</div>
            <div className="mt-1 text-3xl font-semibold">{label}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/60">Time</div>
            <div className="mt-1 text-3xl font-semibold">{seconds}s</div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Answer"
            inputMode="numeric"
            disabled={!running}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
          />
          <Button variant="secondary" onClick={submit} disabled={!running}>
            Submit
          </Button>
        </div>

        <div className="mt-4 flex gap-3">
          <Button onClick={start}>{running ? "Restart" : "Start"}</Button>
          <Button variant="secondary" onClick={() => setRunning(false)} disabled={!running}>
            Stop
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="text-sm text-white/60">Progress</div>
        <div className="mt-4 grid gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">Streak</div>
            <div className="mt-1 text-3xl font-semibold">{streak}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">Level</div>
            <div className="mt-1 text-3xl font-semibold">{level}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">Best streak</div>
            <div className="mt-1 text-3xl font-semibold">{bestStreak || 0}</div>
          </div>
          <div className="text-sm text-white/60">
            Higher levels add harder numbers and multiplication.
          </div>
        </div>
      </Card>
    </div>
  );
}

const KEY = "skillnode_math_best_streak";

function loadBestStreak() {
  try {
    const raw = localStorage.getItem(KEY);
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

function saveBestStreak(n) {
  try {
    localStorage.setItem(KEY, String(n));
  } catch {
    // ignore
  }
}

