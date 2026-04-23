import { getSocket } from "../lib/socket";

export function emitJoinRoom(roomCode, displayName) {
  getSocket().emit("room:join", { roomCode, displayName });
}

export function emitLeaveRoom(roomCode) {
  getSocket().emit("room:leave", { roomCode });
}

export function emitTypingResult(payload) {
  getSocket().emit("game:typing_result", payload);
}

export function emitGameStart(roomCode) {
  getSocket().emit("game:start", { roomCode });
}

export function onRoomUpdate(cb) {
  getSocket().on("room:update", cb);
  return () => getSocket().off("room:update", cb);
}

export function onGameEvent(cb) {
  getSocket().on("game:event", cb);
  return () => getSocket().off("game:event", cb);
}
