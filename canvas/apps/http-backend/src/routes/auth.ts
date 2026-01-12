import type { Router as RouterType } from "express";
import { Router } from "express";
import { signin, signup } from "../controller/auth.js";

export const authRouter: RouterType = Router();

authRouter.post("/signup", signup);
authRouter.post("/signin", signin);
