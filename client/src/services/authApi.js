import { api } from "../lib/api";
import { createSessionProfile, updateSessionProfile } from "../lib/localStore";
import { setToken } from "../lib/auth";

/**
 * Local-first "login" — stores profile data and optional JWT from backend.
 */
export async function loginLocal(input) {
  const profile = await createSessionProfile(input);

  // Attempt to sync with backend (optional — fails gracefully)
  try {
    const { data } = await api.post("/api/auth/local", {
      name: profile.name,
      email: profile.email,
      region: profile.region,
    });
    if (data?.token) setToken(data.token);
  } catch {
    // Backend unavailable — local session still works
  }

  return profile;
}

export async function updateProfile(input) {
  return updateSessionProfile(input);
}

export async function logoutApi() {
  try {
    await api.post("/api/auth/logout");
  } catch {
    // Ignore
  }
}
