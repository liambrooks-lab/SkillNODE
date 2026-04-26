import { useMemo, useState } from "react";
import { BookOpenText, BrainCircuit, SearchCheck } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ToastProvider, useToast } from "../../components/ui/Toast";
import { api } from "../../lib/api";
import { submitActivityResult } from "../../lib/results";
import { useFairPlayMonitor } from "../../hooks/useFairPlayMonitor";

const PASSAGES = [
  {
    id: "discipline",
    title: "The Discipline Behind Fast Growth",
    body:
      "High-performing teams rarely improve because of one giant breakthrough. More often, they " +
      "improve because they create systems for consistent review, quick feedback, and deliberate " +
      "practice. A product becomes trusted when users can feel that every screen, every message, " +
      "and every workflow belongs to the same thoughtful system. In that way, polished execution is " +
      "not just visual. It is operational discipline made visible.",
    questions: [
      {
        id: 1,
        prompt: "What is the main idea of the passage?",
        options: [
          "Big breakthroughs are the only way teams improve.",
          "Consistent systems and deliberate practice drive strong improvement.",
          "Visual polish matters more than workflow quality.",
        ],
        answer: 1,
      },
      {
        id: 2,
        prompt: "According to the passage, what makes a product feel trustworthy?",
        options: [
          "Every part feels like it belongs to one thoughtful system.",
          "It includes many unrelated features.",
          "It changes its design constantly.",
        ],
        answer: 0,
      },
      {
        id: 3,
        prompt: "What does 'operational discipline made visible' refer to?",
        options: [
          "Only a beautiful UI",
          "A well-run system reflected in the product experience",
          "Strict employee monitoring",
        ],
        answer: 1,
      },
    ],
  },
  {
    id: "focus",
    title: "The Economy of Attention",
    body:
      "Modern knowledge work is not limited by effort or resources - it is limited by attention. " +
      "The most productive individuals are not those who work the longest hours but those who " +
      "protect large uninterrupted blocks of deep focus. Notifications, meetings, and context " +
      "switching are the silent killers of creative output. A single distraction can cost far more " +
      "time than the interruption itself, as the mind requires a recovery period to return to its " +
      "previous depth of concentration.",
    questions: [
      {
        id: 1,
        prompt: "What is the primary constraint on modern knowledge work according to the passage?",
        options: [
          "Lack of resources",
          "Limited working hours",
          "Diminished attention",
        ],
        answer: 2,
      },
      {
        id: 2,
        prompt: "What do notifications and context switching represent in the passage?",
        options: [
          "Tools for boosting creativity",
          "Silent killers of creative output",
          "Essential parts of collaborative work",
        ],
        answer: 1,
      },
      {
        id: 3,
        prompt: "Why is a single distraction costly according to the author?",
        options: [
          "It permanently reduces IQ",
          "The mind needs time to regain its previous depth of focus",
          "It leads to more meetings",
        ],
        answer: 1,
      },
    ],
  },
];

