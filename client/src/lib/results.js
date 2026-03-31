import { api } from "./api";

export async function submitActivityResult(payload) {
  try {
    await api.post("/api/results", payload);
  } catch {
    // Avoid breaking the gameplay flow on telemetry failures.
  }
}
