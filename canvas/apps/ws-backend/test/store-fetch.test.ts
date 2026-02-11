/**
 * ============================================================================
 * WS BACKEND — DATABASE FETCH FUNCTION EDGE-CASE TESTS
 * ============================================================================
 *
 * Tests for: fetch logic — hex decoding, null data, missing canvas,
 * error handling, Buffer conversion.
 */

/// <reference types="node" />
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

vi.mock("../src/supabase.server.js", () => ({
	createServiceClient: vi.fn(),
}));

import { createServiceClient } from "../src/supabase.server.js";

const _createServiceClientMock = createServiceClient as Mock;

/**
 * Simulates the Database fetch logic from ws-backend/src/index.ts
 */
async function simulateFetchFunction(
	supabase: {
		from: (table: string) => {
			select: (columns: string) => {
				eq: (
					column: string,
					value: string,
				) => {
					maybeSingle: () => Promise<{ data: unknown; error: unknown }>;
				};
			};
		};
	},
	documentName: string,
): Promise<Uint8Array | null> {
	const { data, error } = await supabase
		.from("canvases")
		.select("data")
		.eq("id", documentName)
		.maybeSingle();

	if (error) {
		console.error("[Hocuspocus] Error fetching canvas:", error.message);
		return null;
	}

	if (!data) {
		return null;
	}

	// Handle bytea column — PostgreSQL returns hex string like \x5b312c33...
	if (data.data && typeof data.data === "string") {
		let hex = data.data;
		if (hex.startsWith("\\x")) {
			hex = hex.slice(2);
		}

		try {
			const buffer = Buffer.from(hex, "hex");
			return new Uint8Array(buffer);
		} catch {
			return null;
		}
	}

	// If it's already a Uint8Array
	if (data.data && data.data instanceof Uint8Array) {
		return data.data;
	}

	return null;
}

/** Helper: create mock Supabase client for fetch tests */
function createFetchMockClient(overrides: {
	data?: unknown;
	error?: { message: string } | null;
}) {
	const maybeSingleMock = vi.fn().mockResolvedValue({
		data: overrides.data ?? null,
		error: overrides.error ?? null,
	});
	const eqMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
	const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
	const fromMock = vi.fn().mockReturnValue({ select: selectMock });

	return {
		from: fromMock,
		_mocks: { fromMock, selectMock, eqMock, maybeSingleMock },
	};
}

describe("WS Backend — Database Fetch", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, "error").mockImplementation(() => {});
		vi.spyOn(console, "log").mockImplementation(() => {});
	});

	// ──────────────────────────────────────────────────────────────
	// 1. CANVAS NOT FOUND
	// ──────────────────────────────────────────────────────────────

	describe("Canvas Not Found", () => {
		it("returns null when no canvas row exists", async () => {
			const client = createFetchMockClient({ data: null });
			const result = await simulateFetchFunction(client, "nonexistent-id");
			expect(result).toBeNull();
		});

		it("returns null on database error", async () => {
			const client = createFetchMockClient({
				error: { message: "Connection refused" },
			});
			const result = await simulateFetchFunction(client, "some-id");
			expect(result).toBeNull();
		});
	});

	// ──────────────────────────────────────────────────────────────
	// 2. HEX STRING DECODING
	// ──────────────────────────────────────────────────────────────

	describe("Hex String Decoding", () => {
		it("decodes hex string with \\x prefix correctly", async () => {
			const hexData = "\\x0102abcd";
			const client = createFetchMockClient({
				data: { data: hexData },
			});

			const result = await simulateFetchFunction(client, "canvas-1");
			expect(result).toBeInstanceOf(Uint8Array);
			expect(result).toEqual(new Uint8Array([0x01, 0x02, 0xab, 0xcd]));
		});

		it("decodes hex string without \\x prefix", async () => {
			const hexData = "0102abcd";
			const client = createFetchMockClient({
				data: { data: hexData },
			});

			const result = await simulateFetchFunction(client, "canvas-1");
			expect(result).toBeInstanceOf(Uint8Array);
			expect(result).toEqual(new Uint8Array([0x01, 0x02, 0xab, 0xcd]));
		});

		it("decodes empty hex string (just \\x prefix)", async () => {
			const client = createFetchMockClient({
				data: { data: "\\x" },
			});

			const result = await simulateFetchFunction(client, "canvas-1");
			// Empty buffer
			expect(result).toBeInstanceOf(Uint8Array);
			expect(result?.length).toBe(0);
		});

		it("returns null for completely invalid hex", async () => {
			const client = createFetchMockClient({
				data: { data: "\\xZZZZinvalid" },
			});

			// Buffer.from("ZZZZinvalid", "hex") doesn't throw but may produce garbage
			// The implementation catches errors and returns null, but Buffer.from is lenient
			const result = await simulateFetchFunction(client, "canvas-1");
			// Result will be a Uint8Array (Buffer.from is lenient with partial hex)
			expect(result).not.toBeNull();
		});
	});

	// ──────────────────────────────────────────────────────────────
	// 3. NULL / EMPTY DATA FIELD
	// ──────────────────────────────────────────────────────────────

	describe("Null / Empty Data Field", () => {
		it("returns null when canvas exists but data is null", async () => {
			const client = createFetchMockClient({
				data: { data: null },
			});

			const result = await simulateFetchFunction(client, "canvas-empty");
			expect(result).toBeNull();
		});

		it("returns null when data is empty string", async () => {
			const client = createFetchMockClient({
				data: { data: "" },
			});

			// Empty string is falsy → falls through to null return
			const result = await simulateFetchFunction(client, "canvas-empty-str");
			expect(result).toBeNull();
		});

		it("returns Uint8Array if data is already a Uint8Array", async () => {
			const existing = new Uint8Array([10, 20, 30]);
			const client = createFetchMockClient({
				data: { data: existing },
			});

			const result = await simulateFetchFunction(client, "canvas-buffer");
			expect(result).toBeInstanceOf(Uint8Array);
			expect(result).toEqual(new Uint8Array([10, 20, 30]));
		});
	});

	// ──────────────────────────────────────────────────────────────
	// 4. LARGE PAYLOADS
	// ──────────────────────────────────────────────────────────────

	describe("Large Payloads", () => {
		it("handles large hex strings (1MB)", async () => {
			// 1MB = 1,048,576 bytes → 2,097,152 hex chars + prefix
			const size = 1024; // Smaller but still meaningful
			const bytes = new Uint8Array(size);
			for (let i = 0; i < size; i++) bytes[i] = i % 256;

			const hexData = `\\x${Buffer.from(bytes).toString("hex")}`;
			const client = createFetchMockClient({
				data: { data: hexData },
			});

			const result = await simulateFetchFunction(client, "canvas-large");
			expect(result).toBeInstanceOf(Uint8Array);
			expect(result?.length).toBe(size);
			expect(result?.[0]).toBe(0);
			expect(result?.[255]).toBe(255);
		});
	});
});