function ComprehensionInner() {
  const toast = useToast();
  useFairPlayMonitor("comprehension");

  const [passageIdx, setPassageIdx] = useState(0);
  const passage   = PASSAGES[passageIdx];
  const [answers, setAnswers]       = useState({});
  const [completed, setCompleted]   = useState(false);
  const [aiBusy, setAiBusy]         = useState(false);

  const score = useMemo(
    () =>
      passage.questions.reduce((total, question) => {
        return total + (answers[question.id] === question.answer ? 1 : 0);
      }, 0),
    [answers, passage],
  );

  function switchPassage(idx) {
    setPassageIdx(idx);
    setAnswers({});
    setCompleted(false);
  }

  function submit() {
    setCompleted(true);
    void submitActivityResult({
      activityType: "comprehension",
      score,
      accuracy: Number(((score / passage.questions.length) * 100).toFixed(2)),
      metadata: { totalQuestions: passage.questions.length, passageTitle: passage.title },
    });
    toast.push({ title: "Passage complete", message: `Score: ${score}/${passage.questions.length}`, kind: "success" });
  }

  function reset() {
    setAnswers({});
    setCompleted(false);
  }

  async function getHint() {
    setAiBusy(true);
    try {
      const { data } = await api.post("/api/ai/hint", {
        activityId: "comprehension",
        prompt:
          `Passage title: ${passage.title}\n` +
          `Passage: ${passage.body}\n` +
          "Give one short tip for answering comprehension questions accurately.",
      });
      toast.push({ title: "AI hint", message: data.hint, kind: "info", durationMs: 6000 });
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
        <div className="app-hero-grid" style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 24, alignItems: "start" }}>
          <div>
            <div className="hero-kicker">Reading Intel</div>
            <div className="display-title" style={{ fontSize: "1.75rem", color: "var(--text)", marginTop: 4 }}>
              Comprehension that feels exam-ready.
            </div>
            <div style={{ marginTop: 8, fontSize: "0.875rem", lineHeight: 1.75, color: "var(--text-muted)" }}>
              Reading and comprehension now live on their own polished page, so English practice is
              part of the real product flow rather than an afterthought.
            </div>
          </div>
          <div className="app-hero-stats-grid app-card-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            <Tile icon={BookOpenText}  label="Passages"  value={String(PASSAGES.length)} />
            <Tile icon={SearchCheck}   label="Questions" value={String(passage.questions.length)} />
            <Tile icon={BrainCircuit}  label="Score"     value={String(score)} />
          </div>
        </div>
      </Card>

      {/* Passage switcher */}
      <div className="app-action-row" style={{ display: "flex", flexWrap: "wrap", gap: 6, flexShrink: 0 }}>
        {PASSAGES.map((p, i) => (
          <button
            key={p.id}
            onClick={() => switchPassage(i)}
            style={{
              padding: "7px 16px", borderRadius: 6, fontSize: "0.825rem", fontWeight: 600,
              cursor: "pointer",
              background: passageIdx === i ? "var(--accent-dim)" : "var(--surface-2)",
              border: `1px solid ${passageIdx === i ? "var(--border-hover)" : "var(--border-subtle)"}`,
              color: passageIdx === i ? "var(--text)" : "var(--text-muted)",
              transition: "all 0.12s",
            }}
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="app-main-grid" style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 10, flex: 1, minHeight: 0 }}>

        {/* Left: passage + questions */}
        <Card style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>
          {/* Passage text */}
          <div style={{
            padding: "14px 16px",
            background: "var(--surface-2)", border: "1px solid var(--border-subtle)", borderRadius: 10,
            flexShrink: 0,
          }}>
            <div className="label-sm" style={{ marginBottom: 8 }}>{passage.title}</div>
            <div style={{ fontSize: "0.9rem", lineHeight: 1.85, color: "var(--text-muted)" }}>{passage.body}</div>
          </div>

          {/* Questions */}
          <div className="inner-scroll flex-col-fill" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {passage.questions.map((question, idx) => (
              <div
                key={question.id}
                style={{
                  padding: "14px 16px",
                  background: completed
                    ? answers[question.id] === question.answer
                      ? "rgba(34,197,94,0.06)"
                      : "rgba(239,68,68,0.06)"
                    : "var(--surface-2)",
                  border: `1px solid ${
                    completed
                      ? answers[question.id] === question.answer
                        ? "rgba(34,197,94,0.22)"
                        : "rgba(239,68,68,0.22)"
                      : "var(--border-subtle)"
                  }`,
                  borderRadius: 10,
                }}
              >
                <div className="label-sm" style={{ marginBottom: 5 }}>Question {idx + 1}</div>
                <div style={{ fontSize: "0.925rem", fontWeight: 600, color: "var(--text)", marginBottom: 10 }}>
                  {question.prompt}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {question.options.map((option, optionIndex) => (
                    <button
                      key={option}
                      type="button"
                      disabled={completed}
                      onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }))}
                      style={{
                        padding: "9px 12px", borderRadius: 7, textAlign: "left", cursor: completed ? "default" : "pointer",
                        background: answers[question.id] === optionIndex ? "var(--accent-dim)" : "transparent",
                        border: `1px solid ${answers[question.id] === optionIndex ? "var(--border-hover)" : "var(--border-subtle)"}`,
                        color: answers[question.id] === optionIndex ? "var(--text)" : "var(--text-muted)",
                        fontSize: "0.85rem", lineHeight: 1.5, transition: "all 0.12s",
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {completed ? (
                  <div style={{ marginTop: 8, fontSize: "0.78rem", fontWeight: 600, color: answers[question.id] === question.answer ? "#4ade80" : "#f87171" }}>
                    {answers[question.id] === question.answer ? "Correct" : `Answer: ${question.options[question.answer]}`}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="app-action-row" style={{ display: "flex", flexWrap: "wrap", gap: 8, flexShrink: 0 }}>
            {completed ? (
              <Button onClick={reset}>Try again</Button>
            ) : (
              <Button onClick={submit}>Submit passage</Button>
            )}
            <Button variant="ghost" onClick={getHint} disabled={aiBusy}>
              {aiBusy ? "Thinking..." : "AI comprehension hint"}
            </Button>
          </div>
        </Card>

        {/* Right: reading snapshot */}
        <Card style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="hero-kicker">Reading Snapshot</div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>
            Measure retention and inference.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <DataBox label="Current score" value={String(score)} />
            <DataBox label="Status"        value={completed ? "Submitted" : "In progress"} />
            <DataBox label="Passages"      value={String(PASSAGES.length)} />
          </div>

          {completed && (
            <div style={{
              padding: "14px 16px",
              background: score === passage.questions.length ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
              border: `1px solid ${score === passage.questions.length ? "rgba(34,197,94,0.22)" : "rgba(239,68,68,0.22)"}`,
              borderRadius: 8, textAlign: "center",
            }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text)" }}>
                {score}/{passage.questions.length}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 4 }}>
                {Math.round((score / passage.questions.length) * 100)}% accuracy
              </div>
            </div>
          )}

          <div style={{
            padding: "12px 14px",
            background: "var(--surface-2)", border: "1px solid var(--border-subtle)",
            borderRadius: 8, fontSize: "0.825rem", color: "var(--text-muted)", lineHeight: 1.65,
          }}>
            Comprehension is now a first-class citizen in the app, which rounds out the English,
            grammar, and reasoning side of the platform.
          </div>

          {/* Passage list */}
          <div>
            <div className="label-sm" style={{ marginBottom: 8 }}>Available passages</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {PASSAGES.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => switchPassage(i)}
                  style={{
                    padding: "8px 12px", borderRadius: 7, textAlign: "left", cursor: "pointer",
                    background: passageIdx === i ? "var(--accent-dim)" : "var(--surface-2)",
                    border: `1px solid ${passageIdx === i ? "var(--border-hover)" : "var(--border-subtle)"}`,
                    fontSize: "0.8rem", fontWeight: 600, color: passageIdx === i ? "var(--text)" : "var(--text-muted)",
                    transition: "all 0.12s",
                  }}
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function ComprehensionPage() {
  return (
    <ToastProvider>
      <ComprehensionInner />
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
