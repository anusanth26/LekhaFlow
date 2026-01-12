import { Request, Response } from "express";
import { JSONResponse, HttpError } from "@repo/http-core";
import { CreateCanvasSchema } from "@repo/common";
import { StatusCodes } from "http-status-codes";
import { createCanvasService } from "../services/canvas.js";

export const createCanvas = async (req: Request, res: Response) => {
  const parsedData = CreateCanvasSchema.safeParse(req.body);

  if (!parsedData.success) {
    throw new HttpError(
      "Validation Failed: " +
        (parsedData.error.issues[0]?.message ?? "Invalid input"),
      StatusCodes.BAD_REQUEST
    );
  }

  const { name, isPublic } = parsedData.data;
  if (!req.user) {
    throw new HttpError("Unauthorized", StatusCodes.UNAUTHORIZED);
  }
  const userId = req.user.id;

  const newCanvas = await createCanvasService({
    name,
    isPublic,
    userId,
  });

  return JSONResponse(res, StatusCodes.CREATED, "Canvas created successfully", {
    roomId: newCanvas.id,
    slug: newCanvas.slug,
  });
};
