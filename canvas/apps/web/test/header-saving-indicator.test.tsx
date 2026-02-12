/**
 * ============================================================================
 * HEADER NAVIGATION & SAVING STATUS INDICATOR — UI TESTS
 * ============================================================================
 *
 * Tests for: Back button navigation, SavingStatusIndicator rendering
 * for each status value, menu open/close.
 */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initialState, useCanvasStore } from "../store/canvas-store";

// ──────────────────────────────────────────────────────────────
// MOCKS
// ──────────────────────────────────────────────────────────────

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: pushMock,
		back: vi.fn(),
		forward: vi.fn(),
		replace: vi.fn(),
		refresh: vi.fn(),
		prefetch: vi.fn(),
	}),
}));

vi.mock("../lib/supabase.client", () => ({
	supabase: {
		auth: {
			getSession: vi.fn().mockResolvedValue({
				data: { session: null },
			}),
		},
	},
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => {
	const icon =
		(name: string) => (_props: { size?: number; className?: string }) => (
			<span data-testid={`icon-${name}`} />
		);
	return {
		ArrowLeft: icon("ArrowLeft"),
		Check: icon("Check"),
		Cloud: icon("Cloud"),
		CloudOff: icon("CloudOff"),
		Copy: icon("Copy"),
		Download: icon("Download"),
		FileText: icon("FileText"),
		FolderOpen: icon("FolderOpen"),
		Image: icon("Image"),
		Link2: icon("Link2"),
		Loader2: icon("Loader2"),
		Mail: icon("Mail"),
		Menu: icon("Menu"),
		Plus: icon("Plus"),
		QrCode: icon("QrCode"),
		Save: icon("Save"),
		Settings: icon("Settings"),
		Share2: icon("Share2"),
		Trash2: icon("Trash2"),
		Users: icon("Users"),
		X: icon("X"),
	};
});

// Use dynamic import so mocks are in place first
const { SavingStatusIndicator } = await import("../components/canvas/Header");

const resetStore = () => useCanvasStore.setState(initialState);

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
		key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
	};
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

describe("SavingStatusIndicator", () => {
	beforeEach(() => {
		resetStore();
	});

	afterEach(() => {
		cleanup();
	});

	// ──────────────────────────────────────────────────────────────
	// 1. RENDER FOR EACH STATUS
	// ──────────────────────────────────────────────────────────────

	describe("Render per Status", () => {
		it("renders nothing for 'idle' status", () => {
			useCanvasStore.setState({ savingStatus: "idle" });
			const { container } = render(<SavingStatusIndicator />);
			expect(container.innerHTML).toBe("");
		});

		it("renders 'Saving...' for 'saving' status", () => {
			useCanvasStore.setState({ savingStatus: "saving" });
			render(<SavingStatusIndicator />);
			expect(screen.getByText("Saving...")).toBeDefined();
		});

		it("renders 'Saved' for 'saved' status", () => {
			useCanvasStore.setState({ savingStatus: "saved" });
			render(<SavingStatusIndicator />);
			expect(screen.getByText("Saved")).toBeDefined();
		});

		it("renders 'Save failed' for 'error' status", () => {
			useCanvasStore.setState({ savingStatus: "error" });
			render(<SavingStatusIndicator />);
			expect(screen.getByText("Save failed")).toBeDefined();
		});
	});

	// ──────────────────────────────────────────────────────────────
	// 2. CORRECT ICON PER STATUS
	// ──────────────────────────────────────────────────────────────

	describe("Correct Icon per Status", () => {
		it("shows Loader2 icon for 'saving'", () => {
			useCanvasStore.setState({ savingStatus: "saving" });
			render(<SavingStatusIndicator />);
			expect(screen.getByTestId("icon-Loader2")).toBeDefined();
		});

		it("shows Cloud icon for 'saved'", () => {
			useCanvasStore.setState({ savingStatus: "saved" });
			render(<SavingStatusIndicator />);
			expect(screen.getByTestId("icon-Cloud")).toBeDefined();
		});

		it("shows CloudOff icon for 'error'", () => {
			useCanvasStore.setState({ savingStatus: "error" });
			render(<SavingStatusIndicator />);
			expect(screen.getByTestId("icon-CloudOff")).toBeDefined();
		});
	});

	// ──────────────────────────────────────────────────────────────
	// 3. STATUS TRANSITIONS RE-RENDERS
	// ──────────────────────────────────────────────────────────────

	describe("Status Transition Re-Renders", () => {
		it("updates text when status transitions saving → saved", () => {
			useCanvasStore.setState({ savingStatus: "saving" });
			const { rerender } = render(<SavingStatusIndicator />);
			expect(screen.getByText("Saving...")).toBeDefined();

			useCanvasStore.setState({ savingStatus: "saved" });
			rerender(<SavingStatusIndicator />);
			expect(screen.getByText("Saved")).toBeDefined();
		});

		it("disappears when transitioning to idle", () => {
			useCanvasStore.setState({ savingStatus: "saved" });
			const { container, rerender } = render(<SavingStatusIndicator />);
			expect(container.innerHTML).not.toBe("");

			useCanvasStore.setState({ savingStatus: "idle" });
			rerender(<SavingStatusIndicator />);
			expect(container.innerHTML).toBe("");
		});
	});

	// ──────────────────────────────────────────────────────────────
	// 4. TEXT COLOR CLASSES
	// ──────────────────────────────────────────────────────────────

	describe("Text Color Classes", () => {
		it("uses amber for 'saving'", () => {
			useCanvasStore.setState({ savingStatus: "saving" });
			render(<SavingStatusIndicator />);
			const text = screen.getByText("Saving...");
			expect(text.className).toContain("text-amber-600");
		});

		it("uses green for 'saved'", () => {
			useCanvasStore.setState({ savingStatus: "saved" });
			render(<SavingStatusIndicator />);
			const text = screen.getByText("Saved");
			expect(text.className).toContain("text-green-600");
		});

		it("uses red for 'error'", () => {
			useCanvasStore.setState({ savingStatus: "error" });
			render(<SavingStatusIndicator />);
			const text = screen.getByText("Save failed");
			expect(text.className).toContain("text-red-600");
		});
	});
});
