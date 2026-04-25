import { useMemo, useState } from "react";
import { BrainCircuit, Hash, SpellCheck2 } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ToastProvider, useToast } from "../../components/ui/Toast";
import { submitActivityResult } from "../../lib/results";

const WORDS = [
  { word: "vector",  hint: "A word common in both math and programming." },
  { word: "syntax",  hint: "Without this, code or grammar falls apart." },
  { word: "cipher",  hint: "A secret code or encrypted method." },
  { word: "latency", hint: "A key metric in networking and performance." },
  { word: "pragma",  hint: "A directive that carries special meaning in compilers." },
  { word: "schema",  hint: "Defines the structure of something — a database, JSON, or form." },
  { word: "render",  hint: "What a browser or engine does to produce a visual output." },
  { word: "refactor", hint: "Improving code structure without changing what it does." },
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function GuessingInner() {
  const toast = useToast();
  const [mode, setMode]             = useState("number");
  const [numberTarget, setNumberTarget] = useState(() => randomInt(1, 100));
  const [wordTarget, setWordTarget]   = useState(() => WORDS[Math.floor(Math.random() * WORDS.length)]);
  const [guess, setGuess]           = useState("");
  const [tries, setTries]           = useState(0);
  const [best, setBest]             = useState(() => loadBest());

  const hint = useMemo(() => {
    if (!guess) {
      return mode === "number" ? "Enter a number from 1 to 100." : `Word length: ${wordTarget.word.length}`;
    }

    if (mode === "number") {
      const value = Number(guess);
      if (!Number.isFinite(value)) return "That is not a valid number.";
      if (value === numberTarget) return "Perfect.";
      return value < numberTarget ? "Too low." : "Too high.";
    }

    const normalized = guess.trim().toLowerCase();
    if (normalized === wordTarget.word) return "Perfect.";
    const matches = [...normalized].filter((char, index) => wordTarget.word[index] === char).length;
    return `${matches} letters are in the correct position. Hint: ${wordTarget.hint}`;
  }, [guess, mode, numberTarget, wordTarget]);

  function submit() {
    const nextTries = tries + 1;
    setTries(nextTries);

    if (mode === "number") {
      const value = Number(guess);
      if (!Number.isFinite(value)) {
        toast.push({ title: "Invalid guess", message: "Enter a valid number.", kind: "error" });
        return;
      }
      if (value === numberTarget) { handleWin(nextTries); } else { toast.push({ title: "Keep going", message: hint, kind: "info" }); }
      return;
    }

    if (guess.trim().toLowerCase() === wordTarget.word) { handleWin(nextTries); }
    else { toast.push({ title: "Not yet", message: hint, kind: "info" }); }
  }

  function handleWin(nextTries) {
    const key   = mode === "number" ? "Number mode" : "Word mode";
    const score = Number((100 / nextTries).toFixed(2));

    void submitActivityResult({ activityType: "guess", score, metadata: { mode, tries: nextTries } });
    toast.push({ title: "You got it", message: `${key} solved in ${nextTries} tries.`, kind: "success" });

    const currentBest = best[mode];
    if (!currentBest || nextTries < currentBest) {
      const updated = { ...best, [mode]: nextTries };
      setBest(updated);
      saveBest(updated);
    }
  }

  function reset() {
    setGuess("");
    setTries(0);
    if (mode === "number") { setNumberTarget(randomInt(1, 100)); }
    else { setWordTarget(WORDS[Math.floor(Math.random() * WORDS.length)]); }
    toast.push({ title: "New round", message: `${mode === "number" ? "Number" : "Word"} challenge refreshed.`, kind: "success" });
  }

  return (
    <div className="flex-col-fill" style={{ gap: 12 }}>

      {/* ── Header card ── */}
      <Card style={{ padding: "18px 22px", flexShrink: 0 }}>
        <div className="app-hero-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 24, alignItems: "start" }}>
          <div>
            <div className="hero-kicker">Guess Works</div>
            <div className="display-title" style={{ fontSize: "1.75rem", color: "var(--text)", marginTop: 4 }}>
              Number mode or word mode. Same premium feel.
            </div>
            <div style={{ marginTop: 8, fontSize: "0.875rem", lineHeight: 1.75, color: "var(--text-muted)" }}>
              This page now covers both number guessing and word guessing so the games section feels
              more complete, more social, and more replayable.
            </div>
          </div>
          <div className="app-hero-stats-grid app-card-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            <Signal icon={Hash}        label="Mode"  value={mode === "number" ? "Number" : "Word"} />
            <Signal icon={BrainCircuit}label="Tries" value={String(tries)} />
            <Signal icon={SpellCheck2} label="Best"  value={String(best[mode] || "—")} />
          </div>
        </div>
      </Card>

      {/* ── Main grid ── */}
      <div className="app-main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 0.9fr", gap: 10, flex: 1, minHeight: 0 }}>

        {/* Left: game area */}
        <Card style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Mode switcher */}
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <Toggle active={mode === "number"} onClick={() => setMode("number")}>Number guessing</Toggle>
            <Toggle active={mode === "word"}   onClick={() => setMode("word")}>Word guessing</Toggle>
          </div>

          {/* Challenge brief */}
          <div style={{
            padding: "16px 18px",
            background: "var(--surface-2)", border: "1px solid var(--border-subtle)", borderRadius: 10,
          }}>
            <div className="label-sm" style={{ marginBottom: 6 }}>Challenge brief</div>
            <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
              {mode === "number" ? "Find the hidden number from 1 to 100." : "Guess the hidden word."}
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
              {mode === "number"
                ? "Use deduction and narrow the range quickly."
                : `Length: ${wordTarget.word.length} characters. Hint: ${wordTarget.hint}`}
            </div>
          </div>

          {/* Guess input */}
          <div>
            <div className="label-sm" style={{ marginBottom: 5 }}>Your guess</div>
            <div className="app-input-row" style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <Input
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder={mode === "number" ? "e.g. 42" : "Type the hidden word"}
                  inputMode={mode === "number" ? "numeric" : "text"}
                  onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
                />
              </div>
              <Button variant="secondary" onClick={submit}>Try</Button>
            </div>
          </div>

          {/* Hint display */}
          <div style={{
            padding: "12px 14px",
            background: "var(--surface-2)", border: "1px solid var(--border-subtle)", borderRadius: 8,
            fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6,
          }}>
            Hint: {hint}
          </div>

          <div className="app-action-row" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Button onClick={reset}>New round</Button>
            <Button variant="secondary" onClick={() => setGuess("")}>Clear</Button>
          </div>
        </Card>

        {/* Right: scores */}
        <Card style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="hero-kicker">Best Scores</div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
            Keep beating your best
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <ScoreCard label="Number mode best" value={best.number || "—"} />
            <ScoreCard label="Word mode best"   value={best.word   || "—"} />
          </div>

          <div style={{
            padding: "12px 14px", marginTop: 4,
            background: "var(--surface-2)", border: "1px solid var(--border-subtle)",
            borderRadius: 8, fontSize: "0.825rem", color: "var(--text-muted)", lineHeight: 1.65,
          }}>
            Word mode is perfect for party play or casual multiplayer sessions. Lower tries = higher score on the leaderboard.
          </div>

          {/* Word bank preview */}
          <div>
            <div className="label-sm" style={{ marginBottom: 8 }}>Hidden word pool</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {WORDS.map((w) => (
                <span key={w.word} className="badge">{w.word.length} letters</span>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function GuessingPage() {
  return (
    <ToastProvider>
      <GuessingInner />
    </ToastProvider>
  );
}

function Toggle({ active, children, ...props }) {
  return (
    <button
      type="button"
      style={{
        padding: "7px 16px", borderRadius: 6, fontSize: "0.825rem", fontWeight: 600,
        cursor: "pointer",
        background: active ? "var(--accent-dim)" : "var(--surface-2)",
        border: `1px solid ${active ? "var(--border-hover)" : "var(--border-subtle)"}`,
        color: active ? "var(--text)" : "var(--text-muted)",
        transition: "all 0.12s",
      }}
      {...props}
    >
      {children}
    </button>
  );
}

function Signal({ icon: Icon, label, value }) {
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

function ScoreCard({ label, value }) {
  return (
    <div style={{
      padding: "14px 16px",
      background: "var(--surface-2)", border: "1px solid var(--border-subtle)", borderRadius: 8,
    }}>
      <div className="label-sm" style={{ marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>{value}</div>
    </div>
  );
}

const KEY = "skillnode_guess_best";
function loadBest() {
  try {
    const raw    = localStorage.getItem(KEY);
    if (!raw) return { number: null, word: null };
    const parsed = JSON.parse(raw);
    return { number: parsed?.number || null, word: parsed?.word || null };
  } catch { return { number: null, word: null }; }
}
function saveBest(value) {
  try { localStorage.setItem(KEY, JSON.stringify(value)); } catch { /* Ignore */ }
}
