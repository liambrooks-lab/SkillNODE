import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../components/ui/Toast";
import { antiCheat } from "../../lib/antiCheat";
import { api } from "../../lib/api";

const TEXTS = [
  "SkillNODE is where focus becomes performance.",
  "Type fast, think faster, and stay consistent.",
  "Precision beats speed when pressure rises.",
];

function statsFor({ text, input, elapsedMs }) {
  const minutes = elapsedMs / 60000;
  const words = input.trim().length ? input.trim().split(/\s+/).length : 0;
  const wpm = minutes > 0 ? Math.round(words / minutes) : 0;

  const correctChars = [...input].filter((ch, i) => ch === text[i]).length;
  const accuracy = input.length ? Math.round((correctChars / input.length) * 100) : 100;

  return { wpm, accuracy };
}

export function TypingPage() {
  const toast = useToast();
  const [text, setText] = useState(TEXTS[0]);
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [history, setHistory] = useState(() => loadHistory());
  const [aiBusy, setAiBusy] = useState(false);
  const t0Ref = useRef(0);

  const { wpm, accuracy } = useMemo(
    () => statsFor({ text, input, elapsedMs }),
    [text, input, elapsedMs],
  );

  useEffect(() => {
    const stop = antiCheat.start({
      onSuspicious: async (evt) => {
        toast.push({ title: "Fair play alert", message: evt.message, kind: "warning" });
        try {
          await api.post("/api/audit/event", { type: evt.type, meta: evt.meta });
        } catch {
          // ignore
        }
      },
    });
    return stop;
  }, [toast]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setElapsedMs(Date.now() - t0Ref.current);
    }, 120);
    return () => window.clearInterval(id);
  }, [running]);

  function start() {
    const next = TEXTS[Math.floor(Math.random() * TEXTS.length)];
    setText(next);
    setInput("");
    setElapsedMs(0);
    t0Ref.current = Date.now();
    setRunning(true);
  }

  function stop() {
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
    toast.push({
      title: "Run finished",
      message: `WPM ${wpm} • Accuracy ${accuracy}%`,
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
          "Give a short tip to improve accuracy and rhythm.",
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
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="p-6 md:col-span-2">
        <div className="text-sm text-white/60">Typing speed</div>
        <div className="mt-1 text-lg font-semibold">Stay smooth. Stay accurate.</div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-white/80">
          {text}
        </div>

        <textarea
          className="mt-4 h-40 w-full resize-none rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
          placeholder="Start typing here…"
          value={input}
          onChange={(e) => {
            if (!running) {
              t0Ref.current = Date.now();
              setRunning(true);
            }
            setInput(e.target.value);
          }}
        />

        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={start}>New text</Button>
          <Button variant="secondary" onClick={stop} disabled={!running}>
            Finish
          </Button>
          <Button variant="ghost" onClick={getHint} disabled={aiBusy}>
            {aiBusy ? "Thinking…" : "AI hint"}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="text-sm text-white/60">Stats</div>
        <div className="mt-4 grid gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">WPM</div>
            <div className="mt-1 text-3xl font-semibold">{wpm}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">Accuracy</div>
            <div className="mt-1 text-3xl font-semibold">{accuracy}%</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">Time</div>
            <div className="mt-1 text-3xl font-semibold">{(elapsedMs / 1000).toFixed(1)}s</div>
          </div>
        </div>

        <div className="mt-6">
          <div className="text-xs font-medium text-white/60">Recent runs</div>
          <div className="mt-2 space-y-2">
            {history.map((h) => (
              <div
                key={h.at}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2"
              >
                <div className="text-sm font-medium">{h.wpm} WPM</div>
                <div className="text-xs text-white/60">{h.accuracy}% • {h.seconds}s</div>
              </div>
            ))}
            {history.length === 0 ? (
              <div className="text-sm text-white/50">No runs yet.</div>
            ) : null}
          </div>
        </div>
      </Card>
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
    // ignore
  }
}

