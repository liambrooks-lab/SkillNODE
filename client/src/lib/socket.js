import { io } from "socket.io-client";
import { env } from "./env";
import { getToken } from "./auth";

let socket = null;

export function getSocket() {
  if (socket) return socket;
  socket = io(env.apiBaseUrl, {
    transports: ["websocket"],
    auth: {
      token: getToken(),
    },
  });
  return socket;
}

