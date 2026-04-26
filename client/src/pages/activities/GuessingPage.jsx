import { useMemo, useState } from "react";
import { BrainCircuit, Hash, SpellCheck2 } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ToastProvider, useToast } from "../../components/ui/Toast";
import { submitActivityResult } from "../../lib/results";
import { useFairPlayMonitor } from "../../hooks/useFairPlayMonitor";

const NUMBER_CHALLENGES = [
  {
    id: "classic-100",
    title: "Classic 100",
    description: "A sharp warm-up round in the classic 1 to 100 range.",
    min: 1,
    max: 100,
    starterHint: "Use midpoint jumps and tighten the range quickly.",
  },
  {
    id: "negative-swing",
    title: "Negative Swing",
    description: "The hidden value can swing below zero, so sign matters.",
    min: -50,
    max: 50,
    starterHint: "The target may be negative, positive, or exactly zero.",
  },
  {
    id: "triple-digits",
    title: "Triple Digits",
    description: "A broader range that rewards cleaner deduction.",
    min: 100,
    max: 999,
    starterHint: "Take bigger opening jumps, then narrow the band.",
  },
  {
    id: "prime-hunt",
    title: "Prime Hunt",
    description: "The hidden value is always a prime number.",
    min: 11,
    max: 199,
    starterHint: "The answer is prime, so eliminate even numbers fast.",
  },
  {
    id: "square-vault",
    title: "Square Vault",
    description: "Every answer is a perfect square hidden in a compact vault.",
    min: 1,
    max: 225,
    starterHint: "Think in square numbers like 36, 49, 64, and 81.",
  },
];

const WORD_SETS = [
  {
    id: "dev-core",
    title: "Dev Core",
    description: "Programming and architecture terms that feel native to SkillNODE.",
    words: [
      { word: "vector", hint: "A word common in both math and programming." },
      { word: "syntax", hint: "Without this, code or grammar falls apart." },
      { word: "render", hint: "What a browser or engine does to produce a visual output." },
      { word: "refactor", hint: "Improving code structure without changing what it does." },
    ],
  },
  {
    id: "data-systems",
    title: "Data Systems",
    description: "Storage, transport, and system design vocabulary.",
    words: [
      { word: "schema", hint: "Defines the structure of something - a database, JSON, or form." },
      { word: "latency", hint: "A key metric in networking and performance." },
      { word: "payload", hint: "The useful data sent inside a request or event." },
      { word: "sharding", hint: "A scaling technique that splits data across machines." },
    ],
  },
  {
    id: "logic-lab",
    title: "Logic Lab",
    description: "Pattern and reasoning words built for puzzle energy.",
    words: [
      { word: "cipher", hint: "A secret code or encrypted method." },
      { word: "paradox", hint: "A statement that appears to contradict itself." },
      { word: "pattern", hint: "A repeated structure you are expected to notice." },
      { word: "signal", hint: "The useful message hidden inside the noise." },
    ],
  },
  {
    id: "product-ops",
    title: "Product Ops",
    description: "Words from delivery, planning, and execution systems.",
    words: [
      { word: "roadmap", hint: "The high-level plan for what ships next." },
      { word: "backlog", hint: "The queue of work waiting to be prioritized." },
      { word: "rollout", hint: "A staged release to real users." },
      { word: "insight", hint: "The useful understanding hidden inside feedback or data." },
    ],
  },
];

const ALL_WORDS = WORD_SETS.flatMap((set) => set.words);

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)] || list[0];
}

function isPrime(value) {
  if (value < 2) return false;
  for (let divisor = 2; divisor * divisor <= value; divisor += 1) {
    if (value % divisor === 0) return false;
  }
  return true;
}

function generateNumberTarget(challenge) {
  if (challenge.id === "prime-hunt") {
    const primes = [];
    for (let value = challenge.min; value <= challenge.max; value += 1) {
      if (isPrime(value)) primes.push(value);
    }
    return pickRandom(primes);
  }

  if (challenge.id === "square-vault") {
    const squares = [];
    for (let root = 1; root * root <= challenge.max; root += 1) {
      const square = root * root;
      if (square >= challenge.min) squares.push(square);
    }
    return pickRandom(squares);
  }

  return randomInt(challenge.min, challenge.max);
}

