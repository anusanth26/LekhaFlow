import { HttpError } from "@repo/http-core";
import type { User } from "@supabase/supabase-js";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { createServiceClient } from "../supabase.server";

declare global {
	namespace Express {
		interface Request {
			user?: User;
		}
	}
}

export const authMiddleware = async (
	req: Request,
	_res: Response,
	next: NextFunction,
) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader) {
			throw new HttpError(
				"Missing Authorization Header",
				StatusCodes.UNAUTHORIZED,
			);
		}

		const token = authHeader.split(" ")[1];

		const {
			data: { user },
			error,
		} = await createServiceClient().auth.getUser(token);

		if (error || !user) {
			throw new HttpError("Invalid or Expired Token", StatusCodes.UNAUTHORIZED);
		}

		req.user = user;
		next();
	} catch (error) {
		next(error);
	}
};
