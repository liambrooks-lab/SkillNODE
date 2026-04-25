import { useMemo, useState } from "react";
import { BrainCircuit, Languages, ListChecks } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ToastProvider, useToast } from "../../components/ui/Toast";
import { api } from "../../lib/api";
import { submitActivityResult } from "../../lib/results";
import { useFairPlayMonitor } from "../../hooks/useFairPlayMonitor";

const QUESTIONS = [
  {
    id: 1,
    question: "Choose the sentence that is grammatically correct.",
    options: [
      "Each of the players have submitted their code.",
      "Each of the players has submitted their code.",
      "Each of the players have submit their code.",
    ],
    answer: 1,
  },
  {
    id: 2,
    question: "Pick the best revision for formal product copy.",
    options: [
      "Our platform got many feature that help users grow fast.",
      "Our platform offers many features that help users grow quickly.",
      "Our platform offer many features helping users grows quickly.",
    ],
    answer: 1,
  },
  {
    id: 3,
    question: "Which sentence uses the apostrophe correctly?",
    options: [
      "The teams strategy improved overnight.",
      "The team's strategy improved overnight.",
      "The teams' strategy improved overnight.",
    ],
    answer: 1,
  },
  {
    id: 4,
    question: "Choose the sentence with the correct subject-verb agreement.",
    options: [
      "Neither the manager nor the developers was available.",
      "Neither the manager nor the developers were available.",
      "Neither the manager nor the developers is available.",
    ],
    answer: 1,
  },
  {
    id: 5,
    question: "Which option corrects the dangling modifier?",
    options: [
      "Running to the meeting, the phone fell out of my pocket.",
      "Running to the meeting, I dropped my phone out of my pocket.",
      "Running to the meeting, my pocket let the phone fall.",
    ],
    answer: 1,
  },
  {
    id: 6,
    question: "Choose the word that fits the blank: The report was ______ accurate, though it missed a few details.",
    options: ["largely", "large", "largeness"],
    answer: 0,
  },
];

