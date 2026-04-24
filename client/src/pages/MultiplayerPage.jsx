import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Hash, Send, Users, Wifi, WifiOff, Zap } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { getSessionProfile } from "../lib/localStore";
import { getSocket } from "../lib/socket";

const DEFAULT_ROOM = "lobby";
const ROOM_CODE_PLACEHOLDER = "AB12CD";

const roomPresets = [
  { id: "lobby", label: "Main lobby", copy: "General room for everyone who just wants to hang out and stay visible." },
  { id: "typing-race", label: "Typing race", copy: "Quick way to collect friends who want speed rounds and leaderboards." },
  { id: "code-duel", label: "Code duel", copy: "Room for pair coding sessions, practice battles, and timed code rounds." },
  { id: "study-squad", label: "Study squad", copy: "Shared room for grammar, reading, math, and casual revision sessions." },
];

export function MultiplayerPage() {
  const sessionProfile = getSessionProfile();
  const socket = useMemo(() => getSocket(), []);
  const [roomInput, setRoomInput] = useState(DEFAULT_ROOM);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [me, setMe] = useState(() => sessionProfile?.name || "Player");
  const [joinedRoom, setJoinedRoom] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [connected, setConnected] = useState(socket.connected);
  const [statusNote, setStatusNote] = useState("Realtime lobby is ready. Join a room and share its code.");
  const activeRoomRef = useRef("");
  const chatFeedRef = useRef(null);
  const profileNameRef = useRef(me);
  const roomInputRef = useRef(roomInput);

  useEffect(() => {
    profileNameRef.current = me;
  }, [me]);

  useEffect(() => {
    roomInputRef.current = roomInput;
  }, [roomInput]);

  useEffect(() => {
    function onConnect() {
      setConnected(true);
      setStatusNote("Realtime connected. You can join or rejoin a room now.");
      socket.emit("set_profile", { name: sanitizeName(profileNameRef.current) });
      socket.emit("join_room", { room: activeRoomRef.current || roomInputRef.current || DEFAULT_ROOM });
    }

    function onDisconnect() {
      setConnected(false);
      setStatusNote("Connection lost. Socket.io will keep trying to reconnect.");
    }

    function onPresence(payload) {
      setMembers(payload.members || []);
    }

    function onRoomState(payload) {
      const nextRoom = payload?.room || DEFAULT_ROOM;
      activeRoomRef.current = nextRoom;
      setJoinedRoom(nextRoom);
      setRoomInput(nextRoom);
      setJoinCode(payload?.joinCode || "");
      setMembers(payload?.members || []);
      setMessages(payload?.messages || []);
      setStatusNote(
        payload?.joinCode
          ? `Joined ${humanizeRoom(nextRoom)}. Share code ${payload.joinCode} so others can enter the same lobby.`
          : `Joined ${humanizeRoom(nextRoom)}.`,
      );
    }

    function onRoomMessage(message) {
      setMessages((current) => [...current, message].slice(-60));
    }

    function onRoomLeft() {
      activeRoomRef.current = "";
      setJoinedRoom("");
      setJoinCode("");
      setMembers([]);
      setMessages([]);
      setStatusNote("You left the room. Join another room or enter a share code.");
    }

    function onRoomError(payload) {
      setStatusNote(payload?.message || "Something went wrong while handling the room.");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("presence", onPresence);
    socket.on("room_state", onRoomState);
    socket.on("room_message", onRoomMessage);
    socket.on("room_left", onRoomLeft);
    socket.on("room_error", onRoomError);

    socket.emit("set_profile", { name: sanitizeName(profileNameRef.current) });
    socket.emit("join_room", { room: DEFAULT_ROOM });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("presence", onPresence);
      socket.off("room_state", onRoomState);
      socket.off("room_message", onRoomMessage);
      socket.off("room_left", onRoomLeft);
      socket.off("room_error", onRoomError);

      if (activeRoomRef.current) {
        socket.emit("leave_room", { room: activeRoomRef.current });
      }
    };
  }, [socket]);

  useEffect(() => {
    const container = chatFeedRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages]);

  function joinRoom(nextRoom = roomInput) {
    const targetRoom = nextRoom?.trim() || DEFAULT_ROOM;
    socket.emit("set_profile", { name: sanitizeName(me) });
    socket.emit("join_room", { room: targetRoom });
    setStatusNote(`Joining ${humanizeRoom(targetRoom)}...`);
  }

  function joinByCode() {
    const code = joinCodeInput.trim().toUpperCase();
    if (!code) {
      setStatusNote("Enter a room code first.");
      return;
    }

    socket.emit("set_profile", { name: sanitizeName(me) });
    socket.emit("join_room_by_code", { code });
    setStatusNote(`Checking invite code ${code}...`);
  }

  function leaveRoom() {
    if (!activeRoomRef.current) {
      setStatusNote("You are not inside a room right now.");
      return;
    }

    socket.emit("leave_room", { room: activeRoomRef.current });
  }

  function sendMessage(event) {
    event.preventDefault();
    const text = messageDraft.trim();
    if (!text) return;

    socket.emit("room_message", { text });
    setMessageDraft("");
  }

  async function copyInviteCode() {
    if (!joinCode) {
      setStatusNote("Join a room first so we can generate a share code for it.");
      return;
    }

    try {
      await navigator.clipboard.writeText(joinCode);
      setStatusNote(`Invite code ${joinCode} copied. Share it with anyone who should join this lobby.`);
    } catch {
      setStatusNote(`Clipboard access is blocked here. The room code is ${joinCode}.`);
    }
  }

  return (
    <div className="multiplayer-page flex-col-fill">
      <Card style={{ padding: "18px 22px", flexShrink: 0 }}>
        <div className="multiplayer-hero">
          <div>
            <div className="hero-kicker">Multiplayer &amp; Collaboration</div>
            <div className="display-title" style={{ fontSize: "1.75rem", color: "var(--text)", marginTop: 4 }}>
              Share a room code, join from any device, and keep talking while you play.
            </div>
            <div style={{ marginTop: 8, fontSize: "0.875rem", lineHeight: 1.75, color: "var(--text-muted)" }}>
              Rooms now support reusable invite codes, realtime presence, and built-in chat so players can coordinate on
              mobile, desktop, or anything in between without getting stuck on a clipped screen.
            </div>
          </div>

          <div className="multiplayer-signal-grid">
            <MiniSignal icon={connected ? Wifi : WifiOff} title="Socket" value={connected ? "Connected" : "Reconnecting"} />
            <MiniSignal icon={Users} title="Players here" value={`${members.length}`} />
            <MiniSignal icon={Hash} title="Room code" value={joinCode || "Generate"} />
            <MiniSignal icon={Zap} title="Active lobby" value={joinedRoom || "Not joined"} />
          </div>
        </div>
      </Card>

      <div className="multiplayer-main-grid">
        <Card className="multiplayer-card">
          <div>
            <div className="hero-kicker" style={{ marginBottom: 2 }}>Room Controls</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>
              Create or join a lobby in a couple of taps
            </div>
          </div>

          <div className="multiplayer-presets">
            {roomPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setRoomInput(preset.id);
                  joinRoom(preset.id);
                }}
                style={{
                  borderRadius: 10,
                  padding: "12px 14px",
                  textAlign: "left",
                  cursor: "pointer",
                  background: joinedRoom === preset.id ? "var(--accent-dim)" : "var(--surface-2)",
                  border: `1px solid ${joinedRoom === preset.id ? "var(--border-hover)" : "var(--border-subtle)"}`,
                }}
              >
                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text)" }}>{preset.label}</div>
                <div style={{ marginTop: 4, fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{preset.copy}</div>
              </button>
            ))}
          </div>

          <div className="multiplayer-form-grid">
            <FieldBlock label="Display name">
              <Input value={me} onChange={(event) => setMe(event.target.value)} placeholder="Your handle" />
            </FieldBlock>
            <FieldBlock label="Room name">
              <Input value={roomInput} onChange={(event) => setRoomInput(event.target.value)} placeholder="lobby" />
            </FieldBlock>
          </div>

          <div className="multiplayer-form-grid">
            <FieldBlock label="Join with code">
              <Input
                value={joinCodeInput}
                onChange={(event) => setJoinCodeInput(event.target.value.toUpperCase())}
                placeholder={ROOM_CODE_PLACEHOLDER}
                maxLength={6}
              />
            </FieldBlock>
            <FieldBlock label="Current invite code">
              <div
                style={{
                  height: 40,
                  padding: "0 12px",
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 8,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-subtle)",
                  color: joinCode ? "var(--accent-bright)" : "var(--text-faint)",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                }}
              >
                {joinCode || ROOM_CODE_PLACEHOLDER}
              </div>
            </FieldBlock>
          </div>

          <div className="multiplayer-actions">
            <Button onClick={() => joinRoom()}>Join / create room</Button>
            <Button variant="secondary" onClick={joinByCode}>Join with code</Button>
            <Button variant="secondary" onClick={copyInviteCode} style={{ gap: 6 }}>
              <Copy size={14} /> Copy invite code
            </Button>
            <Button variant="ghost" onClick={leaveRoom}>Leave room</Button>
          </div>

          <div
            style={{
              padding: "12px 14px",
              background: "var(--surface-2)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              fontSize: "0.825rem",
              color: "var(--text-muted)",
              lineHeight: 1.65,
            }}
          >
            {statusNote}
          </div>
        </Card>

        <div className="multiplayer-side-grid">
          <Card className="multiplayer-card" style={{ gap: 14 }}>
            <div className="multiplayer-status-row">
              <div>
                <div className="hero-kicker" style={{ marginBottom: 2 }}>Live Room</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>
                  {joinedRoom ? humanizeRoom(joinedRoom) : "No active room"}
                </div>
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  borderRadius: 10,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <span className="status-dot" style={{ width: 6, height: 6 }} />
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {connected ? "Realtime on" : "Waiting"}
                </span>
              </div>
            </div>

            <div className="multiplayer-meta-grid">
              <MetaCard label="Invite code" value={joinCode || "Pending"} />
              <MetaCard label="People inside" value={String(members.length)} />
              <MetaCard label="Chat messages" value={String(messages.length)} />
            </div>
          </Card>

          <div className="multiplayer-chat-layout">
            <Card className="multiplayer-card multiplayer-chat-panel" style={{ gap: 12 }}>
              <div>
                <div className="hero-kicker" style={{ marginBottom: 2 }}>Room Chat</div>
                <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text)" }}>
                  Players can coordinate without leaving the game
                </div>
              </div>

              <div
                ref={chatFeedRef}
                className="inner-scroll multiplayer-chat-feed"
                style={{
                  padding: 4,
                }}
              >
                {messages.length === 0 ? (
                  <div
                    style={{
                      padding: "32px 16px",
                      textAlign: "center",
                      border: "1px dashed var(--border-subtle)",
                      borderRadius: 10,
                      fontSize: "0.85rem",
                      color: "var(--text-faint)",
                    }}
                  >
                    No messages yet. Say hello once your squad joins.
                  </div>
                ) : (
                  messages.map((message) => {
                    const mine = message.userId === sessionProfile?.id;

                    return (
                      <div
                        key={message.id}
                        style={{
                          alignSelf: mine ? "flex-end" : "stretch",
                          maxWidth: mine ? "85%" : "100%",
                          padding: "10px 12px",
                          borderRadius: 10,
                          background: mine ? "var(--accent-dim)" : "var(--surface-2)",
                          border: `1px solid ${mine ? "var(--border-hover)" : "var(--border-subtle)"}`,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                          <span style={{ fontSize: "0.76rem", fontWeight: 700, color: mine ? "var(--accent-bright)" : "var(--text)" }}>
                            {mine ? "You" : message.author || "Player"}
                          </span>
                          <span style={{ fontSize: "0.72rem", color: "var(--text-faint)" }}>
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                        <div style={{ marginTop: 6, fontSize: "0.85rem", lineHeight: 1.6, color: "var(--text-muted)", wordBreak: "break-word" }}>
                          {message.text}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form className="multiplayer-chat-form" onSubmit={sendMessage}>
                <Input
                  value={messageDraft}
                  onChange={(event) => setMessageDraft(event.target.value)}
                  placeholder="Type a quick message for the room"
                  maxLength={280}
                />
                <Button type="submit" style={{ gap: 6 }}>
                  <Send size={14} /> Send
                </Button>
              </form>
            </Card>

            <Card className="multiplayer-card multiplayer-members-panel" style={{ gap: 12 }}>
              <div>
                <div className="hero-kicker" style={{ marginBottom: 2 }}>Presence</div>
                <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text)" }}>
                  {members.length} currently online
                </div>
              </div>

              <div className="inner-scroll flex-col-fill" style={{ gap: 6, display: "flex", flexDirection: "column" }}>
                {members.length === 0 ? (
                  <div
                    style={{
                      padding: "32px 16px",
                      textAlign: "center",
                      border: "1px dashed var(--border-subtle)",
                      borderRadius: 10,
                      fontSize: "0.85rem",
                      color: "var(--text-faint)",
                    }}
                  >
                    Nobody else is here yet. Share the invite code and wait for the team to join.
                  </div>
                ) : (
                  members.map((member) => (
                    <div
                      key={member.socketId}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                        padding: "10px 12px",
                        background: "var(--surface-2)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: 8,
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: "var(--text)", fontSize: "0.875rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {member.userId === sessionProfile?.id ? `${member.name || "Player"} (You)` : member.name || "Player"}
                        </div>
                        <div style={{ marginTop: 1, fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-faint)" }}>
                          Active participant
                        </div>
                      </div>
                      <div
                        style={{
                          padding: "2px 10px",
                          borderRadius: 6,
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          background: "rgba(34,197,94,0.12)",
                          border: "1px solid rgba(34,197,94,0.25)",
                          color: "#4ade80",
                          flexShrink: 0,
                        }}
                      >
                        {member.socketId.slice(0, 6)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldBlock({ label, children }) {
  return (
    <div>
      <div className="label-sm" style={{ marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  );
}

function MiniSignal({ icon: Icon, title, value }) {
  return (
    <div
      style={{
        padding: "12px 14px",
        background: "var(--surface-2)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: "0.8rem", color: "var(--text-muted)" }}>
        <Icon size={15} style={{ color: "var(--accent)" }} />
        {title}
      </div>
      <div style={{ marginTop: 8, fontSize: "1rem", fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {value}
      </div>
    </div>
  );
}

function MetaCard({ label, value }) {
  return (
    <div
      style={{
        padding: "12px 14px",
        background: "var(--surface-2)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 8,
      }}
    >
      <div className="label-sm" style={{ marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>{value}</div>
    </div>
  );
}

function sanitizeName(name) {
  return typeof name === "string" && name.trim() ? name.trim().slice(0, 40) : "Player";
}

function humanizeRoom(room) {
  return room
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatTime(value) {
  if (!value) return "";

  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "";
  }
}
