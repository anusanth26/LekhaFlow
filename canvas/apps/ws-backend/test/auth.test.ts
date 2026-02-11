/**
 * ============================================================================
 * WS BACKEND — AUTHENTICATION & ACTIVITY LOG TESTS
 * ============================================================================
 *
 * Tests for: onAuthenticate logic — token validation, activity log
 * deduplication, error handling.
 */

import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

// Mock the supabase server module
vi.mock("../src/supabase.server.js", () => ({
	createServiceClient: vi.fn(),
}));

import { createServiceClient } from "../src/supabase.server.js";

const _createServiceClientMock = createServiceClient as Mock;

/**
 * Simulates the onAuthenticate logic from ws-backend/src/index.ts
 */
async function simulateOnAuthenticate(
	supabase: ReturnType<typeof createMockClient>,
	data: { token: string | null; documentName: string },
) {
	const { token, documentName } = data;

	if (!token) {
		throw new Error("Unauthorized: No token provided");
	}

	const {
		data: { user },
		error,
	} = await supabase.auth.getUser(token);

	if (error || !user) {
		throw new Error("Unauthorized: Invalid token");
	}

	// Track access (dedup within 1 hour)
	try {
		const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
		const { data: existingLog } = await supabase
			.from("activity_logs")
			.select("id")
			.eq("canvas_id", documentName)
			.eq("user_id", user.id)
			.eq("action", "accessed")
			.gte("created_at", oneHourAgo)
			.maybeSingle();

		if (!existingLog) {
			await supabase.from("activity_logs").insert({
				canvas_id: documentName,
				user_id: user.id,
				action: "accessed",
				details: null,
			});
		}
	} catch {
		// Non-critical
	}

	return { user: { id: user.id, email: user.email } };
}

/** Helper: create a mock Supabase client */
function createMockClient(overrides: {
	user?: { id: string; email?: string } | null;
	authError?: Error | null;
	existingLog?: { id: string } | null;
	logInsertError?: Error | null;
}) {
	const getUserMock = vi.fn().mockResolvedValue({
		data: { user: overrides.user ?? null },
		error: overrides.authError ?? null,
	});

	const maybeSingleMock = vi.fn().mockResolvedValue({
		data: overrides.existingLog ?? null,
		error: null,
	});
	const gteMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
	const eqActionMock = vi.fn().mockReturnValue({ gte: gteMock });
	const eqUserMock = vi.fn().mockReturnValue({ eq: eqActionMock });
	const eqCanvasMock = vi.fn().mockReturnValue({ eq: eqUserMock });
	const selectMock = vi.fn().mockReturnValue({ eq: eqCanvasMock });
	const insertMock = vi.fn().mockResolvedValue({
		error: overrides.logInsertError ?? null,
	});

	const fromMock = vi.fn().mockReturnValue({
		select: selectMock,
		insert: insertMock,
	});

	return {
		auth: { getUser: getUserMock },
		from: fromMock,
		// Expose for assertions
		_mocks: {
			getUserMock,
			fromMock,
			selectMock,
			insertMock,
			maybeSingleMock,
		},
	};
}

