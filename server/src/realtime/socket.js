import { verifyToken } from "../auth/jwt.js";

const rooms = new Map();

function getRoom(room) {
  if (!rooms.has(room)) rooms.set(room, new Map());
  return rooms.get(room);
}

function emitPresence(io, room) {
  const members = [...getRoom(room).values()];
  io.to(room).emit("presence", { room, members });
}

export function attachRealtime(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    const providedName =
      typeof socket.handshake.auth?.name === "string" ? socket.handshake.auth.name.trim().slice(0, 40) : "";
    const sessionId =
      typeof socket.handshake.auth?.sessionId === "string" ? socket.handshake.auth.sessionId.trim().slice(0, 80) : "";

    if (token) {
      try {
        const decoded = verifyToken(token);
        socket.data.userId = decoded.sub;
        socket.data.profile = {
          name: typeof decoded.name === "string" ? decoded.name.slice(0, 40) : providedName,
        };
        return next();
      } catch {
        // Fall through to anonymous mode so realtime still works without auth tokens.
      }
    }

    socket.data.userId = sessionId || `guest_${Math.random().toString(36).slice(2, 10)}`;
    socket.data.profile = {
      name: providedName,
    };
    return next();
  });

  io.on("connection", (socket) => {
    socket.on("set_profile", ({ name }) => {
      socket.data.profile = {
        name: typeof name === "string" && name.trim() ? name.trim().slice(0, 40) : socket.data.profile?.name || "",
      };
    });

    socket.on("join_room", ({ room }) => {
      const roomId = normalizeRoom(room);
      socket.join(roomId);
      getRoom(roomId).set(socket.id, {
        socketId: socket.id,
        userId: socket.data.userId,
        name: socket.data.profile?.name || "",
      });
      emitPresence(io, roomId);
    });

    socket.on("leave_room", ({ room }) => {
      const roomId = normalizeRoom(room);
      socket.leave(roomId);
      getRoom(roomId).delete(socket.id);
      emitPresence(io, roomId);
    });

    socket.on("disconnect", () => {
      for (const [roomId, map] of rooms.entries()) {
        if (map.delete(socket.id)) emitPresence(io, roomId);
      }
    });
  });
}

function normalizeRoom(room) {
  return typeof room === "string" && room.trim() ? room.trim().slice(0, 64) : "lobby";
}
