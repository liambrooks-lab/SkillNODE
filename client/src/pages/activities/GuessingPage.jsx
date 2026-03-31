import { useMemo, useState } from "react";
import { BrainCircuit, Hash, SpellCheck2 } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ToastProvider, useToast } from "../../components/ui/Toast";
import { submitActivityResult } from "../../lib/results";

const WORDS = [
  { word: "vector", hint: "A word common in both math and programming." },
  { word: "syntax", hint: "Without this, code or grammar falls apart." },
  { word: "cipher", hint: "A secret code or encrypted method." },
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function GuessingInner() {
  const toast = useToast();
  const [mode, setMode] = useState("number");
  const [numberTarget, setNumberTarget] = useState(() => randomInt(1, 100));
  const [wordTarget, setWordTarget] = useState(() => WORDS[Math.floor(Math.random() * WORDS.length)]);
  const [guess, setGuess] = useState("");
  const [tries, setTries] = useState(0);
  const [best, setBest] = useState(() => loadBest());

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

      if (value === numberTarget) {
        handleWin(nextTries);
      } else {
        toast.push({ title: "Keep going", message: hint, kind: "info" });
      }
      return;
    }

    if (guess.trim().toLowerCase() === wordTarget.word) {
      handleWin(nextTries);
    } else {
      toast.push({ title: "Not yet", message: hint, kind: "info" });
    }
  }

  function handleWin(nextTries) {
    const key = mode === "number" ? "Number mode" : "Word mode";
    const score = Number((100 / nextTries).toFixed(2));

    void submitActivityResult({
      activityType: "guess",
      score,
      metadata: {
        mode,
        tries: nextTries,
      },
    });

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

    if (mode === "number") {
      setNumberTarget(randomInt(1, 100));
    } else {
      setWordTarget(WORDS[Math.floor(Math.random() * WORDS.length)]);
    }

    toast.push({ title: "New round", message: `${mode === "number" ? "Number" : "Word"} challenge refreshed.`, kind: "success" });
  }

  return (
    <div className="space-y-6 pb-24">
      <Card className="p-6 md:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="hero-kicker">Guess Works</div>
            <div className="display-title mt-2 text-4xl md:text-5xl">Number mode or word mode. Same premium feel.</div>
            <div className="mt-4 max-w-3xl text-sm leading-7 text-white/63 md:text-base">
              This page now covers both number guessing and word guessing so the games section feels
              more complete, more social, and more replayable.
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Signal icon={Hash} label="Mode" value={mode === "number" ? "Number" : "Word"} />
            <Signal icon={BrainCircuit} label="Tries" value={String(tries)} />
            <Signal icon={SpellCheck2} label="Best" value={String(best[mode] || "-")} />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <Card className="p-6">
          <div className="flex flex-wrap gap-3">
            <Toggle active={mode === "number"} onClick={() => setMode("number")}>
              Number guessing
            </Toggle>
            <Toggle active={mode === "word"} onClick={() => setMode("word")}>
              Word guessing
            </Toggle>
          </div>

          <div className="mt-6 rounded-[28px] border border-white/10 bg-slate-950/28 p-5">
            <div className="text-xs uppercase tracking-[0.22em] text-white/45">Challenge brief</div>
            <div className="mt-3 text-lg font-semibold">
              {mode === "number" ? "Find the hidden number from 1 to 100." : "Guess the hidden word."}
            </div>
            <div className="mt-2 text-sm text-white/62">
              {mode === "number"
                ? "Use deduction and narrow the range quickly."
                : `Length: ${wordTarget.word.length}. Hint: ${wordTarget.hint}`}
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-white/50">
              Your guess
            </label>
            <div className="flex gap-2">
              <Input
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder={mode === "number" ? "e.g. 42" : "Type the hidden word"}
                inputMode={mode === "number" ? "numeric" : "text"}
              />
              <Button variant="secondary" onClick={submit}>
                Try
              </Button>
            </div>
          </div>

          <div className="mt-4 rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-white/72">
            Hint: {hint}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={reset}>New round</Button>
            <Button variant="secondary" onClick={() => setGuess("")}>
              Clear
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="hero-kicker">Best Scores</div>
          <div className="mt-2 text-2xl font-semibold">Keep beating your best</div>

          <div className="mt-5 grid gap-3">
            <ScoreCard label="Number mode best" value={best.number || "-"} />
            <ScoreCard label="Word mode best" value={best.word || "-"} />
            <div className="rounded-[24px] border border-white/10 bg-slate-950/28 p-4 text-sm text-white/62">
              Word mode is perfect for party play or casual multiplayer sessions later.
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
      className={`rounded-full border px-4 py-2 text-sm transition ${
        active
          ? "border-cyan-200/30 bg-cyan-300/10 text-white"
          : "border-white/10 bg-white/5 text-white/65 hover:bg-white/10"
      }`}
      {...props}
    >
      {children}
    </button>
  );
}

function Signal({ icon: Icon, label, value }) {
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

function ScoreCard({ label, value }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-[0.22em] text-white/45">{label}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
    </div>
  );
}

const KEY = "skillnode_guess_best";

function loadBest() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { number: null, word: null };
    const parsed = JSON.parse(raw);
    return {
      number: parsed?.number || null,
      word: parsed?.word || null,
    };
  } catch {
    return { number: null, word: null };
  }
}

function saveBest(value) {
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // Ignore storage issues.
  }
}
