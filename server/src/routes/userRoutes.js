import { Router } from "express";
import { getUser, updateUser, syncProfile } from "../controllers/userCtrl.js";

export const userRoutes = Router();

userRoutes.get("/:userId",          getUser);
userRoutes.patch("/:userId",        updateUser);
userRoutes.post("/:userId/sync",    syncProfile);
