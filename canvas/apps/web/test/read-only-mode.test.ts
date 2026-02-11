/**
 * ============================================================================
 * READ-ONLY MODE — EDGE CASE TESTS
 * ============================================================================
 *
 * Tests for: setReadOnly, lock persistence, tool restrictions, state cleanup.
 */

import type { CanvasElement } from "@repo/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { initialState, useCanvasStore } from "../store/canvas-store";

// Mock localStorage
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
		key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
	};
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

const resetStore = () => useCanvasStore.setState(initialState);

describe("Read-Only Mode", () => {
	beforeEach(() => {
		resetStore();
		localStorageMock.clear();
		vi.clearAllMocks();
	});

	// ──────────────────────────────────────────────────────────────
	// 1. BASIC TOGGLE
	// ──────────────────────────────────────────────────────────────

	describe("Basic Toggle", () => {
		it("defaults to unlocked (isReadOnly = false)", () => {
			expect(useCanvasStore.getState().isReadOnly).toBe(false);
		});

		it("setReadOnly(true) enables read-only mode", () => {
			useCanvasStore.getState().setReadOnly(true);
			expect(useCanvasStore.getState().isReadOnly).toBe(true);
		});

		it("setReadOnly(false) disables read-only mode", () => {
			useCanvasStore.getState().setReadOnly(true);
			useCanvasStore.getState().setReadOnly(false);
			expect(useCanvasStore.getState().isReadOnly).toBe(false);
		});

		it("toggling twice returns to original state", () => {
			useCanvasStore.getState().setReadOnly(true);
			useCanvasStore.getState().setReadOnly(false);
			expect(useCanvasStore.getState().isReadOnly).toBe(false);
			// After lock (forces hand) → unlock, tool stays as hand
			expect(useCanvasStore.getState().activeTool).toBe("hand");
		});
	});

	// ──────────────────────────────────────────────────────────────
	// 2. STATE CLEANUP ON LOCK
	// ──────────────────────────────────────────────────────────────

	describe("State Cleanup on Lock", () => {
		it("forces activeTool to 'hand' when entering read-only", () => {
			useCanvasStore.setState({ activeTool: "rectangle" });
			useCanvasStore.getState().setReadOnly(true);
			expect(useCanvasStore.getState().activeTool).toBe("hand");
		});

		it("clears selectedElementIds when entering read-only", () => {
			useCanvasStore.setState({
				selectedElementIds: new Set(["el-1", "el-2"]),
			});
			useCanvasStore.getState().setReadOnly(true);
			expect(useCanvasStore.getState().selectedElementIds.size).toBe(0);
		});

		it("resets isDrawing when entering read-only", () => {
			useCanvasStore.setState({ isDrawing: true });
			useCanvasStore.getState().setReadOnly(true);
			expect(useCanvasStore.getState().isDrawing).toBe(false);
		});

		it("resets isDragging when entering read-only", () => {
			useCanvasStore.setState({ isDragging: true });
			useCanvasStore.getState().setReadOnly(true);
			expect(useCanvasStore.getState().isDragging).toBe(false);
		});

		it("resets isResizing when entering read-only", () => {
			useCanvasStore.setState({ isResizing: true });
			useCanvasStore.getState().setReadOnly(true);
			expect(useCanvasStore.getState().isResizing).toBe(false);
		});

		it("preserves current activeTool when unlocking", () => {
			useCanvasStore.setState({ activeTool: "rectangle" });
			useCanvasStore.getState().setReadOnly(true);
			expect(useCanvasStore.getState().activeTool).toBe("hand");

			// Unlocking should keep current tool (hand), not revert
			useCanvasStore.getState().setReadOnly(false);
			expect(useCanvasStore.getState().activeTool).toBe("hand");
		});

		it("does not clear elements on lock", () => {
			const elements = new Map([
				["el-1", { id: "el-1" } as unknown as CanvasElement],
				["el-2", { id: "el-2" } as unknown as CanvasElement],
			]);
			useCanvasStore.setState({ elements });
			useCanvasStore.getState().setReadOnly(true);
			expect(useCanvasStore.getState().elements.size).toBe(2);
		});
	});

	// ──────────────────────────────────────────────────────────────
	// 3. LOCALSTORAGE PERSISTENCE
	// ──────────────────────────────────────────────────────────────

	describe("localStorage Persistence", () => {
		it("persists lock state to localStorage when roomId is set", () => {
			useCanvasStore.setState({ roomId: "room-abc" });
			useCanvasStore.getState().setReadOnly(true);

			expect(localStorageMock.setItem).toHaveBeenCalledWith(
				"lekhaflow-lock-room-abc",
				"true",
			);
		});

		it("persists unlock state to localStorage", () => {
			useCanvasStore.setState({ roomId: "room-abc" });
			useCanvasStore.getState().setReadOnly(true);
			useCanvasStore.getState().setReadOnly(false);

			expect(localStorageMock.setItem).toHaveBeenLastCalledWith(
				"lekhaflow-lock-room-abc",
				"false",
			);
		});

		it("does NOT write to localStorage when roomId is null", () => {
			useCanvasStore.setState({ roomId: null });
			useCanvasStore.getState().setReadOnly(true);

			expect(localStorageMock.setItem).not.toHaveBeenCalled();
		});

		it("handles localStorage errors gracefully", () => {
			useCanvasStore.setState({ roomId: "room-err" });
			localStorageMock.setItem.mockImplementationOnce(() => {
				throw new Error("QuotaExceededError");
			});

			// Should not throw
			expect(() => {
				useCanvasStore.getState().setReadOnly(true);
			}).not.toThrow();

			// State should still update
			expect(useCanvasStore.getState().isReadOnly).toBe(true);
		});

		it("uses correct key format with room ID", () => {
			useCanvasStore.setState({ roomId: "my-room-123" });
			useCanvasStore.getState().setReadOnly(true);

			expect(localStorageMock.setItem).toHaveBeenCalledWith(
				"lekhaflow-lock-my-room-123",
				expect.any(String),
			);
		});
	});

	// ──────────────────────────────────────────────────────────────
	// 4. RAPID TOGGLE (STRESS)
	// ──────────────────────────────────────────────────────────────

	describe("Rapid Toggle", () => {
		it("handles rapid lock/unlock without corruption", () => {
			useCanvasStore.setState({ roomId: "rapid-room" });

			for (let i = 0; i < 50; i++) {
				useCanvasStore.getState().setReadOnly(i % 2 === 0);
			}

			// After 50 toggles (last i=49, 49%2=1 → false)
			expect(useCanvasStore.getState().isReadOnly).toBe(false);
		});
	});
});
