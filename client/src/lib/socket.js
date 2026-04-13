import { io } from "socket.io-client";
import { env } from "./env";
import { getSessionProfile } from "./localStore";

let socket = null;

export function getSocket() {
  const profile = getSessionProfile();
  const socketIdentity = `${profile?.id || "guest"}:${profile?.name || ""}`;

  if (socket) {
    if (socket.auth?.identity === socketIdentity) return socket;
    socket.disconnect();
    socket = null;
  }

  socket = io(env.apiBaseUrl, {
    transports: ["websocket"],
    auth: {
      identity: socketIdentity,
      token: "",
      sessionId: profile?.id || "",
      name: profile?.name || "",
    },
  });

  return socket;
}

export function closeSocket() {
  if (!socket) return;
  socket.disconnect();
  socket = null;
}