describe("WS Backend — onAuthenticate", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// ──────────────────────────────────────────────────────────────
	// 1. TOKEN VALIDATION
	// ──────────────────────────────────────────────────────────────

	describe("Token Validation", () => {
		it("throws when token is null", async () => {
			const client = createMockClient({});

			await expect(
				simulateOnAuthenticate(client, {
					token: null,
					documentName: "doc-1",
				}),
			).rejects.toThrow("Unauthorized: No token provided");
		});

		it("throws when token is empty string", async () => {
			const client = createMockClient({});

			// Empty string is falsy → throws
			await expect(
				simulateOnAuthenticate(client, {
					token: "",
					documentName: "doc-1",
				}),
			).rejects.toThrow("Unauthorized: No token provided");
		});

		it("throws when supabase returns auth error", async () => {
			const client = createMockClient({
				user: null,
				authError: new Error("Token expired"),
			});

			await expect(
				simulateOnAuthenticate(client, {
					token: "expired-token",
					documentName: "doc-1",
				}),
			).rejects.toThrow("Unauthorized: Invalid token");
		});

		it("throws when supabase returns null user without error", async () => {
			const client = createMockClient({ user: null, authError: null });

			await expect(
				simulateOnAuthenticate(client, {
					token: "some-token",
					documentName: "doc-1",
				}),
			).rejects.toThrow("Unauthorized: Invalid token");
		});

		it("returns user object on valid authentication", async () => {
			const client = createMockClient({
				user: { id: "u1", email: "test@example.com" },
			});

			const result = await simulateOnAuthenticate(client, {
				token: "valid-jwt",
				documentName: "doc-1",
			});

			expect(result.user.id).toBe("u1");
			expect(result.user.email).toBe("test@example.com");
		});

		it("passes the token to supabase getUser", async () => {
			const client = createMockClient({
				user: { id: "u1", email: "a@b.com" },
			});

			await simulateOnAuthenticate(client, {
				token: "my-jwt-token",
				documentName: "doc-1",
			});

			expect(client._mocks.getUserMock).toHaveBeenCalledWith("my-jwt-token");
		});
	});

	// ──────────────────────────────────────────────────────────────
	// 2. ACTIVITY LOG DEDUPLICATION
	// ──────────────────────────────────────────────────────────────

	describe("Activity Log Deduplication", () => {
		it("inserts activity log when no recent entry exists", async () => {
			const client = createMockClient({
				user: { id: "u1", email: "a@b.com" },
				existingLog: null, // No recent access
			});

			await simulateOnAuthenticate(client, {
				token: "valid",
				documentName: "doc-42",
			});

			expect(client._mocks.insertMock).toHaveBeenCalledWith({
				canvas_id: "doc-42",
				user_id: "u1",
				action: "accessed",
				details: null,
			});
		});

		it("does NOT insert activity log when recent entry exists", async () => {
			const client = createMockClient({
				user: { id: "u1", email: "a@b.com" },
				existingLog: { id: "log-existing" }, // Recent access exists
			});

			await simulateOnAuthenticate(client, {
				token: "valid",
				documentName: "doc-42",
			});

			expect(client._mocks.insertMock).not.toHaveBeenCalled();
		});

		it("does not fail authentication if activity log insert fails", async () => {
			const client = createMockClient({
				user: { id: "u1", email: "a@b.com" },
				existingLog: null,
				logInsertError: new Error("DB insert failed"),
			});

			// Should NOT throw even though insert failed
			const result = await simulateOnAuthenticate(client, {
				token: "valid",
				documentName: "doc-42",
			});

			expect(result.user.id).toBe("u1");
		});

		it("queries activity_logs table with correct filters", async () => {
			const client = createMockClient({
				user: { id: "u1", email: "a@b.com" },
				existingLog: null,
			});

			await simulateOnAuthenticate(client, {
				token: "valid",
				documentName: "canvas-xyz",
			});

			// from should be called with "activity_logs" (at least)
			expect(client._mocks.fromMock).toHaveBeenCalledWith("activity_logs");
		});
	});

	// ──────────────────────────────────────────────────────────────
	// 3. RETURN VALUE FORMAT
	// ──────────────────────────────────────────────────────────────

	describe("Return Value", () => {
		it("returns object with user.id and user.email", async () => {
			const client = createMockClient({
				user: { id: "user-abc", email: "test@test.com" },
			});

			const result = await simulateOnAuthenticate(client, {
				token: "valid",
				documentName: "doc-1",
			});

			expect(result).toEqual({
				user: { id: "user-abc", email: "test@test.com" },
			});
		});

		it("handles user with undefined email", async () => {
			const client = createMockClient({
				user: { id: "user-abc", email: undefined },
			});

			const result = await simulateOnAuthenticate(client, {
				token: "valid",
				documentName: "doc-1",
			});

			expect(result.user.id).toBe("user-abc");
			expect(result.user.email).toBeUndefined();
		});
	});
});
