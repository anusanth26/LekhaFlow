import { SigninSchema, SignupSchema } from "@repo/common";
import { env } from "@repo/config";
import { HttpError, JSONCookieResponse, JSONResponse } from "@repo/http-core";
import { supabase } from "@repo/supabase";
import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export const signup = async (req: Request, res: Response) => {
	const parsedData = SignupSchema.safeParse(req.body);
	if (!parsedData.success) {
		throw new HttpError(
			"Validation Failed: " +
				(parsedData.error.issues[0]?.message ?? "Invalid input"),
			StatusCodes.BAD_REQUEST,
		);
	}

	const { email, password, name } = parsedData.data;
	const { data, error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			data: { name },
		},
	});

	if (error) {
		throw new HttpError(error.message, StatusCodes.BAD_REQUEST);
	}

	return JSONResponse(
		res,
		StatusCodes.CREATED,
		"User created successfully. Check email for verification.",
		{
			user: data.user,
		},
	);
};

export const signin = async (req: Request, res: Response) => {
	const parsedData = SigninSchema.safeParse(req.body);
	if (!parsedData.success) {
		throw new HttpError(
			"Validation Failed: " +
				(parsedData.error.issues[0]?.message ?? "Invalid input"),
			StatusCodes.BAD_REQUEST,
		);
	}

	const { email, password } = parsedData.data;

	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) {
		throw new HttpError("Invalid credentials", StatusCodes.UNAUTHORIZED);
	}
	return JSONCookieResponse(
		res,
		StatusCodes.OK,
		"Signed in successfully",
		"access_token",
		data.session.access_token,
		{
			httpOnly: true,
			secure: env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		},
		{
			user: data.user,
			token: data.session.access_token,
		},
	);
};
