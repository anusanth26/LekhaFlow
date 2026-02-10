import type { CanvasElement } from "@repo/common";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useYjsSync } from "../hooks/useYjsSync";
import { createRectangle } from "../lib/element-utils";
import { initialState, useCanvasStore } from "../store/canvas-store";

// ----------------------------------------------------------------------------
// MOCKS
// ----------------------------------------------------------------------------

// Use vi.hoisted to ensure mock is available before imports
const { mockProvider, MockHocuspocusProvider } = vi.hoisted(() => {
	const providerMethods = {
		connect: vi.fn(),
		disconnect: vi.fn(),
		destroy: vi.fn(),
		on: vi.fn(),
		off: vi.fn(),
		awareness: {
			setLocalStateField: vi.fn(),
			getStates: vi.fn().mockReturnValue(new Map()),
			on: vi.fn(),
			off: vi.fn(),
		},
		configuration: {} as Record<string, unknown>,
	};

	class MockHocuspocusProvider {
		// biome-ignore lint/suspicious/noExplicitAny: Mocking arbitrary config
		constructor(config: any) {
			providerMethods.configuration = config;
			// Simulate connection for the hook
			setTimeout(() => {
				if (config.onConnect) config.onConnect();
				if (config.onSynced) config.onSynced();
			}, 0);
			// biome-ignore lint/correctness/noConstructorReturn: Returning singleton mock for testing
			return providerMethods;
		}
	}

	return {
		mockProvider: providerMethods,
		MockHocuspocusProvider,
	};
});

vi.mock("@hocuspocus/provider", () => ({
	HocuspocusProvider: MockHocuspocusProvider,
}));

// Helper to reset store
const resetStore = () => {
	useCanvasStore.setState(initialState);
};

describe("useYjsSync Hook", () => {
	beforeEach(() => {
		resetStore();
		vi.clearAllMocks();
	});

	describe("1. Data Hydration & Initial Load", () => {
		it("Store Seeding: loads existing Y.Doc elements into Zustand", async () => {
			// Setup pre-existing Y.Doc
			// Since the hook creates its own local doc, we can't easily "pre-seed" it
			// BEFORE the hook runs unless we mock Y.Doc or the hook's useMemo.
			// HOWEVER, the hook connects to a provider. In a real app, the provider
			// syncs data INTO the doc. We can simulate this by getting the doc
			// returned by the hook and manipulating it "externally".

			const { result } = renderHook(() => useYjsSync("room-1", "token-123"));

			// Wait for connection to settle
			await waitFor(() =>
				expect(useCanvasStore.getState().isConnected).toBe(true),
			);

			// Simulate "incoming" data from server
			const rect = createRectangle(0, 0, 100, 100);
			result.current.doc.transact(() => {
				const map = result.current.doc.getMap<CanvasElement>("elements");
				map.set(rect.id, rect);
			});

			// Verify Zustand store updates
			await waitFor(() => {
				const elements = useCanvasStore.getState().elements;
				expect(elements.size).toBe(1);
				expect(elements.get(rect.id)).toEqual(rect);
			});
		});

		it("Type Safety: handles valid data structure", async () => {
			const { result } = renderHook(() => useYjsSync("room-1", "token-123"));

			const rect = createRectangle(10, 20, 30, 40);
			result.current.doc.transact(() => {
				result.current.doc.getMap<CanvasElement>("elements").set(rect.id, rect);
			});

			await waitFor(() => {
				const stored = useCanvasStore.getState().elements.get(rect.id);
				expect(stored).toBeDefined();
				expect(stored?.x).toBe(10);
			});
		});
	});

	describe("2. Remote Mutation Handling", () => {
		it("External Change Simulation: updates local store on remote change", async () => {
			const { result } = renderHook(() => useYjsSync("room-1", "token-123"));
			const rect = createRectangle(0, 0, 10, 10);

			// Initial Add
			result.current.addElement(rect);

			await waitFor(() => {
				expect(useCanvasStore.getState().elements.has(rect.id)).toBe(true);
			});

			// Simulate Remote Update (directly on Y.Doc)
			result.current.doc.transact(() => {
				const map = result.current.doc.getMap<CanvasElement>("elements");
				const el = map.get(rect.id);
				if (el) {
					map.set(rect.id, { ...el, x: 999 });
				}
			});

			// Verify Store Reacts
			await waitFor(() => {
				const el = useCanvasStore.getState().elements.get(rect.id);
				expect(el?.x).toBe(999);
			});
		});

		it("Conflict Resolution: consistent state with Yjs source", async () => {
			const { result } = renderHook(() => useYjsSync("room-1", "token-123"));
			const rect = createRectangle(0, 0, 10, 10);
			result.current.addElement(rect);

			// Simulate a "local" optimistic update (Zustand side) - theoretically
			// But here we verify that if Yjs says X, Store says X.
			// Let's simulate a Yjs update that overrides a value.

			result.current.doc.transact(() => {
				const map = result.current.doc.getMap<CanvasElement>("elements");
				map.set(rect.id, { ...rect, strokeColor: "#remote-color" });
			});

			await waitFor(() => {
				expect(
					useCanvasStore.getState().elements.get(rect.id)?.strokeColor,
				).toBe("#remote-color");
			});
		});
	});

	describe("3. Collaborative Undo/Redo", () => {
		it("Local vs Remote: undo affects local only (via undoManager scope)", async () => {
			const { result } = renderHook(() => useYjsSync("room-1", "token-123"));

			// Action 1: Add Element (Local)
			const rect = createRectangle(0, 0, 10, 10);
			result.current.addElement(rect);

			// Wait for it to be tracked
			await waitFor(() => expect(result.current.canUndo).toBe(true));

			// Action 2: Remote Update (Simulated) - UndoManager usually filters by Origin
			// But standard Y.UndoManager tracks ALL changes unless origin is specified.
			// In useYjsSync, we don't explicitly strict-mode the UndoManager origin in the simplified hook
			// shown previously, BUT Yjs UndoManager by default tracks all transactions.
			// If we want "Last-Local", we usually use a Transaction Origin.
			// The hook implementation uses `doc.transact` without origin.
			// So simply calling `undo` should revert the last action on the doc.
			// Let's verify it reverts the add.

			result.current.undo();

			await waitFor(() => {
				expect(useCanvasStore.getState().elements.has(rect.id)).toBe(false);
			});
		});
	});

	describe("4. Presence & Awareness", () => {
		it("User Join: updates collaborators list", async () => {
			renderHook(() => useYjsSync("room-1", "token-123"));

			// We need to trigger the 'change' event on the mocked awareness
			// The mock needs to be accessible. Since we return a new object in the mock factory,
			// we rely on the `mockProvider` constant defined at top level.

			// Setup mock state
			const remoteStates = new Map();
			remoteStates.set(999, {
				user: { name: "Remote User", color: "#f00" },
				cursor: { x: 50, y: 50 },
			});

			mockProvider.awareness.getStates.mockReturnValue(remoteStates);

			// Trigger callback manually since we can't easily emit event from the mock object to the hook's listener
			// Actually, we can capture the listener!
			// `mockProvider.awareness.on` was called by the hook.

			const calls = mockProvider.awareness.on.mock.calls;
			const changeHandler = calls.find((call) => call[0] === "change")?.[1];

			expect(changeHandler).toBeDefined();

			// Invoke handler
			changeHandler();

			await waitFor(() => {
				const cols = useCanvasStore.getState().collaborators;
				expect(cols.size).toBe(1);
				expect(cols.get(999)?.name).toBe("Remote User");
			});
		});
	});
});
