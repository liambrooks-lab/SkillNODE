import { Router } from "express";
import { localLogin, logout, getMe } from "../controllers/authCtrl.js";

export const authRoutes = Router();

authRoutes.post("/local", localLogin);
authRoutes.post("/logout", logout);
authRoutes.get("/me", getMe);
