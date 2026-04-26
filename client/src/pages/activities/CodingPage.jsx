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
      {
        id: "inventoryBuckets",
        title: "Inventory Buckets",
        difficulty: "Advanced",
        description: "Group products by category and return a sorted summary with item counts per category.",
        functionName: "inventoryBuckets",
        starter:
          "function inventoryBuckets(items) {\n  // items: [{ category: string, name: string }]\n  return [];\n}",
        tests: [
          {
            args: [[
              { category: "hardware", name: "mouse" },
              { category: "hardware", name: "keyboard" },
              { category: "books", name: "clean code" },
            ]],
            expected: [
              { category: "books", count: 1 },
              { category: "hardware", count: 2 },
            ],
          },
          { args: [[{ category: "a", name: "x" }, { category: "a", name: "y" }]], expected: [{ category: "a", count: 2 }] },
          { args: [[]], expected: [] },
        ],
        constraints: ["Sort the result by category name.", "Do not mutate the input array."],
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
      {
        id: "balanced-segments",
        title: "Balanced Segment Count",
        difficulty: "Advanced",
        description: "Return how many contiguous segments in a binary string contain the same number of 0s and 1s.",
        starter:
          "def balanced_segments(bits):\n    # bits is a string like '001101'\n    return 0\n",
        sampleCases: ["'0011' -> 2", "'0100110101' -> 4"],
        reviewPoints: [
          "Track runs of repeated characters.",
          "A valid segment exists whenever adjacent run sizes overlap.",
          "Sum the minimum of each adjacent run pair.",
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
      {
        id: "rain-water",
        title: "Rain Water Trapped",
        difficulty: "Advanced",
        description: "Compute how much rain water is trapped between elevation bars.",
        starter:
          "#include <vector>\nusing namespace std;\n\nint trapWater(vector<int>& heights) {\n    return 0;\n}\n",
        sampleCases: ["[0,1,0,2,1,0,1,3,2,1,2,1] -> 6"],
        reviewPoints: [
          "Two-pointer or prefix/suffix maxima both work.",
          "Always compare the smaller boundary first.",
          "Accumulate trapped water, not boundary heights.",
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
      {
        id: "rotate-image",
        title: "Rotate Image Clockwise",
        difficulty: "Medium",
        description: "Rotate an NxN matrix 90 degrees clockwise in place.",
        starter:
          "import java.util.*;\n\nclass Solution {\n    void rotate(int[][] matrix) {\n    }\n}\n",
        sampleCases: ["[[1,2,3],[4,5,6],[7,8,9]] -> [[7,4,1],[8,5,2],[9,6,3]]"],
        reviewPoints: [
          "Transpose first, then reverse each row.",
          "Do not allocate a second matrix.",
          "Be careful with row/column bounds in place swaps.",
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
      {
        id: "dedupe-timeline",
        title: "Dedupe Timeline",
        difficulty: "Advanced",
        description: "Keep the latest event for every id, then return events sorted by newest first.",
        starter:
          "type EventRow = { id: string; at: string; value: number };\n\nexport function dedupeTimeline(rows: EventRow[]) {\n  return [];\n}\n",
        sampleCases: ["[{id:'a',at:'2026-01-01',value:1},{id:'a',at:'2026-01-03',value:2}] -> latest entry only"],
        reviewPoints: [
          "Treat 'at' as a comparable timestamp string.",
          "Store the latest row seen for each id.",
          "Sort the final rows by descending time.",
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
      {
        id: "active-streak-days",
        title: "Active Streak Days",
        difficulty: "Advanced",
        description: "Write a query that returns each user's longest streak of consecutive active days.",
        starter:
          "WITH ordered AS (\n  -- derive row numbers and streak groups here\n)\nSELECT *\nFROM ordered;\n",
        sampleCases: ["Use date - row_number grouping to identify consecutive-day islands."],
        reviewPoints: [
          "Partition by user.",
          "Order activity dates chronologically.",
          "Collapse consecutive-day islands before taking MAX streak length.",
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
  const [code, setCode]       = useState(LANGUAGE_TRACKS[0].challenges[0].starter);
  const [results, setResults] = useState([]);
  const [aiBusy, setAiBusy]  = useState(false);

  function selectLanguage(nextId) {
    const nextLanguage  = LANGUAGE_TRACKS.find((item) => item.id === nextId) || LANGUAGE_TRACKS[0];
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
      toast.push({ title: "Review checklist ready", message: `${language.label} challenge opened with guided evaluation points.`, kind: "info" });
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
        const pass   = deepEqual(actual, test.expected);
        return {
          id: `${challenge.id}-${index}`,
          label: `Test ${index + 1}`,
          state: pass ? "pass" : "fail",
          expected: JSON.stringify(test.expected),
          actual: JSON.stringify(actual),
        };
      });

      setResults(nextResults);
      const passed   = nextResults.filter((item) => item.state === "pass").length;
      const accuracy = Number(((passed / nextResults.length) * 100).toFixed(2));

      if (passed > 0) {
        void submitActivityResult({
          activityType: "coding",
          score: accuracy,
          accuracy,
          metadata: { language: language.id, challengeId: challenge.id, passed, totalTests: nextResults.length },
        });
      }

      toast.push({
        title: passed === nextResults.length ? "All tests passed" : "Tests completed",
        message: `${passed}/${nextResults.length} passing`,
        kind: passed === nextResults.length ? "success" : "warning",
      });
    } catch (err) {
      setResults([{ id: "runtime-error", label: "Runtime error", state: "fail", expected: "Valid function output", actual: err.message }]);
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
            <div className="hero-kicker">Code Arena</div>
            <div className="display-title" style={{ fontSize: "1.75rem", color: "var(--text)", marginTop: 4 }}>
              Multi-language challenges with stronger depth.
            </div>
            <div style={{ marginTop: 8, fontSize: "0.875rem", lineHeight: 1.75, color: "var(--text-muted)" }}>
              The coding round covers JavaScript, Python, C++, Java, TypeScript, and SQL.
              JavaScript runs local sample tests; the other tracks ship with serious prompts,
              starter templates, constraints, and review checkpoints for broader practice.
            </div>
          </div>
          <div className="app-hero-stats-grid app-card-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            <Tile icon={Code2} label="Languages"  value={String(LANGUAGE_TRACKS.length)} />
            <Tile icon={Play}  label="Challenges" value={String(LANGUAGE_TRACKS.reduce((s, t) => s + t.challenges.length, 0))} />
            <Tile icon={Bug}   label="Mode"       value={language.runtime} />
          </div>
        </div>
      </Card>

      {/* Language tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, flexShrink: 0 }}>
        {LANGUAGE_TRACKS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => selectLanguage(item.id)}
            style={{
              padding: "6px 16px", borderRadius: 6, fontSize: "0.825rem", fontWeight: 600,
              cursor: "pointer",
              background: item.id === language.id ? "var(--accent-dim)" : "var(--surface-2)",
              border: `1px solid ${item.id === language.id ? "var(--border-hover)" : "var(--border-subtle)"}`,
              color: item.id === language.id ? "var(--text)" : "var(--text-muted)",
              transition: "all 0.12s",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="app-main-grid" style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 10, flex: 1, minHeight: 0 }}>

        {/* Left: editor panel */}
        <Card style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12, minHeight: 0, minWidth: 0 }}>
          {/* Challenge selector */}
          <div className="app-card-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, flexShrink: 0 }}>
            {language.challenges.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectChallenge(item.id)}
                style={{
                  padding: "10px 12px", borderRadius: 8, textAlign: "left", cursor: "pointer",
                  background: item.id === challenge.id ? "var(--accent-dim)" : "var(--surface-2)",
                  border: `1px solid ${item.id === challenge.id ? "var(--border-hover)" : "var(--border-subtle)"}`,
                  transition: "all 0.12s",
                }}
              >
                <div className="label-sm" style={{ marginBottom: 3 }}>{item.difficulty}</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>{item.title}</div>
                <div style={{ marginTop: 4, fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.4 }}>{item.description}</div>
              </button>
            ))}
          </div>

          {/* Challenge detail */}
          <div style={{
            padding: "14px 16px", flexShrink: 0,
            background: "var(--surface-2)", border: "1px solid var(--border-subtle)", borderRadius: 10,
          }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
              <div>
                <div className="label-sm">{language.label} | {challenge.difficulty}</div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginTop: 2 }}>{challenge.title}</div>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setCode(challenge.starter)}>Reset starter</Button>
            </div>
            <div style={{ fontSize: "0.85rem", lineHeight: 1.65, color: "var(--text-muted)" }}>{challenge.description}</div>
            {challenge.constraints?.length ? (
              <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 5 }}>
                {challenge.constraints.map((item) => (
                  <span key={item} className="badge">{item}</span>
                ))}
              </div>
            ) : null}
          </div>

          {/* Code area */}
          <textarea
            className="inner-scroll"
            style={{
              minHeight: "clamp(240px, 36vh, 420px)",
              height: "clamp(240px, 36vh, 420px)",
              resize: "none",
              background: "var(--surface-3)", border: "1px solid var(--border)",
              borderRadius: 10, padding: "14px 16px",
              fontFamily: "JetBrains Mono, monospace", fontSize: "0.85rem", lineHeight: 1.7,
              color: "var(--text)", caretColor: "var(--accent)",
              outline: "none",
            }}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
          />

          <div className="app-action-row" style={{ display: "flex", flexWrap: "wrap", gap: 8, flexShrink: 0 }}>
            <Button style={{ gap: 6 }} onClick={runTests}>
              <Play size={14} />
              {challenge.functionName ? "Run local tests" : "Open review checklist"}
            </Button>
            <Button variant="ghost" style={{ gap: 6 }} onClick={getHint} disabled={aiBusy}>
              <BrainCircuit size={14} />
              {aiBusy ? "Thinking..." : "AI debug hint"}
            </Button>
          </div>
        </Card>

        {/* Right: evaluation board */}
        <Card
          className="inner-scroll"
          style={{
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            minHeight: 0,
            minWidth: 0,
            maxHeight: "min(72vh, 760px)",
            overflowY: "auto",
          }}
        >
          <div className="hero-kicker">Evaluation Board</div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>
            {challenge.functionName ? "Sample test feedback" : "Language review checklist"}
          </div>

          {challenge.sampleCases?.length ? (
            <div style={{
              padding: "12px 14px",
              background: "var(--surface-2)", border: "1px solid var(--border-subtle)", borderRadius: 8,
            }}>
              <div className="label-sm" style={{ marginBottom: 8 }}>Sample cases</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.825rem", color: "var(--text-muted)" }}>
                {challenge.sampleCases.map((item) => <div key={item}>{item}</div>)}
              </div>
            </div>
          ) : null}

          <div className="inner-scroll flex-col-fill" style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
            {results.map((result) => (
              <div
                key={result.id}
                style={{
                  padding: "12px 14px", borderRadius: 8,
                  background: result.state === "pass"
                    ? "rgba(34,197,94,0.08)"
                    : result.state === "fail"
                      ? "rgba(239,68,68,0.08)"
                      : "rgba(56,189,248,0.08)",
                  border: `1px solid ${result.state === "pass"
                    ? "rgba(34,197,94,0.22)"
                    : result.state === "fail"
                      ? "rgba(239,68,68,0.22)"
                      : "rgba(56,189,248,0.22)"}`,
                }}
              >
                <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text)" }}>{result.label}</div>
                <div style={{ marginTop: 4, fontSize: "0.8rem", color: "var(--text-muted)" }}>Expected: {result.expected}</div>
                <div style={{ marginTop: 2, fontSize: "0.8rem", color: "var(--text-faint)" }}>Actual: {result.actual}</div>
              </div>
            ))}

            {results.length === 0 ? (
              <div style={{
                padding: "24px 16px", textAlign: "center",
                border: "1px dashed var(--border-subtle)", borderRadius: 10,
                fontSize: "0.825rem", color: "var(--text-faint)",
              }}>
                {challenge.functionName
                  ? "Run local tests to see pass and fail feedback here."
                  : "Open the review checklist to get language-specific evaluation points here."
                }
              </div>
            ) : null}
          </div>

          <div style={{
            padding: "12px 14px",
            background: "var(--surface-2)", border: "1px solid var(--border-subtle)",
            borderRadius: 8, fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.65,
            flexShrink: 0,
          }}>
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

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
