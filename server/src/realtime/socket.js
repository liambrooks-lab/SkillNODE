import { verifyToken } from "../auth/jwt.js";

const rooms = new Map();
const codeToRoom = new Map();
const MAX_MESSAGES = 60;

function getRoom(room) {
  if (!rooms.has(room)) {
    const code = createInviteCode();
    rooms.set(room, {
      code,
      members: new Map(),
      messages: [],
    });
    codeToRoom.set(code, room);
  }
  return rooms.get(room);
}

function emitPresence(io, room) {
  const currentRoom = getRoom(room);
  const members = [...currentRoom.members.values()];
  io.to(room).emit("presence", { room, members });
  io.to(room).emit("room_state", {
    room,
    joinCode: currentRoom.code,
    members,
    messages: currentRoom.messages,
  });
}

function leaveCurrentRoom(io, socket) {
  const currentRoomId = socket.data.roomId;
  if (!currentRoomId) return;

  const currentRoom = getRoom(currentRoomId);
  socket.leave(currentRoomId);
  currentRoom.members.delete(socket.id);
  socket.data.roomId = "";
  emitPresence(io, currentRoomId);
}

function joinRoom(io, socket, room) {
  const roomId = normalizeRoom(room);
  if (socket.data.roomId === roomId) {
    emitPresence(io, roomId);
    return;
  }

  leaveCurrentRoom(io, socket);

  const nextRoom = getRoom(roomId);
  socket.join(roomId);
  socket.data.roomId = roomId;
  nextRoom.members.set(socket.id, {
    socketId: socket.id,
    userId: socket.data.userId,
    name: socket.data.profile?.name || "Player",
  });
  emitPresence(io, roomId);
}

function joinRoomByCode(io, socket, code) {
  const inviteCode = normalizeInviteCode(code);
  const roomId = codeToRoom.get(inviteCode);

  if (!roomId) {
    socket.emit("room_error", { message: "Invite code not found. Ask your friend to generate a fresh room code." });
    return;
  }

  joinRoom(io, socket, roomId);
}

function appendMessage(roomId, message) {
  const room = getRoom(roomId);
  room.messages.push(message);
  if (room.messages.length > MAX_MESSAGES) {
    room.messages = room.messages.slice(-MAX_MESSAGES);
  }
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
        name: typeof name === "string" && name.trim() ? name.trim().slice(0, 40) : socket.data.profile?.name || "Player",
      };

      if (socket.data.roomId) {
        const room = getRoom(socket.data.roomId);
        const member = room.members.get(socket.id);
        if (member) {
          room.members.set(socket.id, {
            ...member,
            name: socket.data.profile.name,
          });
          emitPresence(io, socket.data.roomId);
        }
      }
    });

    socket.on("join_room", ({ room }) => {
      joinRoom(io, socket, room);
    });

    socket.on("join_room_by_code", ({ code }) => {
      joinRoomByCode(io, socket, code);
    });

    socket.on("leave_room", ({ room }) => {
      const roomId = normalizeRoom(room);
      if (socket.data.roomId !== roomId) return;
      leaveCurrentRoom(io, socket);
      socket.emit("room_left", { room: roomId });
    });

    socket.on("room_message", ({ text }) => {
      const roomId = socket.data.roomId;
      if (!roomId) {
        socket.emit("room_error", { message: "Join a room before sending chat messages." });
        return;
      }

      const messageText = typeof text === "string" ? text.trim().slice(0, 280) : "";
      if (!messageText) return;

      const message = {
        id: `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        userId: socket.data.userId,
        author: socket.data.profile?.name || "Player",
        text: messageText,
        createdAt: new Date().toISOString(),
      };

      appendMessage(roomId, message);
      io.to(roomId).emit("room_message", message);
    });

    socket.on("disconnect", () => {
      for (const [roomId, room] of rooms.entries()) {
        if (room.members.delete(socket.id)) emitPresence(io, roomId);
      }
    });
  });
}

function normalizeRoom(room) {
  if (typeof room !== "string" || !room.trim()) return "lobby";

  return room
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "lobby";
}

function normalizeInviteCode(code) {
  return typeof code === "string" ? code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) : "";
}

function createInviteCode() {
  let code = "";

  do {
    code = Math.random().toString(36).slice(2, 8).toUpperCase();
  } while (codeToRoom.has(code));

  return code;
}
