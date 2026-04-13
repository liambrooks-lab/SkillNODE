import { useMemo, useState } from "react";
import { BrainCircuit, Bug, Code2, Play } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ToastProvider, useToast } from "../../components/ui/Toast";
import { api } from "../../lib/api";
import { submitActivityResult } from "../../lib/results";
import { useFairPlayMonitor } from "../../hooks/useFairPlayMonitor";

const LANGUAGE_TRACKS = [
  {
    id: "javascript",
    label: "JavaScript",
    runtime: "Local tests",
    challenges: [
      {
        id: "mergeIntervals",
        title: "Merge Busy Intervals",
        difficulty: "Advanced",
        description: "Merge overlapping booking intervals and return them in sorted order.",
        functionName: "mergeIntervals",
        starter:
          "function mergeIntervals(intervals) {\n  // intervals: [[start, end], ...]\n  return [];\n}",
        tests: [
          { args: [[[1, 3], [2, 6], [8, 10]]], expected: [[1, 6], [8, 10]] },
          { args: [[[1, 4], [4, 5]]], expected: [[1, 5]] },
          { args: [[[5, 7], [1, 2], [2, 4]]], expected: [[1, 4], [5, 7]] },
        ],
        constraints: ["Sort before merging.", "Time target: O(n log n)."],
      },
      {
        id: "kthLargestDistinct",
        title: "Kth Largest Distinct",
        difficulty: "Advanced",
        description: "Return the kth largest distinct number from the array, or null if it does not exist.",
        functionName: "kthLargestDistinct",
        starter:
          "function kthLargestDistinct(numbers, k) {\n  // numbers: integer[]\n  return null;\n}",
        tests: [
          { args: [[7, 5, 5, 3, 9, 7], 2], expected: 7 },
          { args: [[4, 4, 4], 2], expected: null },
          { args: [[12, 1, 8, 10, 8], 3], expected: 8 },
        ],
        constraints: ["Ignore duplicates.", "Do not mutate the caller's array."],
      },
      {
        id: "matrixDiagonalGap",
        title: "Matrix Diagonal Gap",
        difficulty: "Medium",
        description: "Return the absolute difference between the primary and secondary diagonal sums.",
        functionName: "matrixDiagonalGap",
        starter:
          "function matrixDiagonalGap(grid) {\n  // grid is a square matrix\n  return 0;\n}",
        tests: [
          { args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: 0 },
          { args: [[[5, 1], [2, 8]]], expected: 0 },
          { args: [[[6, 1, 1], [4, 5, 2], [9, 3, 7]]], expected: 4 },
        ],
        constraints: ["A single pass is enough."],
      },
    ],
  },
  {
    id: "python",
    label: "Python",
    runtime: "Guided review",
    challenges: [
      {
        id: "peak-length",
        title: "Longest Peak Length",
        difficulty: "Advanced",
        description: "Return the length of the longest peak in an integer array.",
        starter:
          "def longest_peak(arr):\n    # A peak strictly rises and then strictly falls.\n    return 0\n",
        sampleCases: ["[1, 3, 5, 4, 2] -> 5", "[2, 2, 2] -> 0"],
        reviewPoints: [
          "Detect a true peak using arr[i-1] < arr[i] > arr[i+1].",
          "Expand left and right once a peak is found.",
          "Keep the best length instead of collecting every peak.",
        ],
      },
      {
        id: "grid-border-sum",
        title: "Grid Border Sum",
        difficulty: "Advanced",
        description: "Compute the sum of the border elements of a matrix without double-counting corners.",
        starter:
          "def border_sum(grid):\n    rows = len(grid)\n    cols = len(grid[0]) if grid else 0\n    return 0\n",
        sampleCases: ["[[1,2,3],[4,5,6],[7,8,9]] -> 40", "[[5]] -> 5"],
        reviewPoints: [
          "Handle 1-row and 1-column grids separately.",
          "Add top and bottom rows, then left and right edges.",
          "Avoid counting corners twice.",
        ],
      },
    ],
  },
  {
    id: "cpp",
    label: "C++",
    runtime: "Guided review",
    challenges: [
      {
        id: "minimum-platforms",
        title: "Minimum Platforms",
        difficulty: "Advanced",
        description: "Given train arrival and departure times, compute the minimum number of platforms required.",
        starter:
          "#include <bits/stdc++.h>\nusing namespace std;\n\nint minPlatforms(vector<int>& arr, vector<int>& dep) {\n    return 0;\n}\n",
        sampleCases: ["arr=[900,940,950,1100], dep=[910,1200,1120,1130] -> 3"],
        reviewPoints: [
          "Sort arrivals and departures independently.",
          "Use a two-pointer sweep to count overlapping trains.",
          "Track the maximum active platform count.",
        ],
      },
      {
        id: "ship-capacity",
        title: "Minimum Ship Capacity",
        difficulty: "Advanced",
        description: "Find the least capacity needed to ship weights within D days.",
        starter:
          "#include <vector>\nusing namespace std;\n\nint minCapacity(vector<int>& weights, int days) {\n    return 0;\n}\n",
        sampleCases: ["weights=[3,2,2,4,1,4], days=3 -> 6"],
        reviewPoints: [
          "Binary-search the answer between max(weights) and sum(weights).",
          "Write a feasibility function for a chosen capacity.",
          "Shrink the search space carefully on success or failure.",
        ],
      },
    ],
  },
  {
    id: "java",
    label: "Java",
    runtime: "Guided review",
    challenges: [
      {
        id: "spiral-matrix",
        title: "Spiral Traversal",
        difficulty: "Medium",
        description: "Return the spiral traversal of a matrix.",
        starter:
          "import java.util.*;\n\nclass Solution {\n    List<Integer> spiralOrder(int[][] matrix) {\n        return new ArrayList<>();\n    }\n}\n",
        sampleCases: ["[[1,2,3],[4,5,6],[7,8,9]] -> [1,2,3,6,9,8,7,4,5]"],
        reviewPoints: [
          "Maintain top, bottom, left, and right boundaries.",
          "Check boundary crossings after each directional pass.",
          "Append values in exact spiral order.",
        ],
      },
      {
        id: "consecutive-streak",
        title: "Longest Consecutive Streak",
        difficulty: "Advanced",
        description: "Find the length of the longest consecutive integer streak in an unsorted array.",
        starter:
          "import java.util.*;\n\nclass Solution {\n    int longestConsecutive(int[] nums) {\n        return 0;\n    }\n}\n",
        sampleCases: ["[100,4,200,1,3,2] -> 4"],
        reviewPoints: [
          "Use a HashSet for O(1) lookups.",
          "Start counting only when num - 1 is absent.",
          "Grow the streak forward and keep the maximum.",
        ],
      },
    ],
  },
  {
    id: "typescript",
    label: "TypeScript",
    runtime: "Guided review",
    challenges: [
      {
        id: "monthly-ledger",
        title: "Monthly Ledger Rollup",
        difficulty: "Advanced",
        description: "Group transactions by month and compute inflow, outflow, and net totals.",
        starter:
          "type Tx = { at: string; amount: number; kind: 'credit' | 'debit' };\n\nexport function rollupLedger(transactions: Tx[]) {\n  return [];\n}\n",
        sampleCases: ["[{at:'2026-01-02',amount:500,kind:'credit'}] -> [{month:'2026-01', inflow:500, outflow:0, net:500}]"],
        reviewPoints: [
          "Normalize dates into YYYY-MM buckets.",
          "Separate credit and debit totals cleanly.",
          "Return stable, sorted month rows with strong types.",
        ],
      },
      {
        id: "balanced-depth",
        title: "Deepest Balanced Depth",
        difficulty: "Medium",
        description: "Return the maximum nesting depth of a balanced bracket string, or -1 if invalid.",
        starter:
          "export function maxBalancedDepth(source: string): number {\n  return 0;\n}\n",
        sampleCases: ["'(()(()))' -> 3", "'(()' -> -1"],
        reviewPoints: [
          "Increment on '(' and decrement on ')'.",
          "Reject if depth ever becomes negative.",
          "Return -1 when the final depth is not zero.",
        ],
      },
    ],
  },
  {
    id: "sql",
    label: "SQL",
    runtime: "Query review",
    challenges: [
      {
        id: "top-two-region",
        title: "Top Two Scorers Per Region",
        difficulty: "Advanced",
        description: "Write a query that returns the top two scorers in every region from a scores table.",
        starter:
          "SELECT region, name, score\nFROM (\n  -- write your ranked query here\n) ranked\nWHERE rank_in_region <= 2;\n",
        sampleCases: ["Use DENSE_RANK() or ROW_NUMBER() partitioned by region."],
        reviewPoints: [
          "Partition by region.",
          "Order by score descending inside the window function.",
          "Filter the ranked subquery to the top two rows.",
        ],
      },
      {
        id: "monthly-growth",
        title: "Monthly Revenue Growth",
        difficulty: "Advanced",
        description: "Return monthly revenue and month-on-month growth percentage from an orders table.",
        starter:
          "WITH monthly AS (\n  -- aggregate monthly revenue here\n)\nSELECT *\nFROM monthly;\n",
        sampleCases: ["Use LAG(revenue) OVER (ORDER BY month) for previous-month comparison."],
        reviewPoints: [
          "Aggregate by month first.",
          "Use a window function for the previous month.",
          "Guard against division by zero in the growth formula.",
        ],
      },
    ],
  },
];

