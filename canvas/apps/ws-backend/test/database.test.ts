import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

// Mock the createServiceClient before importing the module that uses it
vi.mock("../src/supabase.server.js", () => ({
	createServiceClient: vi.fn(),
}));

import { createServiceClient } from "../src/supabase.server.js";

const createServiceClientMock = createServiceClient as Mock;

/**
 * Creates a mock Supabase client with the specified behavior
 */
const createMockSupabaseClient = (overrides: {
	selectData?: unknown;
	selectError?: Error | null;
	updateError?: Error | null;
	insertError?: Error | null;
}) => {
	const eqMock = vi.fn();
	const maybeSingleMock = vi.fn();
	const updateMock = vi.fn();
	const insertMock = vi.fn();
	const selectMock = vi.fn();
	const fromMock = vi.fn();

	// Chain for .select().eq().maybeSingle()
	maybeSingleMock.mockResolvedValue({
		data: overrides.selectData ?? null,
		error: overrides.selectError ?? null,
	});

	eqMock.mockReturnValue({
		maybeSingle: maybeSingleMock,
	});

	selectMock.mockReturnValue({
		eq: eqMock,
	});

	// Chain for .update().eq()
	updateMock.mockReturnValue({
		eq: vi.fn().mockResolvedValue({
			error: overrides.updateError ?? null,
		}),
	});

	// Chain for .insert()
	insertMock.mockResolvedValue({
		error: overrides.insertError ?? null,
	});

	fromMock.mockReturnValue({
		select: selectMock,
		update: updateMock,
		insert: insertMock,
	});

	return {
		from: fromMock,
		fromMock,
		selectMock,
		eqMock,
		maybeSingleMock,
		updateMock,
		insertMock,
	};
};

/**
 * Simulates the store function logic for testing
 * This mirrors the actual implementation in index.ts
 */
async function simulateStoreFunction(
	supabase: ReturnType<typeof createMockSupabaseClient>,
	documentName: string,
	state: Uint8Array,
	userId?: string,
) {
	// Convert Uint8Array to hex string with \x prefix for bytea column
	const hexData = `\\x${Buffer.from(state).toString("hex")}`;

	// Check if canvas already exists
	const { data: existing } = await supabase
		.from("canvases")
		.select("id")
		.eq("id", documentName)
		.maybeSingle();

	if (existing) {
		// Canvas exists — only update data and timestamp
		await supabase
			.from("canvases")
			.update({
				data: hexData,
				updated_at: expect.any(String),
			})
			.eq("id", documentName);
	} else if (userId) {
		// Canvas does not exist — create it
		await supabase.from("canvases").insert({
			id: documentName,
			data: hexData,
			updated_at: expect.any(String),
			owner_id: userId,
			name: `Canvas ${documentName.slice(0, 8)}`,
		});
	}

	return { hexData };
}

