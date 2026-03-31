import { useMemo, useState } from "react";
import { BookOpenText, BrainCircuit, SearchCheck } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ToastProvider, useToast } from "../../components/ui/Toast";
import { api } from "../../lib/api";
import { useFairPlayMonitor } from "../../hooks/useFairPlayMonitor";

const PASSAGE = {
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
};

function ComprehensionInner() {
  const toast = useToast();
  useFairPlayMonitor("comprehension");

  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);

  const score = useMemo(
    () =>
      PASSAGE.questions.reduce((total, question) => {
        return total + (answers[question.id] === question.answer ? 1 : 0);
      }, 0),
    [answers],
  );

  function submit() {
    setCompleted(true);
    toast.push({
      title: "Passage complete",
      message: `Score: ${score}/${PASSAGE.questions.length}`,
      kind: "success",
    });
  }

  async function getHint() {
    setAiBusy(true);
    try {
      const { data } = await api.post("/api/ai/hint", {
        activityId: "comprehension",
        prompt:
          `Passage title: ${PASSAGE.title}\n` +
          `Passage: ${PASSAGE.body}\n` +
          "Give one short tip for answering comprehension questions accurately.",
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

  return (
    <div className="space-y-6 pb-24">
      <Card className="p-6 md:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="hero-kicker">Reading Intel</div>
            <div className="display-title mt-2 text-4xl md:text-5xl">Comprehension that feels exam-ready.</div>
            <div className="mt-4 max-w-3xl text-sm leading-7 text-white/63 md:text-base">
              Reading and comprehension now live on their own polished page, so English practice is
              part of the real product flow rather than an afterthought.
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Tile icon={BookOpenText} label="Passages" value="1" />
            <Tile icon={SearchCheck} label="Questions" value={String(PASSAGE.questions.length)} />
            <Tile icon={BrainCircuit} label="Score" value={`${score}`} />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="p-6">
          <div className="rounded-[28px] border border-white/10 bg-slate-950/28 p-5">
            <div className="text-xs uppercase tracking-[0.22em] text-white/45">{PASSAGE.title}</div>
            <div className="mt-4 text-sm leading-8 text-white/80">{PASSAGE.body}</div>
          </div>

          <div className="mt-5 space-y-4">
            {PASSAGE.questions.map((question, idx) => (
              <div key={question.id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-white/45">Question {idx + 1}</div>
                <div className="mt-2 text-lg font-semibold">{question.prompt}</div>
                <div className="mt-3 space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <button
                      key={option}
                      type="button"
                      className={`w-full rounded-[20px] border p-3 text-left transition ${
                        answers[question.id] === optionIndex
                          ? "border-cyan-200/30 bg-cyan-300/10"
                          : "border-white/10 bg-slate-950/20 hover:bg-white/10"
                      }`}
                      onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }))}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={submit}>Submit passage</Button>
            <Button variant="ghost" onClick={getHint} disabled={aiBusy}>
              {aiBusy ? "Thinking..." : "AI comprehension hint"}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="hero-kicker">Reading Snapshot</div>
          <div className="mt-2 text-2xl font-semibold">Measure retention and inference.</div>
          <div className="mt-5 grid gap-3">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-white/45">Current score</div>
              <div className="mt-2 text-3xl font-semibold">{score}</div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-white/45">Status</div>
              <div className="mt-2 text-2xl font-semibold">{completed ? "Submitted" : "In progress"}</div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-slate-950/28 p-4 text-sm text-white/62">
              Comprehension is now a first-class citizen in the app, which rounds out the English,
              grammar, and reasoning side of the platform.
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
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2 text-sm text-white/55">
        <Icon size={16} className="text-cyan-200" />
        {label}
      </div>
      <div className="mt-3 text-2xl font-semibold">{value}</div>
    </div>
  );
}
