import type { Router as RouterType } from "express";
import { Router } from "express";
import { signin, signup } from "../controller/auth.js";

export const router: RouterType = Router();

router.post("/signup", signup);
router.post("/signin", signin);
