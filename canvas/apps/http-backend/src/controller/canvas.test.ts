import type { User } from "@supabase/supabase-js";
import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

vi.mock("../supabase.server", () => ({
	createServiceClient: vi.fn(),
}));

import { globalErrorHandler } from "../error/error";
import { canvasRouter } from "../routes/canvas";
import { createServiceClient } from "../supabase.server";

const createServiceClientMock = createServiceClient as Mock;

const createTestApp = () => {
	const app = express();
	app.use(express.json());
	app.use("/api/v1/canvas", canvasRouter);
	app.use(globalErrorHandler);
	return app;
};

describe("POST /api/v1/canvas/create-canvas", () => {
	let app: express.Express;

	beforeEach(() => {
		vi.clearAllMocks();
		app = createTestApp();
	});

	describe("Case 1: Unauthorized access", () => {
		it("should return 401 when no Authorization header is provided", async () => {
			const response = await request(app)
				.post("/api/v1/canvas/create-canvas")
				.send({ name: "Test Canvas", isPublic: false });

			expect(response.status).toBe(401);
			expect(createServiceClientMock).not.toHaveBeenCalled();
		});

		it("should return 401 when token is invalid", async () => {
			const getUserMock = vi.fn().mockResolvedValue({
				data: { user: null },
				error: new Error("Invalid token"),
			});

			createServiceClientMock.mockReturnValue({
				auth: { getUser: getUserMock },
			});

			const response = await request(app)
				.post("/api/v1/canvas/create-canvas")
				.set("Authorization", "Bearer invalid_token")
				.send({ name: "Test Canvas", isPublic: false });

			expect(response.status).toBe(401);
		});
	});

	describe("Case 2: Successful canvas creation", () => {
		it("should create canvas and return 201 with valid token", async () => {
			const mockUser: Partial<User> = {
				id: "user_123",
				email: "test@example.com",
			};

			const getUserMock = vi.fn().mockResolvedValue({
				data: { user: mockUser },
				error: null,
			});

			const mockCanvas = {
				id: "canvas_abc",
				name: "My Canvas",
				slug: "my-canvas-123456",
				owner_id: "user_123",
				is_public: false,
				data: null,
			};

			const singleMock = vi.fn().mockResolvedValue({
				data: mockCanvas,
				error: null,
			});

			const selectMock = vi.fn().mockReturnValue({
				single: singleMock,
			});

			const insertMock = vi.fn().mockReturnValue({
				select: selectMock,
			});

			const fromMock = vi.fn().mockReturnValue({
				insert: insertMock,
			});

			createServiceClientMock.mockReturnValue({
				from: fromMock,
				auth: { getUser: getUserMock },
			});

			const response = await request(app)
				.post("/api/v1/canvas/create-canvas")
				.set("Authorization", "Bearer valid_token")
				.send({ name: "My Canvas", isPublic: false });

			expect(response.status).toBe(201);
			expect(response.body.data.roomId).toBe("canvas_abc");
			expect(response.body.data.slug).toBe("my-canvas-123456");

			expect(fromMock).toHaveBeenCalledWith("canvases");
			expect(insertMock).toHaveBeenCalledWith(
				expect.objectContaining({
					name: "My Canvas",
					owner_id: "user_123",
					is_public: false,
				}),
			);
		});
	});

	describe("Case 3: owner_id security check", () => {
		it("should ignore malicious owner_id and use authenticated userId", async () => {
			const getUserMock = vi.fn().mockResolvedValue({
				data: { user: { id: "user_123" } },
				error: null,
			});

			const mockCanvas = {
				id: "canvas_xyz",
				name: "Hacked Canvas",
				slug: "hacked-canvas-123456",
				owner_id: "user_123",
				is_public: true,
				data: null,
			};

			const singleMock = vi.fn().mockResolvedValue({
				data: mockCanvas,
				error: null,
			});

			const selectMock = vi.fn().mockReturnValue({ single: singleMock });
			const insertMock = vi.fn().mockReturnValue({ select: selectMock });
			const fromMock = vi.fn().mockReturnValue({ insert: insertMock });

			createServiceClientMock.mockReturnValue({
				from: fromMock,
				auth: { getUser: getUserMock },
			});

			const response = await request(app)
				.post("/api/v1/canvas/create-canvas")
				.set("Authorization", "Bearer valid_token")
				.send({
					name: "Hacked Canvas",
					isPublic: true,
					owner_id: "attacker_id",
				});

			expect(response.status).toBe(201);

			const insertCall = insertMock.mock.calls[0]?.[0];
			expect(insertCall.owner_id).toBe("user_123");
			expect(insertCall.owner_id).not.toBe("attacker_id");
		});
	});
});
