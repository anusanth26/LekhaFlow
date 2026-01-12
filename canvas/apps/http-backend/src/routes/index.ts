import type {Router as RouterType} from "express";
import {Router} from "express";
import { authRouter } from "./auth";
import { canvasRouter } from "./canvas";


export const router : RouterType=Router();

router.use("/auth",authRouter);
router.use("/canvas",canvasRouter);