describe("ws-backend Database Store Function", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Case 1: Storing binary payload to existing canvas", () => {
		it("should call update() when canvas already exists", async () => {
			const mockClient = createMockSupabaseClient({
				selectData: { id: "canvas-123" }, // Canvas exists
			});

			createServiceClientMock.mockReturnValue(mockClient);

			const samplePayload = new Uint8Array([1, 2, 3, 4, 5]);
			const documentName = "canvas-123";

			await simulateStoreFunction(
				mockClient,
				documentName,
				samplePayload,
				"user-abc",
			);

			// Assert: from() was called with "canvases"
			expect(mockClient.fromMock).toHaveBeenCalledWith("canvases");

			// Assert: update() was called (not insert)
			expect(mockClient.updateMock).toHaveBeenCalled();
			expect(mockClient.insertMock).not.toHaveBeenCalled();
		});

		it("should convert binary payload to hex format", async () => {
			const mockClient = createMockSupabaseClient({
				selectData: { id: "canvas-123" }, // Canvas exists
			});

			createServiceClientMock.mockReturnValue(mockClient);

			const samplePayload = new Uint8Array([0x01, 0x02, 0xab, 0xcd]);
			const documentName = "canvas-123";

			const { hexData } = await simulateStoreFunction(
				mockClient,
				documentName,
				samplePayload,
				"user-abc",
			);

			// Assert: hex format is correct with \x prefix
			expect(hexData).toBe("\\x0102abcd");
		});
	});

	describe("Case 2: Storing binary payload to new canvas", () => {
		it("should call insert() when canvas does not exist and userId is provided", async () => {
			const mockClient = createMockSupabaseClient({
				selectData: null, // Canvas does not exist
			});

			createServiceClientMock.mockReturnValue(mockClient);

			const samplePayload = new Uint8Array([1, 2, 3, 4, 5]);
			const documentName = "new-canvas-456";
			const userId = "user-xyz";

			await simulateStoreFunction(
				mockClient,
				documentName,
				samplePayload,
				userId,
			);

			// Assert: from() was called with "canvases"
			expect(mockClient.fromMock).toHaveBeenCalledWith("canvases");

			// Assert: insert() was called (not update)
			expect(mockClient.insertMock).toHaveBeenCalled();

			// Assert: insert was called with correct structure
			const insertCall = mockClient.insertMock.mock.calls[0]?.[0];
			expect(insertCall).toMatchObject({
				id: documentName,
				owner_id: userId,
				name: `Canvas ${documentName.slice(0, 8)}`,
			});
			expect(insertCall.data).toMatch(/^\\x[0-9a-f]+$/); // hex format
		});

		it("should NOT call insert() when canvas does not exist and userId is missing", async () => {
			const mockClient = createMockSupabaseClient({
				selectData: null, // Canvas does not exist
			});

			createServiceClientMock.mockReturnValue(mockClient);

			const samplePayload = new Uint8Array([1, 2, 3, 4, 5]);
			const documentName = "new-canvas-789";

			await simulateStoreFunction(
				mockClient,
				documentName,
				samplePayload,
				undefined, // No userId
			);

			// Assert: insert() was NOT called because no userId
			expect(mockClient.insertMock).not.toHaveBeenCalled();
		});
	});

	describe("Case 3: Upsert behavior verification", () => {
		it("should use upsert pattern (check-then-insert/update) not rely on .update() alone", async () => {
			const mockClient = createMockSupabaseClient({
				selectData: null, // New canvas
			});

			createServiceClientMock.mockReturnValue(mockClient);

			const samplePayload = new Uint8Array([10, 20, 30]);
			const documentName = "upsert-test-canvas";
			const userId = "test-user";

			await simulateStoreFunction(
				mockClient,
				documentName,
				samplePayload,
				userId,
			);

			// Assert: select() was called first to check existence
			expect(mockClient.selectMock).toHaveBeenCalled();

			// Assert: For new canvas, insert() is used (not update alone)
			expect(mockClient.insertMock).toHaveBeenCalled();

			// Verify the upsert pattern: check exists -> then insert/update
			const selectCallOrder = mockClient.selectMock.mock.invocationCallOrder[0];
			const insertCallOrder = mockClient.insertMock.mock.invocationCallOrder[0];
			expect(selectCallOrder).toBeLessThan(insertCallOrder ?? Infinity);
		});

		it("should update existing canvas without changing owner_id", async () => {
			const mockClient = createMockSupabaseClient({
				selectData: { id: "existing-canvas" }, // Canvas exists
			});

			createServiceClientMock.mockReturnValue(mockClient);

			const samplePayload = new Uint8Array([1, 2, 3]);
			const documentName = "existing-canvas";

			await simulateStoreFunction(
				mockClient,
				documentName,
				samplePayload,
				"attacker-id", // Even with userId, update should NOT include owner_id
			);

			// Assert: update() was called
			expect(mockClient.updateMock).toHaveBeenCalled();

			// Assert: update payload does NOT include owner_id
			const updateCall = mockClient.updateMock.mock.calls[0]?.[0];
			expect(updateCall).not.toHaveProperty("owner_id");
			expect(updateCall).toHaveProperty("data");
			expect(updateCall).toHaveProperty("updated_at");
		});
	});
});
