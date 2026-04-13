import { useEffect, useMemo, useState } from "react";
import { Radio, Send, Users, Zap } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { getSessionProfile } from "../lib/localStore";
import { getSocket } from "../lib/socket";

const roomPresets = [
  { id: "lobby", label: "Main lobby", copy: "General social room for casual presence." },
  { id: "typing-race", label: "Typing race", copy: "Good for WPM battles and tournament rooms." },
  { id: "code-duel", label: "Code duel", copy: "Room format for pair challenges and timed contests." },
  { id: "study-squad", label: "Study squad", copy: "Shared practice room for grammar, reading, and math." },
];

export function MultiplayerPage() {
  const socket = useMemo(() => getSocket(), []);
  const [room, setRoom] = useState("lobby");
  const [me, setMe] = useState(() => getSessionProfile()?.name || "");
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

  function joinRoom(nextRoom = room) {
    socket.emit("set_profile", { name: me });
    socket.emit("join_room", { room: nextRoom });
    setRoom(nextRoom);
  }

  return (
    <div className="space-y-6 pb-24">
      <Card className="p-6 md:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="hero-kicker">Multiplayer & Collaboration</div>
            <div className="display-title mt-2 text-4xl md:text-5xl">
              Real-time rooms for practice, play, and competitive energy.
            </div>
            <div className="mt-4 max-w-3xl text-sm leading-7 text-white/63 md:text-base">
              Live presence is already wired in. This page is the hub where typing races, coding
              duels, and study squads can all hang off the same social backbone.
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <MiniSignal icon={Radio} title="Presence" value={`${members.length} live`} />
            <MiniSignal icon={Users} title="Current room" value={room} />
            <MiniSignal icon={Zap} title="Mode" value="Realtime ready" />
            <MiniSignal icon={Send} title="Flow" value="Join / refresh" />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.92fr]">
        <Card className="p-6">
          <div className="hero-kicker">Join A Room</div>
          <div className="mt-2 text-2xl font-semibold">Choose a vibe, then hop in</div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {roomPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`rounded-[24px] border p-4 text-left transition ${
                  room === preset.id
                    ? "border-cyan-200/30 bg-cyan-300/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
                onClick={() => joinRoom(preset.id)}
              >
                <div className="text-base font-semibold">{preset.label}</div>
                <div className="mt-2 text-sm text-white/60">{preset.copy}</div>
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-white/50">
                Display name
              </label>
              <Input value={me} onChange={(e) => setMe(e.target.value)} placeholder="Your handle" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-white/50">
                Custom room
              </label>
              <Input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="lobby" />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={() => joinRoom()}>Join / refresh room</Button>
            <Button variant="secondary" onClick={() => socket.emit("leave_room", { room })}>
              Leave room
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="hero-kicker">Live Presence</div>
          <div className="mt-2 text-2xl font-semibold">{members.length} currently online</div>

          <div className="mt-5 space-y-3">
            {members.map((member) => (
              <div
                key={member.socketId}
                className="flex items-center justify-between rounded-[24px] border border-white/10 bg-white/5 px-4 py-3"
              >
                <div>
                  <div className="font-semibold">{member.name || "Player"}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">Live room member</div>
                </div>
                <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100">
                  {member.socketId.slice(0, 6)}
                </div>
              </div>
            ))}

            {members.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/50">
                No one is in this room yet. Try another preset or wait for your friends to join.
              </div>
            ) : null}
          </div>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-slate-950/28 p-4 text-sm text-white/62">
            Next product step: attach room-specific gameplay events so typing races, code duels,
            and study sessions all ride on the same realtime presence layer.
          </div>
        </Card>
      </div>
    </div>
  );
}

function MiniSignal({ icon: Icon, title, value }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2 text-sm text-white/55">
        <Icon size={16} className="text-cyan-200" />
        {title}
      </div>
      <div className="mt-3 text-xl font-semibold">{value}</div>
    </div>
  );
}