function CodingInner() {
  const toast = useToast();
  useFairPlayMonitor("coding");

  const [languageId, setLanguageId] = useState(LANGUAGE_TRACKS[0].id);
  const language = useMemo(
    () => LANGUAGE_TRACKS.find((item) => item.id === languageId) || LANGUAGE_TRACKS[0],
    [languageId],
  );
  const [challengeId, setChallengeId] = useState(LANGUAGE_TRACKS[0].challenges[0].id);
  const challenge = useMemo(
    () => language.challenges.find((item) => item.id === challengeId) || language.challenges[0],
    [challengeId, language],
  );
  const [code, setCode] = useState(LANGUAGE_TRACKS[0].challenges[0].starter);
  const [results, setResults] = useState([]);
  const [aiBusy, setAiBusy] = useState(false);

  function selectLanguage(nextId) {
    const nextLanguage = LANGUAGE_TRACKS.find((item) => item.id === nextId) || LANGUAGE_TRACKS[0];
    const nextChallenge = nextLanguage.challenges[0];
    setLanguageId(nextLanguage.id);
    setChallengeId(nextChallenge.id);
    setCode(nextChallenge.starter);
    setResults([]);
  }

  function selectChallenge(nextId) {
    const next = language.challenges.find((item) => item.id === nextId) || language.challenges[0];
    setChallengeId(next.id);
    setCode(next.starter);
    setResults([]);
  }

  function runTests() {
    if (!challenge.functionName) {
      const reviewRows = (challenge.reviewPoints || []).map((point, index) => ({
        id: `${challenge.id}-${index}`,
        label: `Checkpoint ${index + 1}`,
        state: "review",
        expected: point,
        actual: "Check your code against this review target.",
      }));
      setResults(reviewRows);
      toast.push({
        title: "Review checklist ready",
        message: `${language.label} challenge opened with guided evaluation points.`,
        kind: "info",
      });
      return;
    }

    try {
      const fn = new Function(
        `${code}\nreturn typeof ${challenge.functionName} === "function" ? ${challenge.functionName} : null;`,
      )();

      if (typeof fn !== "function") {
        throw new Error(`Expected a function named ${challenge.functionName}.`);
      }

      const nextResults = challenge.tests.map((test, index) => {
        const actual = fn(...test.args);
        const pass = deepEqual(actual, test.expected);
        return {
          id: `${challenge.id}-${index}`,
          label: `Test ${index + 1}`,
          state: pass ? "pass" : "fail",
          expected: JSON.stringify(test.expected),
          actual: JSON.stringify(actual),
        };
      });

      setResults(nextResults);
      const passed = nextResults.filter((item) => item.state === "pass").length;
      const accuracy = Number(((passed / nextResults.length) * 100).toFixed(2));

      if (passed > 0) {
        void submitActivityResult({
          activityType: "coding",
          score: accuracy,
          accuracy,
          metadata: {
            language: language.id,
            challengeId: challenge.id,
            passed,
            totalTests: nextResults.length,
          },
        });
      }

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
          state: "fail",
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
          `Language: ${language.label}\n` +
          `Challenge: ${challenge.title}\n` +
          `Difficulty: ${challenge.difficulty}\n` +
          `Description: ${challenge.description}\n` +
          `Current code:\n${code}\n` +
          "Give one short debugging or design hint without giving the full solution.",
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
            <div className="display-title mt-2 text-4xl md:text-5xl">
              Multi-language challenges with stronger depth.
            </div>
            <div className="mt-4 max-w-3xl text-sm leading-7 text-white/63 md:text-base">
              The coding round now covers JavaScript, Python, C++, Java, TypeScript, and SQL.
              JavaScript runs local sample tests; the other tracks ship with serious prompts,
              starter templates, constraints, and review checkpoints for broader practice.
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Tile icon={Code2} label="Languages" value={String(LANGUAGE_TRACKS.length)} />
            <Tile
              icon={Play}
              label="Challenges"
              value={String(LANGUAGE_TRACKS.reduce((sum, item) => sum + item.challenges.length, 0))}
            />
            <Tile icon={Bug} label="Mode" value={language.runtime} />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex flex-wrap gap-3">
          {LANGUAGE_TRACKS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`rounded-full border px-4 py-2 text-sm transition ${
                item.id === language.id
                  ? "border-cyan-200/30 bg-cyan-300/10 text-white"
                  : "border-white/10 bg-white/5 text-white/65 hover:bg-white/10"
              }`}
              onClick={() => selectLanguage(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="p-6">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {language.challenges.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`rounded-[24px] border p-4 text-left transition ${
                  item.id === challenge.id
                    ? "border-cyan-200/30 bg-cyan-300/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
                onClick={() => selectChallenge(item.id)}
              >
                <div className="text-xs uppercase tracking-[0.18em] text-white/45">{item.difficulty}</div>
                <div className="mt-2 text-base font-semibold">{item.title}</div>
                <div className="mt-2 text-sm text-white/60">{item.description}</div>
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-[28px] border border-white/10 bg-slate-950/28 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-white/45">
                  {language.label} | {challenge.difficulty}
                </div>
                <div className="mt-2 text-2xl font-semibold">{challenge.title}</div>
              </div>
              <Button variant="secondary" onClick={() => setCode(challenge.starter)}>
                Reset starter
              </Button>
            </div>
            <div className="mt-3 text-sm leading-7 text-white/62">{challenge.description}</div>

            {challenge.constraints?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {challenge.constraints.map((item) => (
                  <div
                    key={item}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/58"
                  >
                    {item}
                  </div>
                ))}
              </div>
            ) : null}
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
              {challenge.functionName ? "Run local tests" : "Open review checklist"}
            </Button>
            <Button variant="ghost" className="gap-2" onClick={getHint} disabled={aiBusy}>
              <BrainCircuit size={16} />
              {aiBusy ? "Thinking..." : "AI debug hint"}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="hero-kicker">Evaluation Board</div>
          <div className="mt-2 text-2xl font-semibold">
            {challenge.functionName ? "Sample test feedback" : "Language review checklist"}
          </div>

          {challenge.sampleCases?.length ? (
            <div className="mt-5 rounded-[24px] border border-white/10 bg-slate-950/28 p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-white/45">Sample cases</div>
              <div className="mt-3 space-y-2 text-sm text-white/68">
                {challenge.sampleCases.map((item) => (
                  <div key={item}>{item}</div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-5 space-y-3">
            {results.map((result) => (
              <div
                key={result.id}
                className={`rounded-[24px] border p-4 ${
                  result.state === "pass"
                    ? "border-emerald-300/20 bg-emerald-300/10"
                    : result.state === "fail"
                      ? "border-rose-300/20 bg-rose-300/10"
                      : "border-sky-300/20 bg-sky-300/10"
                }`}
              >
                <div className="font-semibold">{result.label}</div>
                <div className="mt-2 text-sm text-white/75">Expected: {result.expected}</div>
                <div className="mt-1 text-sm text-white/60">Actual: {result.actual}</div>
              </div>
            ))}

            {results.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-white/10 px-4 py-8 text-sm text-white/45">
                {challenge.functionName
                  ? "Run local tests to see pass and fail feedback here."
                  : "Open the review checklist to get language-specific evaluation points here."}
              </div>
            ) : null}
          </div>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-slate-950/28 p-4 text-sm text-white/62">
            JavaScript is executable in-browser right now. The remaining language tracks are built
            as interview-style practice sets with richer prompts, samples, and review targets so
            your coding area feels much broader immediately.
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
