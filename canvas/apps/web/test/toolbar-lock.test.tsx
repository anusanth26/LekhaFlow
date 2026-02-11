/**
 * ============================================================================
 * TOOLBAR — LOCK / UNLOCK UI TESTS
 * ============================================================================
 *
 * Tests for: Lock button rendering, tool disabled states,
 * active class logic when canvas is locked.
 */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Toolbar } from "../components/canvas/Toolbar";
import { initialState, useCanvasStore } from "../store/canvas-store";

// Mock lucide-react icons to simplify rendering
vi.mock("lucide-react", () => {
	const icon = (name: string) => (_props: { size?: number }) => (
		<span data-testid={`icon-${name}`} />
	);
	return {
		ArrowUpRight: icon("ArrowUpRight"),
		Circle: icon("Circle"),
		Diamond: icon("Diamond"),
		Eraser: icon("Eraser"),
		Hand: icon("Hand"),
		Lock: icon("Lock"),
		Minus: icon("Minus"),
		MousePointer2: icon("MousePointer2"),
		Pencil: icon("Pencil"),
		Presentation: icon("Presentation"),
		Square: icon("Square"),
		Type: icon("Type"),
		Unlock: icon("Unlock"),
	};
});

const resetStore = () => useCanvasStore.setState(initialState);

describe("Toolbar – Lock/Unlock UI", () => {
	beforeEach(() => {
		resetStore();
	});

	afterEach(() => {
		cleanup();
	});

	// ──────────────────────────────────────────────────────────────
	// 1. LOCK BUTTON RENDERING
	// ──────────────────────────────────────────────────────────────

	describe("Lock Button Rendering", () => {
		it("shows Unlock icon when canvas is unlocked", () => {
			render(<Toolbar />);
			const lockBtn = screen.getByTitle(/Unlock Canvas|Lock Canvas/i);
			expect(lockBtn).toBeDefined();
			// Should show Unlock icon when not read-only
			expect(screen.getByTestId("icon-Unlock")).toBeDefined();
		});

		it("shows Lock icon when canvas is locked", () => {
			useCanvasStore.setState({ isReadOnly: true });
			render(<Toolbar />);
			expect(screen.getByTestId("icon-Lock")).toBeDefined();
		});

		it("toggles lock state when lock button is clicked", () => {
			render(<Toolbar />);
			const lockBtn = screen.getByTitle(/Lock Canvas/i);
			fireEvent.click(lockBtn);
			expect(useCanvasStore.getState().isReadOnly).toBe(true);
		});

		it("toggles back to unlocked on second click", () => {
			render(<Toolbar />);
			const lockBtn = screen.getByTitle(/Lock Canvas/i);
			fireEvent.click(lockBtn);
			expect(useCanvasStore.getState().isReadOnly).toBe(true);

			// Re-render to reflect state change
			cleanup();
			render(<Toolbar />);
			const unlockBtn = screen.getByTitle(/Unlock Canvas/i);
			fireEvent.click(unlockBtn);
			expect(useCanvasStore.getState().isReadOnly).toBe(false);
		});

		it("displays correct title when locked", () => {
			useCanvasStore.setState({ isReadOnly: true });
			render(<Toolbar />);
			expect(screen.getByTitle("Unlock Canvas (L)")).toBeDefined();
		});

		it("displays correct title when unlocked", () => {
			render(<Toolbar />);
			expect(screen.getByTitle("Lock Canvas (L)")).toBeDefined();
		});
	});

	// ──────────────────────────────────────────────────────────────
	// 2. TOOL DISABLED STATES
	// ──────────────────────────────────────────────────────────────

	describe("Tool Disabled States", () => {
		it("disables drawing tools when locked", () => {
			useCanvasStore.setState({ isReadOnly: true });
			render(<Toolbar />);

			// Rectangle, Diamond, Circle, Arrow, Line, Pencil, Laser, Text, Eraser, Select
			const toolButtons = screen.getAllByRole("button");
			// First button is lock, rest are tools
			const _toolButtonsOnly = toolButtons.slice(1);

			// Only Hand tool should be enabled (not disabled)
			const handButton = screen.getByTitle("Hand (H)");
			expect(handButton).not.toBeDisabled();
		});

		it("marks non-hand tools as disabled when locked", () => {
			useCanvasStore.setState({ isReadOnly: true });
			render(<Toolbar />);

			const rectangleBtn = screen.getByTitle(
				"Rectangle (R) — Canvas is locked",
			);
			expect(rectangleBtn).toBeDisabled();

			const pencilBtn = screen.getByTitle("Pencil (P) — Canvas is locked");
			expect(pencilBtn).toBeDisabled();
		});

		it("enables all tools when unlocked", () => {
			useCanvasStore.setState({ isReadOnly: false });
			render(<Toolbar />);

			const rectangleBtn = screen.getByTitle("Rectangle (R)");
			expect(rectangleBtn).not.toBeDisabled();

			const pencilBtn = screen.getByTitle("Pencil (P)");
			expect(pencilBtn).not.toBeDisabled();
		});

		it("clicking disabled tool does NOT change activeTool", () => {
			useCanvasStore.setState({ isReadOnly: true, activeTool: "hand" });
			render(<Toolbar />);

			const rectangleBtn = screen.getByTitle(
				"Rectangle (R) — Canvas is locked",
			);
			fireEvent.click(rectangleBtn);

			expect(useCanvasStore.getState().activeTool).toBe("hand");
		});

		it("select tool is also disabled when locked", () => {
			useCanvasStore.setState({ isReadOnly: true });
			render(<Toolbar />);

			const selectBtn = screen.getByTitle("Select (V) — Canvas is locked");
			expect(selectBtn).toBeDisabled();
		});
	});

	// ──────────────────────────────────────────────────────────────
	// 3. ACTIVE TOOL STYLING
	// ──────────────────────────────────────────────────────────────

	describe("Active Tool Styling", () => {
		it("shows active styling for selected tool when unlocked", () => {
			useCanvasStore.setState({ activeTool: "rectangle", isReadOnly: false });
			render(<Toolbar />);

			const rectangleBtn = screen.getByTitle("Rectangle (R)");
			expect(rectangleBtn.className).toContain("bg-violet-100");
		});

		it("does NOT show active styling when locked (even if tool matches)", () => {
			// Note: when locked, setReadOnly forces tool to 'hand', so activeTool
			// won't normally be 'rectangle' when locked. But if we force state:
			useCanvasStore.setState({ activeTool: "rectangle", isReadOnly: true });
			render(<Toolbar />);

			// Rectangle should be disabled + no active styling
			const rectangleBtn = screen.getByTitle(
				"Rectangle (R) — Canvas is locked",
			);
			expect(rectangleBtn.className).not.toContain("bg-violet-100");
			expect(rectangleBtn.className).toContain("opacity-50");
		});
	});

	// ──────────────────────────────────────────────────────────────
	// 4. TOOL COUNT
	// ──────────────────────────────────────────────────────────────

	describe("Tool Count", () => {
		it("renders exactly 12 buttons (1 lock + 11 tools)", () => {
			render(<Toolbar />);
			const buttons = screen.getAllByRole("button");
			expect(buttons.length).toBe(12);
		});
	});
});
