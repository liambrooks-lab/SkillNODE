import { useMemo, useState } from "react";
import { BrainCircuit, Bug, Code2, Play } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ToastProvider, useToast } from "../../components/ui/Toast";
import { api } from "../../lib/api";
import { useFairPlayMonitor } from "../../hooks/useFairPlayMonitor";

const CHALLENGES = [
  {
    id: "sumEven",
    title: "Sum Even Numbers",
    difficulty: "Easy",
    description: "Return the sum of all even numbers in the input array.",
    functionName: "sumEven",
    starter: `function sumEven(numbers) {\n  // numbers is an array of integers\n  return 0;\n}`,
    tests: [
      { args: [[1, 2, 3, 4]], expected: 6 },
      { args: [[5, 7, 11]], expected: 0 },
      { args: [[10, -2, 8]], expected: 16 },
    ],
  },
  {
    id: "reverseWords",
    title: "Reverse Words",
    difficulty: "Medium",
    description: "Return a string with the word order reversed while preserving spaces between words as single spaces.",
    functionName: "reverseWords",
    starter:
      "function reverseWords(sentence) {\n  // sentence is a string\n  return sentence;\n}",
    tests: [
      { args: ["skill node rules"], expected: "rules node skill" },
      { args: ["hello world"], expected: "world hello" },
      { args: ["one"], expected: "one" },
    ],
  },
  {
    id: "highestScorer",
    title: "Highest Scorer",
    difficulty: "Medium",
    description: "Given an array of player objects with name and score, return the name of the highest scorer.",
    functionName: "highestScorer",
    starter:
      "function highestScorer(players) {\n  // players: [{ name, score }]\n  return \"\";\n}",
    tests: [
      {
        args: [[{ name: "Ava", score: 12 }, { name: "Noah", score: 18 }]],
        expected: "Noah",
      },
      {
        args: [[{ name: "Eli", score: 4 }, { name: "Mia", score: 4 }, { name: "Zed", score: 9 }]],
        expected: "Zed",
      },
    ],
  },
];

function CodingInner() {
  const toast = useToast();
  useFairPlayMonitor("coding");

  const [challengeId, setChallengeId] = useState(CHALLENGES[0].id);
  const challenge = useMemo(
    () => CHALLENGES.find((item) => item.id === challengeId) || CHALLENGES[0],
    [challengeId],
  );
  const [code, setCode] = useState(challenge.starter);
  const [results, setResults] = useState([]);
  const [aiBusy, setAiBusy] = useState(false);

  function selectChallenge(nextId) {
    const next = CHALLENGES.find((item) => item.id === nextId) || CHALLENGES[0];
    setChallengeId(next.id);
    setCode(next.starter);
    setResults([]);
  }

  function runTests() {
    try {
      const fn = new Function(`${code}\nreturn typeof ${challenge.functionName} === "function" ? ${challenge.functionName} : null;`)();
      if (typeof fn !== "function") {
        throw new Error(`Expected a function named ${challenge.functionName}.`);
      }

      const nextResults = challenge.tests.map((test, index) => {
        const actual = fn(...test.args);
        const pass = deepEqual(actual, test.expected);
        return {
          id: `${challenge.id}-${index}`,
          label: `Test ${index + 1}`,
          pass,
          expected: JSON.stringify(test.expected),
          actual: JSON.stringify(actual),
        };
      });

      setResults(nextResults);
      const passed = nextResults.filter((item) => item.pass).length;
      toast.push({
        title: passed === nextResults.length ? "All tests passed" : "Tests completed",
        message: `${passed}/${nextResults.length} passing`,
        kind: passed === nextResults.length ? "success" : "warning",
      });
    } catch (err) {
      setResults([
        {
          id: "runtime-error",
          label: "Runtime error",
          pass: false,
          expected: "Valid function output",
          actual: err.message,
        },
      ]);
      toast.push({ title: "Code error", message: err.message, kind: "error" });
    }
  }

  async function getHint() {
    setAiBusy(true);
    try {
      const { data } = await api.post("/api/ai/hint", {
        activityId: "coding",
        prompt:
          `Challenge: ${challenge.title}\n` +
          `Description: ${challenge.description}\n` +
          `Current code:\n${code}\n` +
          "Give one short debugging hint without giving the full solution.",
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
            <div className="hero-kicker">Code Arena</div>
            <div className="display-title mt-2 text-4xl md:text-5xl">Challenge workflows for developers.</div>
            <div className="mt-4 max-w-3xl text-sm leading-7 text-white/63 md:text-base">
              This is the coding competition surface: choose a challenge, write code, run tests,
              and ask the AI coach for a short nudge when you need it.
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Tile icon={Code2} label="Challenges" value={String(CHALLENGES.length)} />
            <Tile icon={Play} label="Runtime" value="JS" />
            <Tile icon={Bug} label="Hints" value="AI ready" />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="p-6">
          <div className="flex flex-wrap gap-3">
            {CHALLENGES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  item.id === challenge.id
                    ? "border-cyan-200/30 bg-cyan-300/10 text-white"
                    : "border-white/10 bg-white/5 text-white/65 hover:bg-white/10"
                }`}
                onClick={() => selectChallenge(item.id)}
              >
                {item.title}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-[28px] border border-white/10 bg-slate-950/28 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-white/45">{challenge.difficulty}</div>
                <div className="mt-2 text-2xl font-semibold">{challenge.title}</div>
              </div>
              <Button variant="secondary" onClick={() => setCode(challenge.starter)}>
                Reset starter
              </Button>
            </div>
            <div className="mt-3 text-sm leading-7 text-white/62">{challenge.description}</div>
          </div>

          <textarea
            className="mt-5 h-[420px] w-full resize-none rounded-[28px] border border-white/10 bg-[#07111f] p-5 text-sm leading-7 text-sky-100 placeholder:text-white/28 focus:border-sky-300/60 focus:outline-none"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
          />

          <div className="mt-5 flex flex-wrap gap-3">
            <Button className="gap-2" onClick={runTests}>
              <Play size={16} />
              Run sample tests
            </Button>
            <Button variant="ghost" className="gap-2" onClick={getHint} disabled={aiBusy}>
              <BrainCircuit size={16} />
              {aiBusy ? "Thinking..." : "AI debug hint"}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="hero-kicker">Test Board</div>
          <div className="mt-2 text-2xl font-semibold">Feedback without leaving the page</div>

          <div className="mt-5 space-y-3">
            {results.map((result) => (
              <div
                key={result.id}
                className={`rounded-[24px] border p-4 ${
                  result.pass
                    ? "border-emerald-300/20 bg-emerald-300/10"
                    : "border-rose-300/20 bg-rose-300/10"
                }`}
              >
                <div className="font-semibold">{result.label}</div>
                <div className="mt-2 text-sm text-white/75">Expected: {result.expected}</div>
                <div className="mt-1 text-sm text-white/60">Actual: {result.actual}</div>
              </div>
            ))}

            {results.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-white/10 px-4 py-8 text-sm text-white/45">
                Run tests to see pass and fail results here.
              </div>
            ) : null}
          </div>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-slate-950/28 p-4 text-sm text-white/62">
            This local challenge board is a clean foundation for future coding competitions,
            leaderboards, hidden tests, and language-specific runtimes.
          </div>
        </Card>
      </div>
    </div>
  );
}

export function CodingPage() {
  return (
    <ToastProvider>
      <CodingInner />
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

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