function GrammarInner() {
  const toast = useToast();
  useFairPlayMonitor("grammar");

  const [index, setIndex]       = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore]       = useState(0);
  const [completed, setCompleted] = useState(false);
  const [aiBusy, setAiBusy]     = useState(false);

  const current  = QUESTIONS[index];
  const progress = useMemo(
    () => Math.round(((index + (completed ? 1 : 0)) / QUESTIONS.length) * 100),
    [completed, index],
  );

  function submit() {
    if (selected == null) return;

    const correct    = selected === current.answer;
    const nextScore  = correct ? score + 1 : score;
    setScore(nextScore);

    if (index === QUESTIONS.length - 1) {
      setCompleted(true);
      const finalScore = correct ? nextScore : score;
      void submitActivityResult({
        activityType: "grammar",
        score: finalScore,
        accuracy: Number(((finalScore / QUESTIONS.length) * 100).toFixed(2)),
        metadata: { totalQuestions: QUESTIONS.length },
      });
      toast.push({ title: "Grammar set complete", message: `Score: ${finalScore}/${QUESTIONS.length}`, kind: "success" });
      return;
    }

    if (correct) {
      toast.push({ title: "Correct ✓", message: "Good grammar instinct. Next question.", kind: "success" });
    } else {
      toast.push({ title: "Incorrect", message: `The correct answer was option ${current.answer + 1}.`, kind: "warning" });
    }

    setIndex((prev) => prev + 1);
    setSelected(null);
  }

  async function getHint() {
    if (!current) return;
    setAiBusy(true);
    try {
      const { data } = await api.post("/api/ai/hint", {
        activityId: "grammar",
        prompt:
          `Question: ${current.question}\n` +
          `Options: ${current.options.join(" | ")}\n` +
          "Explain what grammatical concept the user should look for, without naming the answer directly.",
      });
      toast.push({ title: "AI hint", message: data.hint, kind: "info", durationMs: 6000 });
    } catch (err) {
      toast.push({ title: "AI hint unavailable", message: err?.response?.data?.error || "Configure OPENAI_API_KEY on the server.", kind: "warning" });
    } finally {
      setAiBusy(false);
    }
  }

  function reset() {
    setIndex(0);
    setSelected(null);
    setScore(0);
    setCompleted(false);
  }

  return (
    <div className="flex-col-fill" style={{ gap: 12 }}>

      {/* ── Header card ── */}
      <Card style={{ padding: "18px 22px", flexShrink: 0 }}>
        <div className="app-hero-grid" style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 24, alignItems: "start" }}>
          <div>
            <div className="hero-kicker">Grammar Edge</div>
            <div className="display-title" style={{ fontSize: "1.75rem", color: "var(--text)", marginTop: 4 }}>
              Sharpen correctness and tone.
            </div>
            <div style={{ marginTop: 8, fontSize: "0.875rem", lineHeight: 1.75, color: "var(--text-muted)" }}>
              This section turns English and grammar practice into a polished challenge page with
              score tracking, focused prompts, and AI explanation support.
            </div>
          </div>
          <div className="app-hero-stats-grid app-card-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            <Tile icon={Languages}   label="Questions" value={String(QUESTIONS.length)} />
            <Tile icon={ListChecks}  label="Score"     value={String(score)} />
            <Tile icon={BrainCircuit}label="Progress"  value={`${progress}%`} />
          </div>
        </div>
      </Card>

      {/* ── Main grid ── */}
      <div className="app-main-grid" style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 10, flex: 1, minHeight: 0 }}>

        {/* Left: question area */}
        <Card style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>
          {/* Progress bar */}
          <div style={{ height: 5, borderRadius: 99, background: "var(--surface-2)", overflow: "hidden", flexShrink: 0 }}>
            <div style={{
              height: "100%", borderRadius: 99,
              background: "var(--btn-bg)",
              width: `${progress}%`, transition: "width 0.4s",
            }} />
          </div>

          {completed ? (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              padding: 24, textAlign: "center",
              background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.20)", borderRadius: 10,
            }}>
              <div style={{ fontSize: "2rem", marginBottom: 12 }}>🏆</div>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Set complete</div>
              <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: 20 }}>
                Final score: {score}/{QUESTIONS.length} · {Math.round((score / QUESTIONS.length) * 100)}% accuracy
              </div>
              <Button onClick={reset}>Restart grammar set</Button>
            </div>
          ) : (
            <>
              {/* Question display */}
              <div style={{
                padding: "16px 18px",
                background: "var(--surface-2)", border: "1px solid var(--border-subtle)", borderRadius: 10,
                flexShrink: 0,
              }}>
                <div className="label-sm" style={{ marginBottom: 6 }}>Question {index + 1} of {QUESTIONS.length}</div>
                <div style={{ fontSize: "1rem", fontWeight: 600, lineHeight: 1.55, color: "var(--text)" }}>
                  {current.question}
                </div>
              </div>

              {/* Options */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                {current.options.map((option, optionIndex) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSelected(optionIndex)}
                    style={{
                      padding: "12px 16px", borderRadius: 8, textAlign: "left", cursor: "pointer",
                      background: selected === optionIndex ? "var(--accent-dim)" : "var(--surface-2)",
                      border: `1px solid ${selected === optionIndex ? "var(--border-hover)" : "var(--border-subtle)"}`,
                      color: selected === optionIndex ? "var(--text)" : "var(--text-muted)",
                      fontSize: "0.875rem", lineHeight: 1.5, transition: "all 0.12s",
                    }}
                  >
                    <span style={{ color: "var(--text-faint)", marginRight: 8, fontWeight: 700 }}>
                      {String.fromCharCode(65 + optionIndex)}.
                    </span>
                    {option}
                  </button>
                ))}
              </div>

              <div className="app-action-row" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <Button onClick={submit} disabled={selected == null}>Submit answer</Button>
                <Button variant="ghost" onClick={getHint} disabled={aiBusy}>
                  {aiBusy ? "Thinking..." : "AI explanation hint"}
                </Button>
              </div>
            </>
          )}
        </Card>

        {/* Right: scoreboard */}
        <Card style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="hero-kicker">Language Scoreboard</div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>
            Focused practice beats random reading.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <DataBox label="Current score" value={String(score)} />
            <DataBox label="Progress"      value={`${progress}%`} />
            <DataBox label="Questions"     value={`${index + (completed ? 1 : 0)} / ${QUESTIONS.length}`} />
          </div>

          <div style={{
            padding: "12px 14px",
            background: "var(--surface-2)", border: "1px solid var(--border-subtle)",
            borderRadius: 8, fontSize: "0.825rem", color: "var(--text-muted)", lineHeight: 1.65,
          }}>
            This module is a strong base for future comprehension exams, spoken English tracks,
            and writing review flows.
          </div>

          {/* Question map */}
          <div>
            <div className="label-sm" style={{ marginBottom: 8 }}>Question map</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {QUESTIONS.map((q, i) => (
                <div
                  key={q.id}
                  style={{
                    width: 30, height: 30, borderRadius: 6,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.75rem", fontWeight: 700,
                    background: i < index || completed
                      ? "var(--accent-dim)"
                      : i === index && !completed
                        ? "var(--btn-bg)"
                        : "var(--surface-2)",
                    border: `1px solid ${i === index && !completed ? "transparent" : "var(--border-subtle)"}`,
                    color: i === index && !completed ? "white" : "var(--text-muted)",
                  }}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function GrammarPage() {
  return (
    <ToastProvider>
      <GrammarInner />
    </ToastProvider>
  );
}

function Tile({ icon: Icon, label, value }) {
  return (
    <div style={{
      padding: "12px 14px",
      background: "var(--surface-2)", border: "1px solid var(--border-subtle)", borderRadius: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 8 }}>
        <Icon size={14} style={{ color: "var(--accent)" }} />
        {label}
      </div>
      <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>{value}</div>
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
