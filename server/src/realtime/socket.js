const rooms = new Map();

function getRoom(room) {
  if (!rooms.has(room)) rooms.set(room, new Map());
  return rooms.get(room);
}

function emitPresence(io, room) {
  const map = getRoom(room);
  const members = [...map.values()];
  io.to(room).emit("presence", { room, members });
}

export function attachRealtime(io) {
  io.on("connection", (socket) => {
    socket.data.profile = { name: "" };

    socket.on("set_profile", ({ name }) => {
      socket.data.profile = { name: typeof name === "string" ? name.slice(0, 40) : "" };
    });

    socket.on("join_room", ({ room }) => {
      const r = typeof room === "string" && room.trim() ? room.trim().slice(0, 64) : "lobby";
      socket.join(r);
      getRoom(r).set(socket.id, { socketId: socket.id, name: socket.data.profile?.name || "" });
      emitPresence(io, r);
    });

    socket.on("leave_room", ({ room }) => {
      const r = typeof room === "string" && room.trim() ? room.trim().slice(0, 64) : "lobby";
      socket.leave(r);
      getRoom(r).delete(socket.id);
      emitPresence(io, r);
    });

    socket.on("disconnect", () => {
      for (const [room, map] of rooms.entries()) {
        if (map.delete(socket.id)) emitPresence(io, room);
      }
    });
  });
}

