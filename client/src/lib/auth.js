import { clearSessionProfile, getSessionProfile, hasActiveSession } from "./localStore";

const TOKEN_KEY = "skillnode_token";

export function getToken() {
  return getSessionProfile()?.id || localStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  clearSessionProfile();
}

export function hasSession() {
  return hasActiveSession();
}

