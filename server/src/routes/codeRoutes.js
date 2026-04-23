import { Router } from "express";
import { runCode } from "../controllers/compilerCtrl.js";

export const codeRoutes = Router();

codeRoutes.post("/run", runCode);
