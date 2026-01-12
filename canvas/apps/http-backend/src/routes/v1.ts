import { Router } from "express";
import type { Router as RouterType } from "express";
import { signup, signin } from "../controller/auth.js";

export const router: RouterType = Router();

router.post("/signup", signup);
router.post("/signin", signin);
