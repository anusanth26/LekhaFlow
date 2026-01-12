import type { Router as RouterType } from "express";
import { Router } from "express";
import { createCanvas } from "../controller/canvas";
import { authMiddleware } from "../middleware/auth";
export const canvasRouter: RouterType = Router();

canvasRouter.post("/create-canvas", authMiddleware, createCanvas);
