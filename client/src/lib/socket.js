import { io } from "socket.io-client";
import { env } from "./env";
import { getToken } from "./auth";

let socket = null;

export function getSocket() {
  const token = getToken();

  if (socket) {
    if (socket.auth?.token === token) return socket;
    socket.disconnect();
    socket = null;
  }

  socket = io(env.apiBaseUrl, {
    transports: ["websocket"],
    auth: {
      token,
    },
  });

  return socket;
}

export function closeSocket() {
  if (!socket) return;
  socket.disconnect();
  socket = null;
}

