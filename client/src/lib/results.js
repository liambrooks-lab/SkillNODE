import { saveActivityResult } from "./localStore";

export async function submitActivityResult(payload) {
  try {
    saveActivityResult(payload);
  } catch {
    // Avoid breaking the gameplay flow on telemetry failures.
  }
}
