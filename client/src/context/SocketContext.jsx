import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getSocket, closeSocket } from "../lib/socket";
import { getToken } from "../lib/auth";

const SocketContext = createContext({ socket: null, connected: false });

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const socket = getSocket();
    socketRef.current = socket;

    function onConnect()    { setConnected(true); }
    function onDisconnect() { setConnected(false); }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    setConnected(socket.connected);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
