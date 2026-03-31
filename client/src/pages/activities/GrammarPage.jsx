import { useMemo, useState } from "react";
import { BrainCircuit, Languages, ListChecks } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ToastProvider, useToast } from "../../components/ui/Toast";
import { api } from "../../lib/api";
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
];

function GrammarInner() {
  const toast = useToast();
  useFairPlayMonitor("grammar");

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);

  const current = QUESTIONS[index];
  const progress = useMemo(
    () => Math.round(((index + (completed ? 1 : 0)) / QUESTIONS.length) * 100),
    [completed, index],
  );

  function submit() {
    if (selected == null) return;

    const correct = selected === current.answer;
    const nextScore = correct ? score + 1 : score;
    setScore(nextScore);

    if (index === QUESTIONS.length - 1) {
      setCompleted(true);
      toast.push({
        title: "Grammar set complete",
        message: `Score: ${correct ? nextScore : score}/${QUESTIONS.length}`,
        kind: "success",
      });
      return;
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
      toast.push({
        title: "AI hint unavailable",
        message: err?.response?.data?.error || "Configure OPENAI_API_KEY on the server.",
        kind: "warning",
      });
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
    <div className="space-y-6 pb-24">
      <Card className="p-6 md:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="hero-kicker">Grammar Edge</div>
            <div className="display-title mt-2 text-4xl md:text-5xl">Sharpen correctness and tone.</div>
            <div className="mt-4 max-w-3xl text-sm leading-7 text-white/63 md:text-base">
              This section turns English and grammar practice into a polished challenge page with
              score tracking, focused prompts, and AI explanation support.
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Tile icon={Languages} label="Questions" value={String(QUESTIONS.length)} />
            <Tile icon={ListChecks} label="Score" value={`${score}`} />
            <Tile icon={BrainCircuit} label="Progress" value={`${progress}%`} />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="p-6">
          {completed ? (
            <div className="rounded-[28px] border border-emerald-300/20 bg-emerald-300/10 p-6">
              <div className="text-2xl font-semibold">Set complete</div>
              <div className="mt-3 text-sm text-white/70">Final score: {score}/{QUESTIONS.length}</div>
              <div className="mt-5">
                <Button onClick={reset}>Restart grammar set</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-[28px] border border-white/10 bg-slate-950/28 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-white/45">Question {index + 1}</div>
                <div className="mt-3 text-2xl font-semibold">{current.question}</div>
              </div>

              <div className="mt-5 space-y-3">
                {current.options.map((option, optionIndex) => (
                  <button
                    key={option}
                    type="button"
                    className={`w-full rounded-[24px] border p-4 text-left transition ${
                      selected === optionIndex
                        ? "border-cyan-200/30 bg-cyan-300/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                    onClick={() => setSelected(optionIndex)}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button onClick={submit}>Submit answer</Button>
                <Button variant="ghost" onClick={getHint} disabled={aiBusy}>
                  {aiBusy ? "Thinking..." : "AI explanation hint"}
                </Button>
              </div>
            </>
          )}
        </Card>

        <Card className="p-6">
          <div className="hero-kicker">Language Scoreboard</div>
          <div className="mt-2 text-2xl font-semibold">Focused practice beats random reading.</div>
          <div className="mt-5 grid gap-3">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-white/45">Current score</div>
              <div className="mt-2 text-3xl font-semibold">{score}</div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-white/45">Progress</div>
              <div className="mt-2 text-3xl font-semibold">{progress}%</div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-slate-950/28 p-4 text-sm text-white/62">
              This module is a strong base for future comprehension exams, spoken English tracks,
              and writing review flows.
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
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2 text-sm text-white/55">
        <Icon size={16} className="text-cyan-200" />
        {label}
      </div>
      <div className="mt-3 text-2xl font-semibold">{value}</div>
    </div>
  );
}
