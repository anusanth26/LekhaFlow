import type { CookieOptions, Response } from "express";
import type { StatusCodes } from "http-status-codes";

export type JSONResponseType<T> = {
	code: StatusCodes;
	message: string;
	data?: T;
};

export function JSONResponse<T>(
	res: Response,
	code: StatusCodes,
	message: string,
	data?: T,
) {
	const jsonResponse: JSONResponseType<T> = {
		code,
		message,
		data,
	};
	return res.status(code).json(jsonResponse);
}

export function JSONCookieResponse<T>(
	res: Response,
	code: StatusCodes,
	message: string,
	cookieName: string,
	cookieValue: string,
	cookieOptions: CookieOptions,
	data?: T,
) {
	res.cookie(cookieName, cookieValue, cookieOptions);

	const jsonResponse: JSONResponseType<T> = {
		code,
		message,
		data,
	};

	return res.status(code).json(jsonResponse);
}
