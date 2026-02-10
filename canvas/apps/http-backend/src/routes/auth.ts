import type { Router as RouterType } from "express";
import { Router } from "express";
import { getMe, signin, signup, syncUser } from "../controller/auth.js";
import { authMiddleware } from "../middleware/auth.js";

export const authRouter: RouterType = Router();

authRouter.post("/signup", signup);
authRouter.post("/signin", signin);
authRouter.get("/me", authMiddleware, getMe);
authRouter.post("/sync-user", authMiddleware, syncUser);
