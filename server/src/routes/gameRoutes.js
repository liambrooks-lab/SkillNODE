import { Router } from "express";
import { createRoom, listRooms, getRoom, joinRoom, leaveRoom } from "../controllers/gameCtrl.js";

export const gameRoutes = Router();

gameRoutes.get("/rooms",            listRooms);
gameRoutes.post("/rooms",           createRoom);
gameRoutes.get("/rooms/:code",      getRoom);
gameRoutes.post("/rooms/:code/join",  joinRoom);
gameRoutes.post("/rooms/:code/leave", leaveRoom);
