import { useEffect, useMemo, useState } from "react";
import { BrainCircuit, Sigma, Timer } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ToastProvider, useToast } from "../../components/ui/Toast";
import { api } from "../../lib/api";
import { submitActivityResult } from "../../lib/results";
import { useFairPlayMonitor } from "../../hooks/useFairPlayMonitor";

const MATH_QUESTIONS = [
  {
    id: "quad-reciprocal",
    topic: "Quadratic equations",
    difficulty: "Grade 11",
    prompt: "If alpha and beta are the roots of x^2 - 7x + 10 = 0, what is 1/alpha + 1/beta?",
    options: ["3/5", "7/10", "10/7", "5/7"],
    answerIndex: 1,
    explanation: "For a quadratic, alpha + beta = 7 and alpha*beta = 10, so 1/alpha + 1/beta = 7/10.",
  },
  {
    id: "log-balance",
    topic: "Logarithms",
    difficulty: "Grade 11",
    prompt: "Solve log2(x - 1) + log2(x + 1) = 3.",
    options: ["x = 2", "x = 3", "x = sqrt(7)", "x = 4"],
    answerIndex: 1,
    explanation: "Combine logs: log2((x - 1)(x + 1)) = 3, so x^2 - 1 = 8 and x = 3.",
  },
  {
    id: "trig-max",
    topic: "Trigonometry",
    difficulty: "Grade 11",
    prompt: "For real theta, the maximum value of sin(theta) + cos(theta) is:",
    options: ["1", "sqrt(2)", "2", "3/2"],
    answerIndex: 1,
    explanation: "sin(theta) + cos(theta) = sqrt(2) sin(theta + 45deg), whose maximum is sqrt(2).",
  },
  {
    id: "gp-sum",
    topic: "Sequences and series",
    difficulty: "Grade 11",
    prompt: "The sum to infinity of a geometric progression is 18 and its first term is 6. What is the common ratio?",
    options: ["1/3", "2/3", "3/4", "1/2"],
    answerIndex: 1,
    explanation: "18 = 6/(1-r), so 1-r = 1/3 and r = 2/3.",
  },
  {
    id: "derivative-slope",
    topic: "Differentiation",
    difficulty: "Grade 12",
    prompt: "What is the slope of the tangent to y = x^3 - 3x^2 + 2x at x = 2?",
    options: ["2", "4", "6", "8"],
    answerIndex: 0,
    explanation: "dy/dx = 3x^2 - 6x + 2. At x = 2, the slope is 2.",
  },
  {
    id: "definite-integral",
    topic: "Integration",
    difficulty: "Grade 12",
    prompt: "Evaluate integral from 0 to 1 of (3x^2 + 2x) dx.",
    options: ["1", "3/2", "2", "5/2"],
    answerIndex: 2,
    explanation: "Integrate to x^3 + x^2 and substitute 1 and 0. The value is 2.",
  },
  {
    id: "probability-blue",
    topic: "Probability",
    difficulty: "Grade 12",
    prompt: "A bag has 5 red and 4 blue balls. Two are drawn without replacement. What is the probability both are blue?",
    options: ["1/9", "1/6", "2/9", "5/18"],
    answerIndex: 1,
    explanation: "P(blue then blue) = 4/9 x 3/8 = 1/6.",
  },
  {
    id: "complex-product",
    topic: "Complex numbers",
    difficulty: "Grade 11",
    prompt: "What is the value of (3 + 4i)(3 - 4i)?",
    options: ["7", "9", "16", "25"],
    answerIndex: 3,
    explanation: "Use conjugates: a^2 + b^2 = 3^2 + 4^2 = 25.",
  },
  {
    id: "determinant",
    topic: "Matrices",
    difficulty: "Grade 12",
    prompt: "What is the determinant of [[2, 3], [5, 7]]?",
    options: ["-1", "-2", "1", "2"],
    answerIndex: 0,
    explanation: "For a 2x2 matrix, determinant = ad - bc = 14 - 15 = -1.",
  },
  {
    id: "vector-magnitude",
    topic: "Vectors",
    difficulty: "Grade 12",
    prompt: "If vector a = 2i - j + 2k, what is |a|?",
    options: ["2", "3", "sqrt(7)", "sqrt(9)"],
    answerIndex: 1,
    explanation: "|a| = sqrt(2^2 + (-1)^2 + 2^2) = 3.",
  },
  {
    id: "binomial-term",
    topic: "Binomial theorem",
    difficulty: "Grade 11",
    prompt: "The coefficient of x^2 in (1 + x)^5 is:",
    options: ["5", "10", "15", "20"],
    answerIndex: 1,
    explanation: "The coefficient is 5C2 = 10.",
  },
  {
    id: "circle-equation",
    topic: "Coordinate geometry",
    difficulty: "Grade 12",
    prompt: "Which circle has center (2, -1) and radius 3?",
    options: [
      "(x - 2)^2 + (y + 1)^2 = 9",
      "(x + 2)^2 + (y - 1)^2 = 9",
      "(x - 2)^2 + (y - 1)^2 = 3",
      "(x + 2)^2 + (y + 1)^2 = 3",
    ],
    answerIndex: 0,
    explanation: "The standard form is (x - h)^2 + (y - k)^2 = r^2.",
  },
];

function nextQuestion(exceptId) {
  const available = MATH_QUESTIONS.filter((item) => item.id !== exceptId);
  return available[Math.floor(Math.random() * available.length)] || MATH_QUESTIONS[0];
}

