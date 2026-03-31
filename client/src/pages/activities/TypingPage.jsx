import { useEffect, useMemo, useRef, useState } from "react";
import { BrainCircuit, Gauge, ShieldCheck } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ToastProvider, useToast } from "../../components/ui/Toast";
import { api } from "../../lib/api";
import { submitActivityResult } from "../../lib/results";
import { useFairPlayMonitor } from "../../hooks/useFairPlayMonitor";

const TEXTS = [
  "SkillNODE is where focus becomes visible performance under pressure.",
  "Type fast, think faster, and keep your rhythm clean for the full run.",
  "Sharp hands and calm breathing beat chaotic speed every single time.",
];

function statsFor({ text, input, elapsedMs }) {
  const minutes = elapsedMs / 60000;
  const words = input.trim().length ? input.trim().split(/\s+/).length : 0;
  const wpm = minutes > 0 ? Math.round(words / minutes) : 0;
  const correctChars = [...input].filter((ch, i) => ch === text[i]).length;
  const accuracy = input.length ? Math.round((correctChars / input.length) * 100) : 100;
  const progress = text.length ? Math.min(100, Math.round((input.length / text.length) * 100)) : 0;
  return { wpm, accuracy, progress };
}

function TypingInner() {
  const toast = useToast();
  useFairPlayMonitor("typing");

  const [text, setText] = useState(TEXTS[0]);
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [history, setHistory] = useState(() => loadHistory());
  const [aiBusy, setAiBusy] = useState(false);
  const t0Ref = useRef(0);

  const { wpm, accuracy, progress } = useMemo(
    () => statsFor({ text, input, elapsedMs }),
    [text, input, elapsedMs],
  );

  useEffect(() => {
    if (!running) return;

    const id = window.setInterval(() => {
      setElapsedMs(Date.now() - t0Ref.current);
    }, 120);

    return () => window.clearInterval(id);
  }, [running]);

  function startNewText() {
    const next = TEXTS[Math.floor(Math.random() * TEXTS.length)];
    setText(next);
    setInput("");
    setElapsedMs(0);
    setRunning(false);
  }

  function finishRun() {
    setRunning(false);
    const run = {
      at: Date.now(),
      wpm,
      accuracy,
      seconds: Number((elapsedMs / 1000).toFixed(1)),
    };
    const nextHistory = [run, ...history].slice(0, 8);
    setHistory(nextHistory);
    saveHistory(nextHistory);
    void submitActivityResult({
      activityType: "typing",
      score: wpm,
      accuracy,
      durationMs: Math.round(elapsedMs),
      metadata: {
        progress,
        textLength: text.length,
      },
    });
    toast.push({
      title: "Run finished",
      message: `WPM ${wpm} | Accuracy ${accuracy}%`,
      kind: "success",
    });
  }

  async function getHint() {
    setAiBusy(true);
    try {
      const { data } = await api.post("/api/ai/hint", {
        activityId: "typing",
        prompt:
          `Target text: "${text}"\n` +
          `What user typed so far: "${input}"\n` +
          "Give a short coaching note to improve rhythm and accuracy.",
      });

      toast.push({
        title: "AI hint",
        message: data.hint,
        kind: "info",
        durationMs: 5000,
      });
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
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="hero-kicker">Typing Velocity</div>
            <div className="display-title mt-2 text-4xl md:text-5xl">Stay smooth. Stay accurate.</div>
            <div className="mt-4 max-w-3xl text-sm leading-7 text-white/62 md:text-base">
              This lab tracks speed, accuracy, and best-effort fair-play signals while preserving a
              clean, serious UI. It is built for both solo practice and future multiplayer races.
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <MiniStat icon={Gauge} label="WPM" value={String(wpm)} />
            <MiniStat icon={BrainCircuit} label="Accuracy" value={`${accuracy}%`} />
            <MiniStat icon={ShieldCheck} label="Progress" value={`${progress}%`} />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-6">
          <div className="rounded-[28px] border border-white/10 bg-slate-950/28 p-5 text-base leading-8 text-white/85">
            {text}
          </div>

          <textarea
            className="mt-4 h-52 w-full resize-none rounded-[28px] border border-white/10 bg-slate-950/45 p-5 text-sm leading-7 text-white placeholder:text-white/28 focus:border-sky-300/60 focus:outline-none"
            placeholder="Start typing here..."
            value={input}
            onChange={(e) => {
              if (!running) {
                t0Ref.current = Date.now();
                setRunning(true);
              }
              setInput(e.target.value);
            }}
          />

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#7dd3fc,#34d399)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={startNewText}>New text</Button>
            <Button variant="secondary" onClick={finishRun} disabled={!running}>
              Finish run
            </Button>
            <Button variant="ghost" onClick={getHint} disabled={aiBusy}>
              {aiBusy ? "Thinking..." : "AI rhythm coach"}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="hero-kicker">Session Data</div>
          <div className="mt-2 text-2xl font-semibold">Your current run</div>

          <div className="mt-5 grid gap-3">
            <DataBox label="Elapsed" value={`${(elapsedMs / 1000).toFixed(1)}s`} />
            <DataBox label="WPM" value={String(wpm)} />
            <DataBox label="Accuracy" value={`${accuracy}%`} />
          </div>

          <div className="mt-6">
            <div className="text-sm font-semibold text-white/75">Recent runs</div>
            <div className="mt-3 space-y-2">
              {history.map((item) => (
                <div
                  key={item.at}
                  className="flex items-center justify-between rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-sm"
                >
                  <div>{item.wpm} WPM</div>
                  <div className="text-white/58">{item.accuracy}% | {item.seconds}s</div>
                </div>
              ))}

              {history.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-white/10 px-4 py-6 text-sm text-white/45">
                  No completed runs yet.
                </div>
              ) : null}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function TypingPage() {
  return (
    <ToastProvider>
      <TypingInner />
    </ToastProvider>
  );
}

function MiniStat({ icon: Icon, label, value }) {
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

const KEY = "skillnode_typing_history";

function loadHistory() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Ignore persistence failures.
  }
}
