/**
 * ============================================================================
 * HTTP BACKEND — GLOBAL ERROR HANDLER TESTS
 * ============================================================================
 *
 * Tests for: HttpError handling, generic Error handling,
 * status code mapping, response format.
 */

import { HttpError } from "@repo/http-core";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { globalErrorHandler } from "../error/error";

const createMocks = () => {
	const req = {} as Request;
	const next = vi.fn() as NextFunction;
	const res = {
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis(),
	} as unknown as Response;

	return { req, res, next };
};

describe("globalErrorHandler", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Suppress console.error from the handler
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	it("returns correct status code for HttpError", () => {
		const { req, res, next } = createMocks();
		const error = new HttpError("Not Found", StatusCodes.NOT_FOUND);

		globalErrorHandler(error, req, res, next);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: "Not Found",
		});
	});

	it("returns 400 for BAD_REQUEST HttpError", () => {
		const { req, res, next } = createMocks();
		const error = new HttpError("Bad input", StatusCodes.BAD_REQUEST);

		globalErrorHandler(error, req, res, next);

		expect(res.status).toHaveBeenCalledWith(400);
	});

	it("returns 401 for UNAUTHORIZED HttpError", () => {
		const { req, res, next } = createMocks();
		const error = new HttpError("No auth", StatusCodes.UNAUTHORIZED);

		globalErrorHandler(error, req, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
	});

	it("returns 500 for generic Error (not HttpError)", () => {
		const { req, res, next } = createMocks();
		const error = new Error("Something broke");

		globalErrorHandler(error, req, res, next);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: "Internal Server Error",
		});
	});

	it("does not leak error details for generic errors", () => {
		const { req, res, next } = createMocks();
		const error = new Error("secret database credentials");

		globalErrorHandler(error, req, res, next);

		const responseBody = (res.json as ReturnType<typeof vi.fn>).mock
			.calls[0]?.[0];
		expect(responseBody.message).toBe("Internal Server Error");
		expect(responseBody.message).not.toContain("secret");
	});

	it("returns success: false in all error responses", () => {
		const { req, res, next } = createMocks();

		globalErrorHandler(
			new HttpError("test", StatusCodes.FORBIDDEN),
			req,
			res,
			next,
		);

		const body = (res.json as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
		expect(body.success).toBe(false);
	});

	it("handles HttpError with custom message", () => {
		const { req, res, next } = createMocks();
		const error = new HttpError(
			"Validation Failed: email is required",
			StatusCodes.BAD_REQUEST,
		);

		globalErrorHandler(error, req, res, next);

		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: "Validation Failed: email is required",
		});
	});
});
