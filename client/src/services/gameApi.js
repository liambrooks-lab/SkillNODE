import { api } from "../lib/api";

export async function createRoom(payload) {
  const { data } = await api.post("/api/game/rooms", payload);
  return data;
}

export async function joinRoom(roomCode) {
  const { data } = await api.post(`/api/game/rooms/${roomCode}/join`);
  return data;
}

export async function leaveRoom(roomCode) {
  const { data } = await api.post(`/api/game/rooms/${roomCode}/leave`);
  return data;
}

export async function getRoomInfo(roomCode) {
  const { data } = await api.get(`/api/game/rooms/${roomCode}`);
  return data;
}

export async function listRooms() {
  const { data } = await api.get("/api/game/rooms");
  return data;
}
