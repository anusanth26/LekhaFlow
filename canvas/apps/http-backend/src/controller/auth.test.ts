/**
 * ============================================================================
 * HTTP BACKEND — AUTH ROUTES EDGE-CASE TESTS
 * ============================================================================
 *
 * Tests for: /api/v1/auth/signup, /signin, /me, /sync-user
 * via supertest with mocked Supabase.
 */

import type { User } from "@supabase/supabase-js";
import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

// Mock supabase before importing modules that use it
vi.mock("../supabase.server", () => ({
	createServiceClient: vi.fn(),
}));

// Mock @repo/config/server for the cookie secure flag
vi.mock("@repo/config/server", () => ({
	serverEnv: { NODE_ENV: "test" },
}));

import { globalErrorHandler } from "../error/error";
import { authRouter } from "../routes/auth";
import { createServiceClient } from "../supabase.server";

const createServiceClientMock = createServiceClient as Mock;

const createTestApp = () => {
	const app = express();
	app.use(express.json());
	app.use("/api/v1/auth", authRouter);
	app.use(globalErrorHandler);
	return app;
};

// ============================================================================
// SIGNUP
// ============================================================================

describe("POST /api/v1/auth/signup", () => {
	let app: express.Express;

	beforeEach(() => {
		vi.clearAllMocks();
		app = createTestApp();
	});

	it("returns 400 if email is missing", async () => {
		const res = await request(app)
			.post("/api/v1/auth/signup")
			.send({ password: "password123", name: "User" });

		expect(res.status).toBe(400);
		expect(res.body.success).toBe(false);
	});

	it("returns 400 if email is invalid", async () => {
		const res = await request(app)
			.post("/api/v1/auth/signup")
			.send({ email: "not-an-email", password: "password123", name: "User" });

		expect(res.status).toBe(400);
	});

	it("returns 400 if password is too short (< 6)", async () => {
		const res = await request(app)
			.post("/api/v1/auth/signup")
			.send({ email: "a@b.com", password: "123", name: "User" });

		expect(res.status).toBe(400);
	});

	it("returns 400 if name is empty", async () => {
		const res = await request(app)
			.post("/api/v1/auth/signup")
			.send({ email: "a@b.com", password: "password123", name: "" });

		expect(res.status).toBe(400);
	});

	it("returns 400 if body is empty", async () => {
		const res = await request(app).post("/api/v1/auth/signup").send({});

		expect(res.status).toBe(400);
	});

	it("returns 201 on successful signup", async () => {
		const mockUser = { id: "u1", email: "test@example.com" };

		createServiceClientMock.mockReturnValue({
			auth: {
				signUp: vi.fn().mockResolvedValue({
					data: { user: mockUser },
					error: null,
				}),
			},
		});

		const res = await request(app).post("/api/v1/auth/signup").send({
			email: "test@example.com",
			password: "password123",
			name: "Test",
		});

		expect(res.status).toBe(201);
		expect(res.body.data.user.id).toBe("u1");
	});

	it("returns 400 when supabase returns an error", async () => {
		createServiceClientMock.mockReturnValue({
			auth: {
				signUp: vi.fn().mockResolvedValue({
					data: { user: null },
					error: { message: "User already exists" },
				}),
			},
		});

		const res = await request(app)
			.post("/api/v1/auth/signup")
			.send({ email: "dup@example.com", password: "password123", name: "Dup" });

		expect(res.status).toBe(400);
		expect(res.body.message).toContain("User already exists");
	});
});

// ============================================================================
// SIGNIN
// ============================================================================

describe("POST /api/v1/auth/signin", () => {
	let app: express.Express;

	beforeEach(() => {
		vi.clearAllMocks();
		app = createTestApp();
	});

	it("returns 400 if email is missing", async () => {
		const res = await request(app)
			.post("/api/v1/auth/signin")
			.send({ password: "password123" });

		expect(res.status).toBe(400);
	});

	it("returns 400 if password is too short", async () => {
		const res = await request(app)
			.post("/api/v1/auth/signin")
			.send({ email: "a@b.com", password: "12" });

		expect(res.status).toBe(400);
	});

	it("returns 400 if body is completely empty", async () => {
		const res = await request(app).post("/api/v1/auth/signin").send({});
		expect(res.status).toBe(400);
	});

	it("returns 200 with token on valid credentials", async () => {
		const mockUser = { id: "u1", email: "test@example.com" };
		const mockSession = { access_token: "jwt-token-abc" };

		createServiceClientMock.mockReturnValue({
			auth: {
				signInWithPassword: vi.fn().mockResolvedValue({
					data: { user: mockUser, session: mockSession },
					error: null,
				}),
			},
		});

		const res = await request(app)
			.post("/api/v1/auth/signin")
			.send({ email: "test@example.com", password: "password123" });

		expect(res.status).toBe(200);
		expect(res.body.data.token).toBe("jwt-token-abc");
	});

	it("returns 401 on invalid credentials", async () => {
		createServiceClientMock.mockReturnValue({
			auth: {
				signInWithPassword: vi.fn().mockResolvedValue({
					data: { user: null, session: null },
					error: { message: "Invalid credentials" },
				}),
			},
		});

		const res = await request(app)
			.post("/api/v1/auth/signin")
			.send({ email: "wrong@example.com", password: "wrongpass" });

		expect(res.status).toBe(401);
		expect(res.body.message).toContain("Invalid credentials");
	});
});

