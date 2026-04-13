import axios from "axios";
import { env } from "./env";
import { getSessionProfile } from "./localStore";

export const api = axios.create({
  baseURL: env.apiBaseUrl,
});

api.interceptors.request.use((config) => {
  const profile = getSessionProfile();
  if (profile?.id) config.headers["x-skillnode-session"] = profile.id;
  return config;
});

