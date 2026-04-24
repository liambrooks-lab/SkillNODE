import { useEffect, useMemo, useState } from "react";
import { Radio, Send, Users, Zap } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { getSessionProfile } from "../lib/localStore";
import { getSocket } from "../lib/socket";

const roomPresets = [
  { id: "lobby",       label: "Main lobby",   copy: "General social room for casual presence." },
  { id: "typing-race", label: "Typing race",  copy: "Good for WPM battles and tournament rooms." },
  { id: "code-duel",   label: "Code duel",    copy: "Room format for pair challenges and timed contests." },
  { id: "study-squad", label: "Study squad",  copy: "Shared practice room for grammar, reading, and math." },
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
    <div className="flex-col-fill" style={{ gap: 12 }}>

      {/* ── Header card ── */}
      <Card style={{ padding: "18px 22px", flexShrink: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 24, alignItems: "start" }}>
          <div>
            <div className="hero-kicker">Multiplayer &amp; Collaboration</div>
            <div className="display-title" style={{ fontSize: "1.75rem", color: "var(--text)", marginTop: 4 }}>
              Real-time rooms for practice, play, and competitive energy.
            </div>
            <div style={{ marginTop: 8, fontSize: "0.875rem", lineHeight: 1.75, color: "var(--text-muted)" }}>
              Live presence is already wired in. This page is the hub where typing races, coding
              duels, and study squads can all hang off the same social backbone.
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <MiniSignal icon={Radio} title="Presence"     value={`${members.length} live`} />
            <MiniSignal icon={Users} title="Current room" value={room} />
            <MiniSignal icon={Zap}   title="Mode"         value="Realtime ready" />
            <MiniSignal icon={Send}  title="Flow"         value="Join / refresh" />
          </div>
        </div>
      </Card>

      {/* ── Main grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 0.92fr", gap: 10, flex: 1, minHeight: 0 }}>

        {/* Left: Join A Room */}
        <Card style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16, minHeight: 0 }}>
          <div>
            <div className="hero-kicker" style={{ marginBottom: 2 }}>Join A Room</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>
              Choose a vibe, then hop in
            </div>
          </div>

          {/* Preset buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {roomPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => joinRoom(preset.id)}
                style={{
                  borderRadius: 10, padding: "12px 14px", textAlign: "left", cursor: "pointer",
                  background: room === preset.id ? "var(--accent-dim)" : "var(--surface-2)",
                  border: `1px solid ${room === preset.id ? "var(--border-hover)" : "var(--border-subtle)"}`,
                  transition: "all 0.14s",
                }}
              >
                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text)" }}>{preset.label}</div>
                <div style={{ marginTop: 4, fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{preset.copy}</div>
              </button>
            ))}
          </div>

          {/* Display name + custom room */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div className="label-sm" style={{ marginBottom: 5 }}>Display name</div>
              <Input value={me} onChange={(e) => setMe(e.target.value)} placeholder="Your handle" />
            </div>
            <div>
              <div className="label-sm" style={{ marginBottom: 5 }}>Custom room</div>
              <Input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="lobby" />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Button onClick={() => joinRoom()}>Join / refresh room</Button>
            <Button variant="secondary" onClick={() => socket.emit("leave_room", { room })}>Leave room</Button>
          </div>

          {/* Info note */}
          <div style={{
            padding: "12px 14px",
            background: "var(--surface-2)", border: "1px solid var(--border-subtle)",
            borderRadius: 8, fontSize: "0.825rem", color: "var(--text-muted)", lineHeight: 1.65,
          }}>
            Next product step: attach room-specific gameplay events so typing races, code duels,
            and study sessions all ride on the same realtime presence layer.
          </div>
        </Card>

        {/* Right: Live Presence */}
        <Card style={{ padding: 22, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ marginBottom: 12, flexShrink: 0 }}>
            <div className="hero-kicker" style={{ marginBottom: 2 }}>Live Presence</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>
              {members.length} currently online
            </div>
          </div>

          <div className="inner-scroll flex-col-fill" style={{ gap: 6, display: "flex", flexDirection: "column" }}>
            {members.map((member) => (
              <div
                key={member.socketId}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 14px",
                  background: "var(--surface-2)", border: "1px solid var(--border-subtle)",
                  borderRadius: 8,
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: "var(--text)", fontSize: "0.875rem" }}>
                    {member.name || "Player"}
                  </div>
                  <div style={{ marginTop: 1, fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-faint)" }}>
                    Live room member
                  </div>
                </div>
                <div style={{
                  padding: "2px 10px", borderRadius: 6, fontSize: "0.72rem", fontWeight: 700,
                  background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ade80",
                }}>
                  {member.socketId.slice(0, 6)}
                </div>
              </div>
            ))}

            {members.length === 0 ? (
              <div style={{
                padding: "32px 16px", textAlign: "center",
                border: "1px dashed var(--border-subtle)", borderRadius: 10,
                fontSize: "0.85rem", color: "var(--text-faint)",
              }}>
                No one is in this room yet. Try another preset or wait for your friends to join.
              </div>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}

function MiniSignal({ icon: Icon, title, value }) {
  return (
    <div style={{
      padding: "12px 14px",
      background: "var(--surface-2)", border: "1px solid var(--border-subtle)",
      borderRadius: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: "0.8rem", color: "var(--text-muted)" }}>
        <Icon size={15} style={{ color: "var(--accent)" }} />
        {title}
      </div>
      <div style={{ marginTop: 8, fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>{value}</div>
    </div>
  );
}
