import { env } from "../env.js";

const JUDGE0_URL = "https://judge0-ce.p.rapidapi.com";
const LANG_IDS = {
  javascript: 63,
  python:     71,
  cpp:        54,
  java:       62,
  typescript: 74,
  c:          50,
};

/** POST /api/code/run */
export async function runCode(req, res) {
  try {
    const { language = "javascript", code, stdin = "" } = req.body;
    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Code is required." });
    }

    const langId = LANG_IDS[language.toLowerCase()];
    if (!langId) {
      return res.status(400).json({ error: `Unsupported language: ${language}` });
    }

    // If no Judge0 key configured, return a safe mock
    if (!env.JUDGE0_API_KEY) {
      return res.json({
        stdout: `[Sandbox offline — no JUDGE0_API_KEY set]\n\nCode (${language}):\n${code.slice(0, 200)}`,
        stderr: "",
        status: { id: 3, description: "Accepted" },
        time: "0.001",
        memory: 0,
      });
    }

    const submitRes = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": env.JUDGE0_API_KEY,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
      body: JSON.stringify({
        language_id: langId,
        source_code: code,
        stdin,
        cpu_time_limit: 5,
        memory_limit: 131072,
      }),
    });

    if (!submitRes.ok) {
      return res.status(502).json({ error: "Code execution service error." });
    }

    const result = await submitRes.json();
    return res.json({
      stdout: result.stdout ?? "",
      stderr: result.stderr ?? result.compile_output ?? "",
      status: result.status,
      time: result.time,
      memory: result.memory,
    });
  } catch (err) {
    console.error("[compilerCtrl.runCode]", err);
    return res.status(500).json({ error: "Execution failed." });
  }
}