function pickWordTarget(wordSet) {
  return pickRandom(wordSet.words);
}

function countSharedLetters(input, target) {
  const counts = {};
  for (const char of target) {
    counts[char] = (counts[char] || 0) + 1;
  }

  let shared = 0;
  for (const char of input) {
    if (counts[char] > 0) {
      counts[char] -= 1;
      shared += 1;
    }
  }
  return shared;
}

function GuessingInner() {
  const toast = useToast();
  useFairPlayMonitor("guess");

  const [mode, setMode] = useState("number");
  const [numberChallengeId, setNumberChallengeId] = useState(NUMBER_CHALLENGES[0].id);
  const [wordSetId, setWordSetId] = useState(WORD_SETS[0].id);
  const [numberTarget, setNumberTarget] = useState(() => generateNumberTarget(NUMBER_CHALLENGES[0]));
  const [wordTarget, setWordTarget] = useState(() => pickWordTarget(WORD_SETS[0]));
  const [guess, setGuess] = useState("");
  const [tries, setTries] = useState(0);
  const [best, setBest] = useState(() => loadBest());

  const numberChallenge = useMemo(
    () => NUMBER_CHALLENGES.find((item) => item.id === numberChallengeId) || NUMBER_CHALLENGES[0],
    [numberChallengeId],
  );
  const wordSet = useMemo(
    () => WORD_SETS.find((item) => item.id === wordSetId) || WORD_SETS[0],
    [wordSetId],
  );

  const hint = useMemo(() => {
    if (mode === "number") {
      if (!guess) {
        return `Range ${numberChallenge.min} to ${numberChallenge.max}. ${numberChallenge.starterHint}`;
      }

      const value = Number(guess);
      if (!Number.isFinite(value)) return "That is not a valid number.";
      if (value < numberChallenge.min || value > numberChallenge.max) {
        return `Stay inside ${numberChallenge.min} to ${numberChallenge.max}.`;
      }
      if (value === numberTarget) return "Perfect.";

      const distance = Math.abs(value - numberTarget);
      const span = numberChallenge.max - numberChallenge.min;
      const hotZone = Math.max(4, Math.floor(span * 0.04));
      const warmZone = Math.max(10, Math.floor(span * 0.12));
      const direction = value < numberTarget ? "Too low." : "Too high.";
      const proximity = distance <= hotZone
        ? "Very close now."
        : distance <= warmZone
          ? "You are getting warmer."
          : "Still plenty of room to narrow it down.";

      return `${direction} ${proximity}`;
    }

    if (!guess) {
      return `Category: ${wordSet.title}. Length ${wordTarget.word.length}. ${wordTarget.hint}`;
    }

    const normalized = guess.trim().toLowerCase();
    if (normalized === wordTarget.word) return "Perfect.";
    const locked = [...normalized].filter((char, index) => wordTarget.word[index] === char).length;
    const shared = countSharedLetters(normalized, wordTarget.word);
    return `${locked} letters are in the right spot. ${shared} total letters appear in the answer. Hint: ${wordTarget.hint}`;
  }, [guess, mode, numberChallenge, numberTarget, wordSet, wordTarget]);

  function resetRound(nextMode = mode, nextNumberChallenge = numberChallenge, nextWordSet = wordSet) {
    setGuess("");
    setTries(0);
    if (nextMode === "number") {
      setNumberTarget(generateNumberTarget(nextNumberChallenge));
    } else {
      setWordTarget(pickWordTarget(nextWordSet));
    }
  }

  function selectMode(nextMode) {
    setMode(nextMode);
    resetRound(nextMode, numberChallenge, wordSet);
  }

  function selectNumberChallenge(nextId) {
    const nextChallenge = NUMBER_CHALLENGES.find((item) => item.id === nextId) || NUMBER_CHALLENGES[0];
    setNumberChallengeId(nextChallenge.id);
    resetRound("number", nextChallenge, wordSet);
  }

  function selectWordSet(nextId) {
    const nextSet = WORD_SETS.find((item) => item.id === nextId) || WORD_SETS[0];
    setWordSetId(nextSet.id);
    resetRound("word", numberChallenge, nextSet);
  }

  function submit() {
    const nextTries = tries + 1;
    setTries(nextTries);

    if (mode === "number") {
      const value = Number(guess);
      if (!Number.isFinite(value)) {
        toast.push({ title: "Invalid guess", message: "Enter a valid number.", kind: "error" });
        return;
      }
      if (value < numberChallenge.min || value > numberChallenge.max) {
        toast.push({
          title: "Outside range",
          message: `Stay inside ${numberChallenge.min} to ${numberChallenge.max}.`,
          kind: "warning",
        });
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
    const score = Number((100 / nextTries).toFixed(2));
    const label = mode === "number" ? numberChallenge.title : wordSet.title;

    void submitActivityResult({
      activityType: "guess",
      score,
      metadata: {
        mode,
        tries: nextTries,
        numberChallengeId,
        wordSetId,
        answer: mode === "number" ? numberTarget : wordTarget.word,
      },
    });

    toast.push({
      title: "You got it",
      message: `${label} solved in ${nextTries} tries.`,
      kind: "success",
    });

    const currentBest = best[mode];
    if (!currentBest || nextTries < currentBest) {
      const updated = { ...best, [mode]: nextTries };
      setBest(updated);
      saveBest(updated);
    }
  }

  function reset() {
    resetRound();
    toast.push({
      title: "New round",
      message: `${mode === "number" ? numberChallenge.title : wordSet.title} is ready.`,
      kind: "success",
    });
  }

  return (
    <div className="flex-col-fill" style={{ gap: 12 }}>
      <Card style={{ padding: "18px 22px", flexShrink: 0 }}>
        <div className="app-hero-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 24, alignItems: "start" }}>
          <div>
            <div className="hero-kicker">Guess Works</div>
            <div className="display-title" style={{ fontSize: "1.75rem", color: "var(--text)", marginTop: 4 }}>
              More quiz variety, sharper hints, stronger replay value.
            </div>
            <div style={{ marginTop: 8, fontSize: "0.875rem", lineHeight: 1.75, color: "var(--text-muted)" }}>
              Number and word guessing now ship with multiple curated challenge sets so this page
              feels broader, smarter, and much more replayable on desktop or mobile.
            </div>
          </div>
          <div className="app-hero-stats-grid app-card-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            <Signal icon={Hash} label="Mode" value={mode === "number" ? "Number" : "Word"} />
            <Signal icon={BrainCircuit} label="Quiz sets" value={String(NUMBER_CHALLENGES.length + WORD_SETS.length)} />
            <Signal icon={SpellCheck2} label="Best" value={String(best[mode] || "--")} />
          </div>
        </div>
      </Card>

      <div className="app-main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 0.9fr", gap: 10, flex: 1, minHeight: 0 }}>
        <Card style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <div className="app-action-row" style={{ display: "flex", flexWrap: "wrap", gap: 6, flexShrink: 0 }}>
            <Toggle active={mode === "number"} onClick={() => selectMode("number")}>Number guessing</Toggle>
            <Toggle active={mode === "word"} onClick={() => selectMode("word")}>Word guessing</Toggle>
          </div>

          <div className="app-card-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
            {(mode === "number" ? NUMBER_CHALLENGES : WORD_SETS).map((item) => {
              const active = mode === "number" ? item.id === numberChallenge.id : item.id === wordSet.id;
              const onClick = mode === "number"
                ? () => selectNumberChallenge(item.id)
                : () => selectWordSet(item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={onClick}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 10,
                    textAlign: "left",
                    cursor: "pointer",
                    background: active ? "var(--accent-dim)" : "var(--surface-2)",
                    border: `1px solid ${active ? "var(--border-hover)" : "var(--border-subtle)"}`,
                    transition: "all 0.12s",
                  }}
                >
                  <div className="label-sm" style={{ marginBottom: 4 }}>{mode === "number" ? "Number set" : "Word set"}</div>
                  <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text)" }}>{item.title}</div>
                  <div style={{ marginTop: 6, fontSize: "0.8rem", lineHeight: 1.55, color: "var(--text-muted)" }}>
                    {item.description}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{
            padding: "16px 18px",
            background: "var(--surface-2)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 10,
          }}>
            <div className="label-sm" style={{ marginBottom: 6 }}>Challenge brief</div>
            <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
              {mode === "number" ? numberChallenge.title : wordSet.title}
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
              {mode === "number"
                ? `${numberChallenge.description} Range: ${numberChallenge.min} to ${numberChallenge.max}. ${numberChallenge.starterHint}`
                : `${wordSet.description} Current word length: ${wordTarget.word.length}. ${wordTarget.hint}`}
            </div>
          </div>

          <div>
            <div className="label-sm" style={{ marginBottom: 5 }}>Your guess</div>
            <div className="app-input-row" style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <Input
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder={
                    mode === "number"
                      ? `Enter a value from ${numberChallenge.min} to ${numberChallenge.max}`
                      : `Guess the hidden ${wordSet.title.toLowerCase()} word`
                  }
                  inputMode={mode === "number" ? "numeric" : "text"}
                  onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
                />
              </div>
              <Button variant="secondary" onClick={submit}>Try</Button>
            </div>
          </div>

          <div style={{
            padding: "12px 14px",
            background: "var(--surface-2)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 8,
            fontSize: "0.85rem",
            color: "var(--text-muted)",
            lineHeight: 1.6,
          }}>
            Hint: {hint}
          </div>

          <div className="app-action-row" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Button onClick={reset}>New round</Button>
            <Button variant="secondary" onClick={() => setGuess("")}>Clear</Button>
          </div>
        </Card>

        <Card style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
          <div className="hero-kicker">Round Snapshot</div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
            Keep beating your best
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <ScoreCard label="Number mode best" value={best.number || "--"} />
            <ScoreCard label="Word mode best" value={best.word || "--"} />
            <ScoreCard label="Current tries" value={String(tries)} />
          </div>

          <div style={{
            padding: "12px 14px",
            marginTop: 4,
            background: "var(--surface-2)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 8,
            fontSize: "0.825rem",
            color: "var(--text-muted)",
            lineHeight: 1.65,
          }}>
            {mode === "number"
              ? `You are in ${numberChallenge.title}. Lower tries means a cleaner logical path to the answer.`
              : `${wordSet.title} is built for memory, deduction, and pattern recognition under pressure.`}
          </div>

          <div>
            <div className="label-sm" style={{ marginBottom: 8 }}>
              {mode === "number" ? "Active range facts" : "Words in this set"}
            </div>
            {mode === "number" ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                <span className="badge">{`${numberChallenge.min} to ${numberChallenge.max}`}</span>
                <span className="badge">{numberChallenge.id === "prime-hunt" ? "Prime only" : "Any valid target"}</span>
                <span className="badge">{numberChallenge.id === "square-vault" ? "Perfect squares" : "Deduction round"}</span>
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {wordSet.words.map((item) => (
                  <span key={item.word} className="badge">{`${item.word.length} letters`}</span>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="label-sm" style={{ marginBottom: 8 }}>Total word bank</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {ALL_WORDS.map((item) => (
                <span key={item.word} className="badge">{item.word}</span>
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
        padding: "7px 16px",
        borderRadius: 6,
        fontSize: "0.825rem",
        fontWeight: 600,
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
      background: "var(--surface-2)",
      border: "1px solid var(--border-subtle)",
      borderRadius: 8,
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
      background: "var(--surface-2)",
      border: "1px solid var(--border-subtle)",
      borderRadius: 8,
    }}>
      <div className="label-sm" style={{ marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>{value}</div>
    </div>
  );
}

const KEY = "skillnode_guess_best";
function loadBest() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { number: null, word: null };
    const parsed = JSON.parse(raw);
    return { number: parsed?.number || null, word: parsed?.word || null };
  } catch {
    return { number: null, word: null };
  }
}

function saveBest(value) {
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // Ignore storage failures.
  }
}