// ============================================================================
// GET /me
// ============================================================================

describe("GET /api/v1/auth/me", () => {
	let app: express.Express;

	beforeEach(() => {
		vi.clearAllMocks();
		app = createTestApp();
	});

	it("returns 401 without Authorization header", async () => {
		const res = await request(app).get("/api/v1/auth/me");
		expect(res.status).toBe(401);
	});

	it("returns 401 with invalid token", async () => {
		createServiceClientMock.mockReturnValue({
			auth: {
				getUser: vi.fn().mockResolvedValue({
					data: { user: null },
					error: { message: "Invalid token" },
				}),
			},
		});

		const res = await request(app)
			.get("/api/v1/auth/me")
			.set("Authorization", "Bearer bad-token");

		expect(res.status).toBe(401);
	});

	it("returns user profile when DB has the user", async () => {
		const mockUser: Partial<User> = {
			id: "user-123",
			email: "test@example.com",
			user_metadata: { name: "Test User" },
		};

		const maybeSingleMock = vi.fn().mockResolvedValue({
			data: {
				id: "user-123",
				email: "test@example.com",
				name: "Test User",
				avatar_url: null,
			},
			error: null,
		});

		const eqMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
		const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
		const fromMock = vi.fn().mockReturnValue({ select: selectMock });

		createServiceClientMock.mockReturnValue({
			auth: {
				getUser: vi.fn().mockResolvedValue({
					data: { user: mockUser },
					error: null,
				}),
			},
			from: fromMock,
		});

		const res = await request(app)
			.get("/api/v1/auth/me")
			.set("Authorization", "Bearer valid-token");

		expect(res.status).toBe(200);
		expect(res.body.data.user.id).toBe("user-123");
	});

	it("returns fallback user data when DB has no entry", async () => {
		const mockUser: Partial<User> = {
			id: "user-456",
			email: "new@example.com",
			user_metadata: { name: "New User", avatar_url: "https://img.com/a.png" },
		};

		const maybeSingleMock = vi.fn().mockResolvedValue({
			data: null,
			error: null,
		});

		const eqMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
		const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
		const fromMock = vi.fn().mockReturnValue({ select: selectMock });

		createServiceClientMock.mockReturnValue({
			auth: {
				getUser: vi.fn().mockResolvedValue({
					data: { user: mockUser },
					error: null,
				}),
			},
			from: fromMock,
		});

		const res = await request(app)
			.get("/api/v1/auth/me")
			.set("Authorization", "Bearer valid-token");

		expect(res.status).toBe(200);
		expect(res.body.data.user.id).toBe("user-456");
		expect(res.body.data.user.name).toBe("New User");
	});
});

// ============================================================================
// POST /sync-user
// ============================================================================

describe("POST /api/v1/auth/sync-user", () => {
	let app: express.Express;

	beforeEach(() => {
		vi.clearAllMocks();
		app = createTestApp();
	});

	it("returns 401 without auth header", async () => {
		const res = await request(app).post("/api/v1/auth/sync-user");
		expect(res.status).toBe(401);
	});

	it("returns 200 and upserted user on success", async () => {
		const mockUser: Partial<User> = {
			id: "user-sync",
			email: "sync@example.com",
			user_metadata: { name: "Sync User" },
		};

		const singleMock = vi.fn().mockResolvedValue({
			data: {
				id: "user-sync",
				email: "sync@example.com",
				name: "Sync User",
				avatar_url: null,
				updated_at: new Date().toISOString(),
			},
			error: null,
		});

		const selectMock = vi.fn().mockReturnValue({ single: singleMock });
		const upsertMock = vi.fn().mockReturnValue({ select: selectMock });
		const fromMock = vi.fn().mockReturnValue({ upsert: upsertMock });

		createServiceClientMock.mockReturnValue({
			auth: {
				getUser: vi.fn().mockResolvedValue({
					data: { user: mockUser },
					error: null,
				}),
			},
			from: fromMock,
		});

		const res = await request(app)
			.post("/api/v1/auth/sync-user")
			.set("Authorization", "Bearer valid-token");

		expect(res.status).toBe(200);
		expect(res.body.data.user.id).toBe("user-sync");
	});
});
