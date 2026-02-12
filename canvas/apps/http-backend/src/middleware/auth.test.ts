/**
 * ============================================================================
 * HTTP BACKEND — AUTH MIDDLEWARE EDGE-CASE TESTS
 * ============================================================================
 *
 * Tests for: authMiddleware — missing header, malformed header,
 * invalid token, expired token, successful auth.
 */

import type { User } from "@supabase/supabase-js";
import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

vi.mock("../supabase.server", () => ({
	createServiceClient: vi.fn(),
}));

import { authMiddleware } from "../middleware/auth";
import { createServiceClient } from "../supabase.server";

const createServiceClientMock = createServiceClient as Mock;

/** Helper: create mock req/res/next */
const createMocks = (headers: Record<string, string> = {}) => {
	const req = {
		headers,
		user: undefined,
	} as unknown as Request;

	const res = {} as Response;

	const next = vi.fn() as unknown as NextFunction;

	return { req, res, next: next as NextFunction & Mock };
};

describe("authMiddleware", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("calls next with HttpError when Authorization header is missing", async () => {
		const { req, res, next } = createMocks({});

		await authMiddleware(req, res, next);

		expect(next).toHaveBeenCalledTimes(1);
		const error = (next as Mock).mock.calls[0]?.[0];
		expect(error).toBeDefined();
		expect(error.statusCode).toBe(401);
		expect(error.message).toContain("Missing Authorization Header");
	});

	it("calls next with HttpError for empty Authorization header", async () => {
		const { req, res, next } = createMocks({ authorization: "" });

		// empty string is falsy → same as missing
		await authMiddleware(req, res, next);

		expect(next).toHaveBeenCalledTimes(1);
		const error = (next as Mock).mock.calls[0]?.[0];
		expect(error).toBeDefined();
		expect(error.statusCode).toBe(401);
	});

	it("calls next with HttpError when token is invalid", async () => {
		createServiceClientMock.mockReturnValue({
			auth: {
				getUser: vi.fn().mockResolvedValue({
					data: { user: null },
					error: { message: "Invalid token" },
				}),
			},
		});

		const { req, res, next } = createMocks({
			authorization: "Bearer invalid-token",
		});

		await authMiddleware(req, res, next);

		expect(next).toHaveBeenCalledTimes(1);
		const error = (next as Mock).mock.calls[0]?.[0];
		expect(error.statusCode).toBe(401);
		expect(error.message).toContain("Invalid or Expired Token");
	});

	it("calls next with HttpError when getUser returns user=null and no error", async () => {
		createServiceClientMock.mockReturnValue({
			auth: {
				getUser: vi.fn().mockResolvedValue({
					data: { user: null },
					error: null,
				}),
			},
		});

		const { req, res, next } = createMocks({
			authorization: "Bearer some-token",
		});

		await authMiddleware(req, res, next);

		const error = (next as Mock).mock.calls[0]?.[0];
		expect(error.statusCode).toBe(401);
	});

	it("sets req.user and calls next() on valid token", async () => {
		const mockUser: Partial<User> = {
			id: "user-999",
			email: "valid@example.com",
		};

		createServiceClientMock.mockReturnValue({
			auth: {
				getUser: vi.fn().mockResolvedValue({
					data: { user: mockUser },
					error: null,
				}),
			},
		});

		const { req, res, next } = createMocks({
			authorization: "Bearer valid-jwt",
		});

		await authMiddleware(req, res, next);

		// next was called with no arguments (success)
		expect(next).toHaveBeenCalledTimes(1);
		expect((next as Mock).mock.calls[0]?.[0]).toBeUndefined();

		// req.user was set
		expect(req.user).toBeDefined();
		expect(req.user?.id).toBe("user-999");
	});

	it("extracts only the token after 'Bearer ' (ignores scheme)", async () => {
		const getUserMock = vi.fn().mockResolvedValue({
			data: { user: { id: "u1" } },
			error: null,
		});

		createServiceClientMock.mockReturnValue({
			auth: { getUser: getUserMock },
		});

		const { req, res, next } = createMocks({
			authorization: "Bearer my-actual-token",
		});

		await authMiddleware(req, res, next);

		// getUser should be called with just the token, not "Bearer ..."
		expect(getUserMock).toHaveBeenCalledWith("my-actual-token");
	});

	it("handles malformed 'Bearer' without token gracefully", async () => {
		createServiceClientMock.mockReturnValue({
			auth: {
				getUser: vi.fn().mockResolvedValue({
					data: { user: null },
					error: { message: "No token" },
				}),
			},
		});

		const { req, res, next } = createMocks({
			authorization: "Bearer",
		});

		await authMiddleware(req, res, next);

		// Should still call getUser (with undefined), then fail
		expect(next).toHaveBeenCalledTimes(1);
		const error = (next as Mock).mock.calls[0]?.[0];
		expect(error.statusCode).toBe(401);
	});

	it("handles getUser throwing an exception", async () => {
		createServiceClientMock.mockReturnValue({
			auth: {
				getUser: vi.fn().mockRejectedValue(new Error("Network error")),
			},
		});

		const { req, res, next } = createMocks({
			authorization: "Bearer some-token",
		});

		await authMiddleware(req, res, next);

		// Should call next with the error (caught by try/catch)
		expect(next).toHaveBeenCalledTimes(1);
		const error = (next as Mock).mock.calls[0]?.[0];
		expect(error).toBeInstanceOf(Error);
	});
});
