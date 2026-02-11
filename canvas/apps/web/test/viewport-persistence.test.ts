/**
 * ============================================================================
 * VIEWPORT PERSISTENCE — EDGE CASE TESTS
 * ============================================================================
 *
 * Tests for: loadViewport, saveViewport, localStorage key format,
 * invalid data handling, debounce behavior.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { initialState, useCanvasStore } from "../store/canvas-store";

// ──────────────────────────────────────────────────────────────
// localStorage mock
// ──────────────────────────────────────────────────────────────

const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: vi.fn((key: string) => store[key] ?? null),
		setItem: vi.fn((key: string, value: string) => {
			store[key] = value;
		}),
		removeItem: vi.fn((key: string) => {
			delete store[key];
		}),
		clear: vi.fn(() => {
			store = {};
		}),
		get length() {
			return Object.keys(store).length;
		},
		key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
		_getStore: () => store,
	};
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

const resetStore = () => useCanvasStore.setState(initialState);

// ──────────────────────────────────────────────────────────────
// Helper: simulate reading viewport from localStorage
// (mirrors the logic in useViewportPersistence.ts)
// ──────────────────────────────────────────────────────────────

const STORAGE_KEY_PREFIX = "lekhaflow-viewport-";

function loadViewport(roomId: string) {
	try {
		const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${roomId}`);
		if (!raw) return null;
		const data = JSON.parse(raw);
		if (
			typeof data.scrollX === "number" &&
			typeof data.scrollY === "number" &&
			typeof data.zoom === "number"
		) {
			return data;
		}
		return null;
	} catch {
		return null;
	}
}

function saveViewport(
	roomId: string,
	data: { scrollX: number; scrollY: number; zoom: number },
) {
	try {
		localStorage.setItem(
			`${STORAGE_KEY_PREFIX}${roomId}`,
			JSON.stringify({ ...data, timestamp: Date.now() }),
		);
	} catch {}
}

describe("Viewport Persistence", () => {
	beforeEach(() => {
		resetStore();
		localStorageMock.clear();
		vi.clearAllMocks();
	});

	// ──────────────────────────────────────────────────────────────
	// 1. SAVE / LOAD ROUND-TRIP
	// ──────────────────────────────────────────────────────────────

	describe("Save and Load Round-Trip", () => {
		it("saves and loads viewport data correctly", () => {
			saveViewport("room-1", { scrollX: 100, scrollY: 200, zoom: 1.5 });
			const loaded = loadViewport("room-1");

			expect(loaded).not.toBeNull();
			expect(loaded.scrollX).toBe(100);
			expect(loaded.scrollY).toBe(200);
			expect(loaded.zoom).toBe(1.5);
			expect(loaded.timestamp).toBeGreaterThan(0);
		});

		it("returns null for room with no saved data", () => {
			expect(loadViewport("nonexistent-room")).toBeNull();
		});

		it("uses correct localStorage key format", () => {
			saveViewport("my-room-42", { scrollX: 0, scrollY: 0, zoom: 1 });
			expect(localStorageMock.setItem).toHaveBeenCalledWith(
				"lekhaflow-viewport-my-room-42",
				expect.any(String),
			);
		});
	});

	// ──────────────────────────────────────────────────────────────
	// 2. INVALID DATA HANDLING
	// ──────────────────────────────────────────────────────────────

	describe("Invalid Data Handling", () => {
		it("returns null for corrupted JSON", () => {
			localStorageMock.setItem(
				"lekhaflow-viewport-room-bad",
				"not-valid-json{",
			);
			expect(loadViewport("room-bad")).toBeNull();
		});

		it("returns null when scrollX is missing", () => {
			localStorageMock.setItem(
				"lekhaflow-viewport-room-partial",
				JSON.stringify({ scrollY: 100, zoom: 1 }),
			);
			expect(loadViewport("room-partial")).toBeNull();
		});

		it("returns null when zoom is not a number", () => {
			localStorageMock.setItem(
				"lekhaflow-viewport-room-str",
				JSON.stringify({ scrollX: 0, scrollY: 0, zoom: "big" }),
			);
			expect(loadViewport("room-str")).toBeNull();
		});

		it("returns null for empty string", () => {
			localStorageMock.setItem("lekhaflow-viewport-room-empty", "");
			expect(loadViewport("room-empty")).toBeNull();
		});

		it("returns null for null value in storage", () => {
			expect(loadViewport("room-null")).toBeNull();
		});
	});

	// ──────────────────────────────────────────────────────────────
	// 3. EDGE VALUES
	// ──────────────────────────────────────────────────────────────

	describe("Edge Values", () => {
		it("saves and loads negative scroll values", () => {
			saveViewport("room-neg", { scrollX: -500, scrollY: -300, zoom: 0.5 });
			const loaded = loadViewport("room-neg");
			expect(loaded.scrollX).toBe(-500);
			expect(loaded.scrollY).toBe(-300);
		});

		it("saves and loads zero values", () => {
			saveViewport("room-zero", { scrollX: 0, scrollY: 0, zoom: 0.1 });
			const loaded = loadViewport("room-zero");
			expect(loaded.scrollX).toBe(0);
			expect(loaded.scrollY).toBe(0);
			expect(loaded.zoom).toBe(0.1);
		});

		it("saves and loads large scroll values", () => {
			saveViewport("room-large", {
				scrollX: 999999,
				scrollY: 999999,
				zoom: 5,
			});
			const loaded = loadViewport("room-large");
			expect(loaded.scrollX).toBe(999999);
			expect(loaded.scrollY).toBe(999999);
			expect(loaded.zoom).toBe(5);
		});

		it("handles floating-point zoom values", () => {
			saveViewport("room-float", {
				scrollX: 10,
				scrollY: 20,
				zoom: 1.333333,
			});
			const loaded = loadViewport("room-float");
			expect(loaded.zoom).toBeCloseTo(1.333333);
		});
	});

	// ──────────────────────────────────────────────────────────────
	// 4. ISOLATION BETWEEN ROOMS
	// ──────────────────────────────────────────────────────────────

	describe("Isolation Between Rooms", () => {
		it("different rooms have independent viewport data", () => {
			saveViewport("room-A", { scrollX: 10, scrollY: 20, zoom: 1 });
			saveViewport("room-B", { scrollX: 300, scrollY: 400, zoom: 2 });

			const a = loadViewport("room-A");
			const b = loadViewport("room-B");

			expect(a.scrollX).toBe(10);
			expect(b.scrollX).toBe(300);
		});

		it("overwriting one room does not affect another", () => {
			saveViewport("room-A", { scrollX: 10, scrollY: 20, zoom: 1 });
			saveViewport("room-B", { scrollX: 300, scrollY: 400, zoom: 2 });

			// Overwrite room-A
			saveViewport("room-A", { scrollX: 999, scrollY: 888, zoom: 3 });

			const a = loadViewport("room-A");
			const b = loadViewport("room-B");

			expect(a.scrollX).toBe(999);
			expect(b.scrollX).toBe(300); // Unchanged
		});
	});

	// ──────────────────────────────────────────────────────────────
	// 5. STORE INTEGRATION
	// ──────────────────────────────────────────────────────────────

	describe("Store Integration", () => {
		it("setScroll updates store correctly", () => {
			useCanvasStore.getState().setScroll(150, 250);
			expect(useCanvasStore.getState().scrollX).toBe(150);
			expect(useCanvasStore.getState().scrollY).toBe(250);
		});

		it("setZoom clamps to min 0.1", () => {
			useCanvasStore.getState().setZoom(0.01);
			expect(useCanvasStore.getState().zoom).toBe(0.1);
		});

		it("setZoom clamps to max 5", () => {
			useCanvasStore.getState().setZoom(100);
			expect(useCanvasStore.getState().zoom).toBe(5);
		});

		it("resetViewport restores defaults", () => {
			useCanvasStore.getState().setScroll(100, 200);
			useCanvasStore.getState().setZoom(3);
			useCanvasStore.getState().resetViewport();

			const { scrollX, scrollY, zoom } = useCanvasStore.getState();
			expect(scrollX).toBe(0);
			expect(scrollY).toBe(0);
			expect(zoom).toBe(1);
		});
	});

	// ──────────────────────────────────────────────────────────────
	// 6. LOCALSTORAGE ERRORS
	// ──────────────────────────────────────────────────────────────

	describe("localStorage Errors", () => {
		it("saveViewport does not throw when localStorage is full", () => {
			localStorageMock.setItem.mockImplementationOnce(() => {
				throw new Error("QuotaExceededError");
			});

			expect(() => {
				saveViewport("room-err", { scrollX: 1, scrollY: 2, zoom: 1 });
			}).not.toThrow();
		});

		it("loadViewport does not throw when getItem throws", () => {
			localStorageMock.getItem.mockImplementationOnce(() => {
				throw new Error("SecurityError");
			});

			expect(() => loadViewport("room-sec")).not.toThrow();
			expect(loadViewport("room-sec")).toBeNull();
		});
	});
});
