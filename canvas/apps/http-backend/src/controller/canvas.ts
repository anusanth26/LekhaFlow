import { CreateCanvasSchema, UpdateCanvasSchema } from "@repo/common";
import { HttpError, JSONResponse } from "@repo/http-core";
import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
	createCanvasService,
	updateCanvasService,
} from "../services/canvas.js";

export const createCanvas = async (req: Request, res: Response) => {
	console.log("Request Body:", req.body);
	const parsedData = CreateCanvasSchema.safeParse(req.body);

	if (!parsedData.success) {
		throw new HttpError(
			"Validation Failed: " +
				(parsedData.error.issues[0]?.message ?? "Invalid input"),
			StatusCodes.BAD_REQUEST,
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

export const updateCanvas = async (req: Request, res: Response) => {
	const { roomId } = req.params;
	const parsedData = UpdateCanvasSchema.safeParse(req.body);

	if (!parsedData.success) {
		throw new HttpError(
			"Validation Failed: " +
				(parsedData.error.issues[0]?.message ?? "Invalid input"),
			StatusCodes.BAD_REQUEST,
		);
	}

	if (!roomId || typeof roomId !== "string") {
		throw new HttpError("Room ID is required", StatusCodes.BAD_REQUEST);
	}

	const { data } = parsedData.data;

	await updateCanvasService(roomId, data);

	return JSONResponse(res, StatusCodes.OK, "Canvas updated successfully");
};