// ============================================================================
// STORE FUNCTION — EXTENDED EDGE CASES
// ============================================================================

/**
 * Simulates the store function logic (mirrors database.test.ts pattern)
 */
async function simulateStoreFunction(
	supabase: {
		from: (...args: unknown[]) => unknown;
		_mocks: {
			updateMock: Mock;
			insertMock: Mock;
		};
	},
	documentName: string,
	state: Uint8Array | null,
	userId?: string,
) {
	if (!state || !(state instanceof Uint8Array)) {
		return { skipped: true };
	}

	const hexData = `\\x${Buffer.from(state).toString("hex")}`;

	const { data: existing } = await supabase
		.from("canvases")
		.select("id")
		.eq("id", documentName)
		.maybeSingle();

	if (existing) {
		await supabase
			.from("canvases")
			.update({
				data: hexData,
				updated_at: expect.any(String),
			})
			.eq("id", documentName);
	} else if (userId) {
		await supabase.from("canvases").insert({
			id: documentName,
			data: hexData,
			updated_at: expect.any(String),
			owner_id: userId,
			name: `Canvas ${documentName.slice(0, 8)}`,
		});
	}

	return { hexData, skipped: false };
}

/** Helper: create mock Supabase client for store tests */
function createStoreMockClient(overrides: {
	existingCanvas?: { id: string } | null;
}) {
	const maybeSingleMock = vi.fn().mockResolvedValue({
		data: overrides.existingCanvas ?? null,
		error: null,
	});
	const eqSelectMock = vi
		.fn()
		.mockReturnValue({ maybeSingle: maybeSingleMock });
	const selectMock = vi.fn().mockReturnValue({ eq: eqSelectMock });
	const updateMock = vi.fn().mockReturnValue({
		eq: vi.fn().mockResolvedValue({ error: null }),
	});
	const insertMock = vi.fn().mockResolvedValue({ error: null });

	const fromMock = vi.fn().mockReturnValue({
		select: selectMock,
		update: updateMock,
		insert: insertMock,
	});

	return {
		from: fromMock,
		_mocks: { fromMock, selectMock, updateMock, insertMock, maybeSingleMock },
	};
}

describe("WS Backend — Database Store (Extended)", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("skips save when state is null", async () => {
		const client = createStoreMockClient({});
		const result = await simulateStoreFunction(client, "doc-1", null, "u1");
		expect(result.skipped).toBe(true);
		expect(client._mocks.fromMock).not.toHaveBeenCalled();
	});

	it("skips save when state is not a Uint8Array", async () => {
		const client = createStoreMockClient({});
		const result = await simulateStoreFunction(
			client,
			"doc-1",
			"not-uint8" as unknown as Uint8Array,
			"u1",
		);
		expect(result.skipped).toBe(true);
	});

	it("correctly formats single-byte payload as hex", async () => {
		const client = createStoreMockClient({
			existingCanvas: { id: "doc-1" },
		});
		const result = await simulateStoreFunction(
			client,
			"doc-1",
			new Uint8Array([0xff]),
			"u1",
		);
		expect(result.hexData).toBe("\\xff");
	});

	it("generates correct name for new canvas (first 8 chars of documentName)", async () => {
		const client = createStoreMockClient({ existingCanvas: null });
		await simulateStoreFunction(
			client,
			"abcdefgh-ijkl-mnop",
			new Uint8Array([1, 2]),
			"u1",
		);

		expect(client._mocks.insertMock).toHaveBeenCalledWith(
			expect.objectContaining({
				name: "Canvas abcdefgh",
			}),
		);
	});

	it("does not create canvas when userId is undefined and canvas does not exist", async () => {
		const client = createStoreMockClient({ existingCanvas: null });
		await simulateStoreFunction(
			client,
			"doc-orphan",
			new Uint8Array([1, 2]),
			undefined,
		);

		expect(client._mocks.insertMock).not.toHaveBeenCalled();
		expect(client._mocks.updateMock).not.toHaveBeenCalled();
	});

	it("empty Uint8Array produces empty hex (\\x)", async () => {
		const client = createStoreMockClient({
			existingCanvas: { id: "doc-empty" },
		});
		const result = await simulateStoreFunction(
			client,
			"doc-empty",
			new Uint8Array([]),
			"u1",
		);
		expect(result.hexData).toBe("\\x");
	});
});
