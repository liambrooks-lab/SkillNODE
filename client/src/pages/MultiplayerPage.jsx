import { useEffect, useMemo, useState } from "react";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { getSocket } from "../lib/socket";

export function MultiplayerPage() {
  const socket = useMemo(() => getSocket(), []);
  const [room, setRoom] = useState("lobby");
  const [me, setMe] = useState("");
  const [members, setMembers] = useState([]);

  useEffect(() => {
    function onPresence(payload) {
      setMembers(payload.members || []);
    }

    socket.on("presence", onPresence);
    socket.emit("join_room", { room });

    return () => {
      socket.off("presence", onPresence);
      socket.emit("leave_room", { room });
    };
  }, [room, socket]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-6">
        <div className="text-lg font-semibold">Multiplayer lobby</div>
        <div className="mt-2 text-sm text-white/70">
          Rooms + presence are live. Next we’ll add realtime typing races and challenge duels.
        </div>

        <div className="mt-5 grid gap-3">
          <div>
            <label className="block text-xs font-medium text-white/70">Display name (optional)</label>
            <Input value={me} onChange={(e) => setMe(e.target.value)} placeholder="Your handle" />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/70">Room</label>
            <Input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="lobby" />
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              socket.emit("set_profile", { name: me });
              socket.emit("join_room", { room });
            }}
          >
            Join / Refresh
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="text-sm text-white/60">Presence</div>
        <div className="mt-1 text-lg font-semibold">{members.length} online</div>
        <div className="mt-4 space-y-2">
          {members.map((m) => (
            <div
              key={m.socketId}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <div className="text-sm font-medium">{m.name || "Player"}</div>
              <div className="text-xs text-white/50">{m.socketId.slice(0, 6)}</div>
            </div>
          ))}
          {members.length === 0 ? (
            <div className="text-sm text-white/50">No one here yet.</div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