function MathInner() {
  const toast = useToast();
  useFairPlayMonitor("math");

  const [question, setQuestion] = useState(() => nextQuestion());
  const [selected, setSelected] = useState(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(() => loadBestStreak());
  const [seconds, setSeconds] = useState(90);
  const [running, setRunning] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [aiBusy, setAiBusy] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSeconds((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running || seconds > 0) return;
    stopRun();
  }, [running, seconds]);

  const accuracy = useMemo(
    () => (attempts > 0 ? Math.round((correctCount / attempts) * 100) : 100),
    [attempts, correctCount],
  );

  function start() {
    setSeconds(90);
    setStreak(0);
    setAttempts(0);
    setCorrectCount(0);
    setSelected(null);
    setQuestion(nextQuestion());
    setRunning(true);
  }

  function stopRun() {
    setRunning(false);
    const score = Number((correctCount * 12 + streak * 4).toFixed(2));

    void submitActivityResult({
      activityType: "math",
      score,
      accuracy,
      durationMs: Math.max(0, (90 - seconds) * 1000),
      metadata: {
        topic: question.topic,
        attempts,
        correctCount,
      },
    });

    toast.push({
      title: "Advanced round complete",
      message: `Correct ${correctCount}/${attempts || 0} | Best streak ${Math.max(bestStreak, streak)}`,
      kind: "success",
    });

    if (streak > bestStreak) {
      setBestStreak(streak);
      saveBestStreak(streak);
    }
  }

  function moveNext() {
    setSelected(null);
    setQuestion(nextQuestion(question.id));
  }

  function submit() {
    if (selected == null || !running) return;

    const isCorrect = selected === question.answerIndex;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (isCorrect) {
      const nextStreak = streak + 1;
      const nextCorrect = correctCount + 1;
      setStreak(nextStreak);
      setCorrectCount(nextCorrect);

      if (nextStreak > bestStreak) {
        setBestStreak(nextStreak);
        saveBestStreak(nextStreak);
      }

      toast.push({
        title: "Correct",
        message: `${question.topic} handled well. Keep the streak alive.`,
        kind: "success",
      });
      moveNext();
      return;
    }

    setStreak(0);
    toast.push({
      title: "Not this one",
      message: question.explanation,
      kind: "warning",
      durationMs: 5500,
    });
    moveNext();
  }

  async function getHint() {
    setAiBusy(true);
    try {
      const { data } = await api.post("/api/ai/hint", {
        activityId: "math",
        prompt:
          `Topic: ${question.topic}\n` +
          `Difficulty: ${question.difficulty}\n` +
          `Question: ${question.prompt}\n` +
          `Options: ${question.options.join(" | ")}\n` +
          "Give a short strategy hint without revealing the final answer.",
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
    <div className="space-y-6 pb-24">
      <Card className="p-6 md:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="hero-kicker">Math Clash</div>
            <div className="display-title mt-2 text-4xl md:text-5xl">
              Grade 11-12 questions under timed pressure.
            </div>
            <div className="mt-4 max-w-3xl text-sm leading-7 text-white/63 md:text-base">
              This round now uses tougher school-level math across calculus, logs, vectors,
              probability, matrices, and more. It is built to feel like a serious timed drill, not
              primary-level arithmetic.
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat icon={Sigma} label="Topic" value={question.topic} />
            <Stat icon={BrainCircuit} label="Streak" value={String(streak)} />
            <Stat icon={Timer} label="Timer" value={`${seconds}s`} />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <Card className="p-6">
          <div className="rounded-[30px] border border-white/10 bg-slate-950/28 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs uppercase tracking-[0.22em] text-white/45">
                {question.topic} | {question.difficulty}
              </div>
              <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/58">
                {MATH_QUESTIONS.length} question bank
              </div>
            </div>
            <div className="mt-4 text-2xl font-semibold leading-9 md:text-3xl">{question.prompt}</div>
          </div>

          <div className="mt-5 grid gap-3">
            {question.options.map((option, index) => (
              <button
                key={`${question.id}-${option}`}
                type="button"
                className={`rounded-[22px] border px-4 py-4 text-left text-sm transition md:text-base ${
                  selected === index
                    ? "border-cyan-200/35 bg-cyan-300/12 text-white"
                    : "border-white/10 bg-white/5 text-white/72 hover:bg-white/10"
                }`}
                onClick={() => setSelected(index)}
                disabled={!running}
              >
                <span className="mr-3 text-white/45">{String.fromCharCode(65 + index)}.</span>
                {option}
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={start}>{running ? "Restart round" : "Start round"}</Button>
            <Button variant="secondary" onClick={submit} disabled={!running || selected == null}>
              Submit answer
            </Button>
            <Button variant="secondary" onClick={stopRun} disabled={!running}>
              Stop
            </Button>
            <Button variant="ghost" onClick={getHint} disabled={aiBusy}>
              {aiBusy ? "Thinking..." : "AI strategy hint"}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="hero-kicker">Performance</div>
          <div className="mt-2 text-2xl font-semibold">Advanced round snapshot</div>

          <div className="mt-5 grid gap-3">
            <DataBox label="Best streak" value={String(bestStreak || 0)} />
            <DataBox label="Correct answers" value={String(correctCount)} />
            <DataBox label="Accuracy" value={`${accuracy}%`} />
          </div>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-slate-950/28 p-4 text-sm text-white/68">
            Explanation preview: {question.explanation}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function MathDrillsPage() {
  return (
    <ToastProvider>
      <MathInner />
    </ToastProvider>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2 text-sm text-white/55">
        <Icon size={16} className="text-cyan-200" />
        {label}
      </div>
      <div className="mt-3 text-xl font-semibold md:text-2xl">{value}</div>
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

const KEY = "skillnode_math_best_streak";

function loadBestStreak() {
  try {
    const raw = localStorage.getItem(KEY);
    const value = Number(raw);
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

function saveBestStreak(value) {
  try {
    localStorage.setItem(KEY, String(value));
  } catch {
    // Ignore storage issues.
  }
}
