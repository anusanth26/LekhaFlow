/**
 * ============================================================================
 * SAVING STATUS — EDGE CASE TESTS
 * ============================================================================
 *
 * Tests for: savingStatus state transitions, setSavingStatus action.
 */

import type { CanvasElement } from "@repo/common";
import { beforeEach, describe, expect, it } from "vitest";
import type { SavingStatus } from "../store/canvas-store";
import { initialState, useCanvasStore } from "../store/canvas-store";

const resetStore = () => useCanvasStore.setState(initialState);

describe("Saving Status", () => {
	beforeEach(() => {
		resetStore();
	});

	// ──────────────────────────────────────────────────────────────
	// 1. DEFAULT STATE
	// ──────────────────────────────────────────────────────────────

	describe("Default State", () => {
		it("defaults to 'idle'", () => {
			expect(useCanvasStore.getState().savingStatus).toBe("idle");
		});
	});

	// ──────────────────────────────────────────────────────────────
	// 2. TRANSITIONS
	// ──────────────────────────────────────────────────────────────

	describe("Transitions", () => {
		it("transitions idle → saving", () => {
			useCanvasStore.getState().setSavingStatus("saving");
			expect(useCanvasStore.getState().savingStatus).toBe("saving");
		});

		it("transitions saving → saved", () => {
			useCanvasStore.getState().setSavingStatus("saving");
			useCanvasStore.getState().setSavingStatus("saved");
			expect(useCanvasStore.getState().savingStatus).toBe("saved");
		});

		it("transitions saving → error", () => {
			useCanvasStore.getState().setSavingStatus("saving");
			useCanvasStore.getState().setSavingStatus("error");
			expect(useCanvasStore.getState().savingStatus).toBe("error");
		});

		it("transitions error → saving (retry)", () => {
			useCanvasStore.getState().setSavingStatus("error");
			useCanvasStore.getState().setSavingStatus("saving");
			expect(useCanvasStore.getState().savingStatus).toBe("saving");
		});

		it("transitions saved → idle", () => {
			useCanvasStore.getState().setSavingStatus("saved");
			useCanvasStore.getState().setSavingStatus("idle");
			expect(useCanvasStore.getState().savingStatus).toBe("idle");
		});

		it("transitions error → idle (reset)", () => {
			useCanvasStore.getState().setSavingStatus("error");
			useCanvasStore.getState().setSavingStatus("idle");
			expect(useCanvasStore.getState().savingStatus).toBe("idle");
		});
	});

	// ──────────────────────────────────────────────────────────────
	// 3. ALL VALID VALUES
	// ──────────────────────────────────────────────────────────────

	describe("All Valid Values", () => {
		const validStatuses: SavingStatus[] = ["idle", "saving", "saved", "error"];

		for (const status of validStatuses) {
			it(`accepts status '${status}'`, () => {
				useCanvasStore.getState().setSavingStatus(status);
				expect(useCanvasStore.getState().savingStatus).toBe(status);
			});
		}
	});

	// ──────────────────────────────────────────────────────────────
	// 4. INDEPENDENCE FROM OTHER STATE
	// ──────────────────────────────────────────────────────────────

	describe("Independence from Other State", () => {
		it("does not affect activeTool", () => {
			useCanvasStore.setState({ activeTool: "rectangle" });
			useCanvasStore.getState().setSavingStatus("saving");
			expect(useCanvasStore.getState().activeTool).toBe("rectangle");
		});

		it("does not affect elements", () => {
			const elements = new Map([
				["el-1", { id: "el-1" } as unknown as CanvasElement],
			]);
			useCanvasStore.setState({ elements });
			useCanvasStore.getState().setSavingStatus("error");
			expect(useCanvasStore.getState().elements.size).toBe(1);
		});

		it("does not affect isReadOnly", () => {
			useCanvasStore.setState({ isReadOnly: true });
			useCanvasStore.getState().setSavingStatus("saving");
			expect(useCanvasStore.getState().isReadOnly).toBe(true);
		});

		it("does not affect zoom/scroll", () => {
			useCanvasStore.setState({ zoom: 2, scrollX: 100, scrollY: 200 });
			useCanvasStore.getState().setSavingStatus("saved");
			expect(useCanvasStore.getState().zoom).toBe(2);
			expect(useCanvasStore.getState().scrollX).toBe(100);
			expect(useCanvasStore.getState().scrollY).toBe(200);
		});
	});

	// ──────────────────────────────────────────────────────────────
	// 5. RAPID UPDATES
	// ──────────────────────────────────────────────────────────────

	describe("Rapid Updates", () => {
		it("handles rapid status changes correctly", () => {
			const { setSavingStatus } = useCanvasStore.getState();
			setSavingStatus("saving");
			setSavingStatus("saved");
			setSavingStatus("saving");
			setSavingStatus("error");
			setSavingStatus("saving");
			setSavingStatus("saved");

			expect(useCanvasStore.getState().savingStatus).toBe("saved");
		});
	});
});
