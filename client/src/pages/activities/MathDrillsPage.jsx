import { useEffect, useMemo, useState } from "react";
import { BrainCircuit, Sigma, Timer } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ToastProvider, useToast } from "../../components/ui/Toast";
import { api } from "../../lib/api";
import { submitActivityResult } from "../../lib/results";
import { useFairPlayMonitor } from "../../hooks/useFairPlayMonitor";

function makeQuestion(level) {
  const max = level <= 2 ? 10 : level <= 4 ? 25 : 60;
  const a = Math.floor(Math.random() * max) + 1;
  const b = Math.floor(Math.random() * max) + 1;
  const ops = level <= 2 ? ["+"] : level <= 4 ? ["+", "-"] : ["+", "-", "x"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  const answer = op === "+" ? a + b : op === "-" ? a - b : a * b;
  return { a, b, op, answer };
}

function MathInner() {
  const toast = useToast();
  useFairPlayMonitor("math");

  const [level, setLevel] = useState(1);
  const [question, setQuestion] = useState(() => makeQuestion(1));
  const [input, setInput] = useState("");
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(() => loadBestStreak());
  const [seconds, setSeconds] = useState(45);
  const [running, setRunning] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSeconds((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running || seconds > 0) return;
    stopRun();
  }, [running, seconds]);

  const label = useMemo(() => `${question.a} ${question.op} ${question.b}`, [question]);

  function start() {
    setSeconds(45);
    setStreak(0);
    setInput("");
    setLevel(1);
    setQuestion(makeQuestion(1));
    setRunning(true);
  }

  function stopRun() {
    setRunning(false);
    void submitActivityResult({
      activityType: "math",
      score: streak,
      durationMs: Math.max(0, (45 - seconds) * 1000),
      metadata: {
        level,
      },
    });
    toast.push({ title: "Round complete", message: `Final streak: ${streak}`, kind: "success" });
    if (!bestStreak || streak > bestStreak) {
      setBestStreak(streak);
      saveBestStreak(streak);
    }
  }

  function submit() {
    const value = Number(input);
    if (!Number.isFinite(value)) return;

    if (value === question.answer) {
      const nextStreak = streak + 1;
      const nextLevel = nextStreak > 0 && nextStreak % 6 === 0 ? Math.min(6, level + 1) : level;
      setStreak(nextStreak);
      setLevel(nextLevel);
      setQuestion(makeQuestion(nextLevel));
      setInput("");
    } else {
      toast.push({ title: "Wrong answer", message: `Correct answer: ${question.answer}`, kind: "error" });
      setStreak(0);
      setInput("");
      setQuestion(makeQuestion(level));
    }
  }

  async function getHint() {
    setAiBusy(true);
    try {
      const { data } = await api.post("/api/ai/hint", {
        activityId: "math",
        prompt: `Question: ${label}\nCurrent level: ${level}\nGive a short strategy hint without revealing the answer.`,
      });
      toast.push({ title: "AI hint", message: data.hint, kind: "info", durationMs: 5000 });
    } catch (err) {
      toast.push({
        title: "AI hint unavailable",
        message: err?.response?.data?.error || "Configure OPENAI_API_KEY on the server.",
        kind: "warning",
      });
    } finally {
      setAiBusy(false);
    }
  }

  return (
    <div className="space-y-6 pb-24">
      <Card className="p-6 md:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="hero-kicker">Math Clash</div>
            <div className="display-title mt-2 text-4xl md:text-5xl">Pressure makes the streak meaningful.</div>
            <div className="mt-4 max-w-3xl text-sm leading-7 text-white/63 md:text-base">
              This math page is built like a serious skill drill, not a toy widget. It tracks
              streaks, ramps difficulty, and can call AI for quick coaching.
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat icon={Sigma} label="Level" value={String(level)} />
            <Stat icon={BrainCircuit} label="Streak" value={String(streak)} />
            <Stat icon={Timer} label="Timer" value={`${seconds}s`} />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <Card className="p-6">
          <div className="rounded-[30px] border border-white/10 bg-slate-950/28 p-6">
            <div className="text-xs uppercase tracking-[0.22em] text-white/45">Current question</div>
            <div className="mt-3 text-5xl font-semibold">{label}</div>
          </div>

          <div className="mt-5 flex gap-2">
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

          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={start}>{running ? "Restart sprint" : "Start sprint"}</Button>
            <Button variant="secondary" onClick={stopRun} disabled={!running}>
              Stop
            </Button>
            <Button variant="ghost" onClick={getHint} disabled={aiBusy}>
              {aiBusy ? "Thinking..." : "AI strategy hint"}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="hero-kicker">Performance</div>
          <div className="mt-2 text-2xl font-semibold">Progress snapshot</div>

          <div className="mt-5 grid gap-3">
            <DataBox label="Best streak" value={String(bestStreak || 0)} />
            <DataBox label="Current streak" value={String(streak)} />
            <DataBox label="Difficulty level" value={String(level)} />
          </div>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-slate-950/28 p-4 text-sm text-white/62">
            Higher levels introduce larger numbers and multiplication. The goal is to stay calm,
            keep the streak alive, and build speed without panic.
          </div>
        </Card>
      </div>
    </div>
  );
}

export function MathDrillsPage() {
  return (
    <ToastProvider>
      <MathInner />
    </ToastProvider>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2 text-sm text-white/55">
        <Icon size={16} className="text-cyan-200" />
        {label}
      </div>
      <div className="mt-3 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function DataBox({ label, value }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-[0.22em] text-white/45">{label}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
    </div>
  );
}

const KEY = "skillnode_math_best_streak";

function loadBestStreak() {
  try {
    const raw = localStorage.getItem(KEY);
    const value = Number(raw);
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

function saveBestStreak(value) {
  try {
    localStorage.setItem(KEY, String(value));
  } catch {
    // Ignore storage issues.
  }
}
