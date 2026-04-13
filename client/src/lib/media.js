import { env } from "./env";

export function resolveMediaUrl(path) {
  if (!path) return null;
  if (/^(https?:\/\/|data:)/i.test(path)) return path;
  return `${env.apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
