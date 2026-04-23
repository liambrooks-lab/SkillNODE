/** In-memory room store for the current server process */
const rooms = new Map();

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function cleanRoom(room) {
  return {
    code: room.code,
    name: room.name,
    host: room.host,
    playerCount: room.players.size,
    maxPlayers: room.maxPlayers,
    status: room.status,
    createdAt: room.createdAt,
  };
}

/** POST /api/game/rooms */
export async function createRoom(req, res) {
  try {
    const { name, maxPlayers = 10, hostName } = req.body;
    const code = generateRoomCode();
    rooms.set(code, {
      code,
      name: (name ?? `Room ${code}`).trim(),
      host: hostName ?? "Anonymous",
      players: new Map(),
      maxPlayers: Math.min(Number(maxPlayers) || 10, 50),
      status: "waiting",
      createdAt: Date.now(),
    });
    return res.status(201).json(cleanRoom(rooms.get(code)));
  } catch (err) {
    console.error("[gameCtrl.createRoom]", err);
    return res.status(500).json({ error: "Failed to create room." });
  }
}

/** GET /api/game/rooms */
export async function listRooms(req, res) {
  const list = [...rooms.values()]
    .filter(r => r.status === "waiting")
    .map(cleanRoom)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 20);
  return res.json(list);
}

/** GET /api/game/rooms/:code */
export async function getRoom(req, res) {
  const room = rooms.get(req.params.code?.toUpperCase());
  if (!room) return res.status(404).json({ error: "Room not found." });
  return res.json(cleanRoom(room));
}

/** POST /api/game/rooms/:code/join */
export async function joinRoom(req, res) {
  try {
    const room = rooms.get(req.params.code?.toUpperCase());
    if (!room) return res.status(404).json({ error: "Room not found." });
    if (room.players.size >= room.maxPlayers) return res.status(409).json({ error: "Room is full." });
    const playerId = req.body.playerId ?? `p_${Date.now()}`;
    room.players.set(playerId, { id: playerId, name: req.body.displayName ?? "Player", joinedAt: Date.now() });
    return res.json({ ok: true, ...cleanRoom(room) });
  } catch (err) {
    console.error("[gameCtrl.joinRoom]", err);
    return res.status(500).json({ error: "Failed to join room." });
  }
}

/** POST /api/game/rooms/:code/leave */
export async function leaveRoom(req, res) {
  const room = rooms.get(req.params.code?.toUpperCase());
  if (room && req.body.playerId) room.players.delete(req.body.playerId);
  return res.json({ ok: true });
}
