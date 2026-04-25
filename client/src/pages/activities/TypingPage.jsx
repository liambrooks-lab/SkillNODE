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
  "Consistency over speed — every keystroke should feel intentional and precise.",
  "The best typists build muscle memory through deliberate, measured practice.",
];

function statsFor({ text, input, elapsedMs }) {
  const minutes      = elapsedMs / 60000;
  const words        = input.trim().length ? input.trim().split(/\s+/).length : 0;
  const wpm          = minutes > 0 ? Math.round(words / minutes) : 0;
  const correctChars = [...input].filter((ch, i) => ch === text[i]).length;
  const accuracy     = input.length ? Math.round((correctChars / input.length) * 100) : 100;
  const progress     = text.length ? Math.min(100, Math.round((input.length / text.length) * 100)) : 0;
  return { wpm, accuracy, progress };
}

function TypingInner() {
  const toast = useToast();
  useFairPlayMonitor("typing");

  const [text, setText]     = useState(TEXTS[0]);
  const [input, setInput]   = useState("");
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
    const run = { at: Date.now(), wpm, accuracy, seconds: Number((elapsedMs / 1000).toFixed(1)) };
    const nextHistory = [run, ...history].slice(0, 8);
    setHistory(nextHistory);
    saveHistory(nextHistory);
    void submitActivityResult({
      activityType: "typing",
      score: wpm,
      accuracy,
      durationMs: Math.round(elapsedMs),
      metadata: { progress, textLength: text.length },
    });
    toast.push({ title: "Run finished", message: `WPM ${wpm} | Accuracy ${accuracy}%`, kind: "success" });
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
      toast.push({ title: "AI hint", message: data.hint, kind: "info", durationMs: 5000 });
    } catch (err) {
      toast.push({ title: "AI hint unavailable", message: err?.response?.data?.error || "Configure OPENAI_API_KEY on the server.", kind: "warning" });
    } finally {
      setAiBusy(false);
    }
  }

  return (
    <div className="flex-col-fill" style={{ gap: 12 }}>

      {/* ── Header card ── */}
      <Card style={{ padding: "18px 22px", flexShrink: 0 }}>
        <div className="app-hero-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 24, alignItems: "start" }}>
          <div>
            <div className="hero-kicker">Typing Velocity</div>
            <div className="display-title" style={{ fontSize: "1.75rem", color: "var(--text)", marginTop: 4 }}>
              Stay smooth. Stay accurate.
            </div>
            <div style={{ marginTop: 8, fontSize: "0.875rem", lineHeight: 1.75, color: "var(--text-muted)" }}>
              This lab tracks speed, accuracy, and best-effort fair-play signals while preserving a
              clean, serious UI. It is built for both solo practice and future multiplayer races.
            </div>
          </div>
          <div className="app-hero-stats-grid app-card-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            <MiniStat icon={Gauge}        label="WPM"      value={String(wpm)} />
            <MiniStat icon={BrainCircuit} label="Accuracy" value={`${accuracy}%`} />
            <MiniStat icon={ShieldCheck}  label="Progress" value={`${progress}%`} />
          </div>
        </div>
      </Card>

      {/* ── Main grid ── */}
      <div className="app-main-grid" style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 10, flex: 1, minHeight: 0 }}>

        {/* Left: editor */}
        <Card style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>
          {/* Target text */}
          <div style={{
            padding: "14px 18px",
            background: "var(--surface-2)", border: "1px solid var(--border-subtle)",
            borderRadius: 10, fontSize: "0.95rem", lineHeight: 1.8, color: "var(--text-muted)",
          }}>
            {text}
          </div>

          {/* Textarea */}
          <textarea
            className="field inner-scroll"
            style={{ flex: 1, height: "auto", resize: "none", fontFamily: "JetBrains Mono, monospace", fontSize: "0.875rem", lineHeight: 1.7 }}
            placeholder="Start typing here..."
            value={input}
            onChange={(e) => {
              if (!running) { t0Ref.current = Date.now(); setRunning(true); }
              setInput(e.target.value);
            }}
          />

          {/* Progress bar */}
          <div style={{ height: 5, borderRadius: 99, background: "var(--surface-2)", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 99,
              background: "var(--btn-bg)",
              width: `${progress}%`, transition: "width 0.3s",
            }} />
          </div>

          <div className="app-action-row" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Button onClick={startNewText}>New text</Button>
            <Button variant="secondary" onClick={finishRun} disabled={!running}>Finish run</Button>
            <Button variant="ghost" onClick={getHint} disabled={aiBusy}>
              {aiBusy ? "Thinking..." : "AI rhythm coach"}
            </Button>
          </div>
        </Card>

        {/* Right: session data */}
        <Card style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="hero-kicker">Session Data</div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>Your current run</div>

          <div style={{ display: "grid", gap: 8 }}>
            <DataBox label="Elapsed"  value={`${(elapsedMs / 1000).toFixed(1)}s`} />
            <DataBox label="WPM"      value={String(wpm)} />
            <DataBox label="Accuracy" value={`${accuracy}%`} />
          </div>

          <div style={{ marginTop: 4 }}>
            <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
              Recent runs
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }} className="inner-scroll">
              {history.map((item) => (
                <div key={item.at} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 12px",
                  background: "var(--surface-2)", border: "1px solid var(--border-subtle)", borderRadius: 8,
                  fontSize: "0.8rem",
                }}>
                  <div style={{ fontWeight: 700, color: "var(--accent-bright)" }}>{item.wpm} WPM</div>
                  <div style={{ color: "var(--text-muted)" }}>{item.accuracy}% | {item.seconds}s</div>
                </div>
              ))}

              {history.length === 0 ? (
                <div style={{
                  padding: "20px 14px", textAlign: "center",
                  border: "1px dashed var(--border-subtle)", borderRadius: 8,
                  fontSize: "0.825rem", color: "var(--text-faint)",
                }}>
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
    <div style={{
      padding: "12px 14px",
      background: "var(--surface-2)", border: "1px solid var(--border-subtle)", borderRadius: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 8 }}>
        <Icon size={14} style={{ color: "var(--accent)" }} />
        {label}
      </div>
      <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text)" }}>{value}</div>
    </div>
  );
}

function DataBox({ label, value }) {
  return (
    <div style={{
      padding: "12px 14px",
      background: "var(--surface-2)", border: "1px solid var(--border-subtle)", borderRadius: 8,
    }}>
      <div className="label-sm" style={{ marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>{value}</div>
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
  } catch { return []; }
}
function saveHistory(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* Ignore */ }
}
