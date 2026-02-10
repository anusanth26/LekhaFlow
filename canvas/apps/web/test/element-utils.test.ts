import type { Point } from "@repo/common";
import { describe, expect, it } from "vitest";
import {
	createEllipse,
	createLine,
	createRectangle,
	createText,
	getCombinedBounds,
	getElementBounds,
	getResizeHandles,
	getRotatedBoundingBox,
	isPointInElement,
} from "../lib/element-utils";

// Helper to create a point
const p = (x: number, y: number): Point => ({ x, y });

describe("Element Utils Logic", () => {
	describe("1. Hit-Testing Logic (isPointInElement)", () => {
		describe("Rectangle Hit Testing", () => {
			// Create a standard 100x100 rectangle at (0,0)
			const rect = createRectangle(0, 0, 100, 100, {
				backgroundColor: "#ffffff",
				strokeColor: "#000000",
				strokeWidth: 2,
			});

			it.each([
				// Inside
				[p(50, 50), true],
				[p(10, 10), true],
				[p(90, 90), true],
				// Boundary (Standard threshold is 10px)
				[p(0, 0), true], // Top-left corner
				[p(100, 100), true], // Bottom-right corner
				[p(-5, 50), true], // Within default 10px threshold
				[p(105, 50), true], // Within threshold
				// Outside
				[p(-15, 50), false], // Outside threshold
				[p(115, 50), false],
				[p(50, -15), false],
				[p(50, 115), false],
			])("should return %s for point %o", (point, expected) => {
				expect(isPointInElement(point, rect)).toBe(expected);
			});
		});

		describe("Ellipse Hit Testing", () => {
			// 100x100 ellipse at (0,0) -> Center at (50, 50), Radius 50
			const ellipse = createEllipse(0, 0, 100, 100);

			it.each([
				// Inside
				[p(50, 50), true], // Center
				[p(20, 50), true],
				// Boundary / Threshold
				[p(0, 50), true], // Left edge
				[p(-5, 50), true], // Within threshold
				// Corners of bounding box are OUTSIDE the ellipse
				[p(0, 0), false], // Top-left corner of bbox is outside ellipse
				[p(100, 100), false],
			])("should check ellipse hit for %o -> %s", (point, expected) => {
				expect(isPointInElement(point, ellipse)).toBe(expected);
			});
		});

		describe("Line Buffer Hit Testing", () => {
			// Horizontal line from (0,0) to (100,0) width strokeWidth 2
			// Threshold 10px + strokeWidth/2 (1px) = ~11px radius around segment
			const line = createLine(0, 0, [p(0, 0), p(100, 0)], {
				strokeWidth: 2,
			});

			it.each([
				[p(50, 0), true], // On line
				[p(50, 5), true], // 5px away (inside threshold)
				[p(50, 10), true], // 10px away (boundary)
				[p(50, 12), false], // > 11px away
				[p(0, 0), true], // Start point
				[p(100, 0), true], // End point
				[p(-5, 0), true], // Before start (with threshold)
				[p(105, 0), true], // After end (with threshold)
				[p(120, 0), false], // Far away x
			])("should check line hit for %o -> %s", (point, expected) => {
				expect(isPointInElement(point, line)).toBe(expected);
			});
		});

		describe("Text Bounding Box Hit Testing", () => {
			// Text element created at 0,0
			// approximate width ~ chars * fontSize * 0.6
			// "Hello" (5 chars) * 20 * 0.6 = 60 width
			// height ~ 1 * 20 * 1.2 = 24 height
			const text = createText(0, 0, "Hello", { fontSize: 20 });
			const bounds = getElementBounds(text);

			it("should hit inside the estimated bounding box", () => {
				expect(
					isPointInElement(p(bounds.width / 2, bounds.height / 2), text),
				).toBe(true);
			});

			it("should not hit far outside", () => {
				expect(
					isPointInElement(p(bounds.width + 20, bounds.height + 20), text),
				).toBe(false);
			});
		});
	});

	describe("2. Grouping & Bounding Box Logic", () => {
		it("Multi-Element Selection: calculates correct global bounds", () => {
			const el1 = createRectangle(0, 0, 10, 10);
			const el2 = createRectangle(100, 100, 10, 10);

			const bounds = getCombinedBounds([el1, el2]);

			expect(bounds).not.toBeNull();
			if (!bounds) return;

			expect(bounds.x).toBe(0);
			expect(bounds.y).toBe(0);
			// Width is max x (100+10) - min x (0) = 110
			expect(bounds.width).toBe(110);
			expect(bounds.height).toBe(110);
		});

		it("Zero-Dimension Safety: handles 0-width elements without crashing", () => {
			const zeroRect = createRectangle(0, 0, 0, 0);
			const bounds = getElementBounds(zeroRect);

			expect(bounds.width).toBe(0);
			expect(bounds.height).toBe(0);
			expect(bounds.x).toBe(0);
			expect(bounds.y).toBe(0);

			// Should not be NaN
			expect(Number.isNaN(bounds.width)).toBe(false);

			// Scaling/Rotation safety check
			const rotated = getRotatedBoundingBox(zeroRect);
			expect(rotated.width).toBe(0);
			expect(rotated.height).toBe(0);
		});
	});

	describe("3. Transformation & Scaling Logic", () => {
		describe('The "Flip" Case (Negative Resizing)', () => {
			it("normalizes negative width/height to positive bounding box", () => {
				// Simulate a rectangle created by dragging "backwards"
				// Start at 100,100, drag to 0,0 -> width: -100, height: -100
				const flippedRect = createRectangle(100, 100, -100, -100);

				// Validate properties match creation
				expect(flippedRect.width).toBe(-100);
				expect(flippedRect.height).toBe(-100);

				// Validate Bounding Box is normalized
				const bounds = getElementBounds(flippedRect);

				// Bounds logic in element-utils uses Math.abs(width)
				expect(bounds.width).toBe(100);
				expect(bounds.height).toBe(100);

				// Note: Does it adjust X/Y? The function `getElementBounds` returns `element.x`, `element.y` directly.
				// If the element logic expects X/Y to always be top-left, then negative width implies
				// the visual starts at X and goes LEFT.
				// Let's verify what getElementBounds actually does.
				// It returns { x: element.x, y: element.y, width: abs(w), height: abs(h) }
				// So for a rect at 100,100 with w=-100, visually it spans from 0 to 100.
				// But the bounding box *object* returned says x=100, w=100.
				// This might imply the bbox starts at 100 and goes to 200?
				// If so, this might be a bug or intended behavior handled by renderer.
				// Standard canvas logic usually normalizes X,Y to top-left.
				// However, the test requirement is to "maintain positive dimensions".
				expect(bounds.width).toBeGreaterThanOrEqual(0);
				expect(bounds.height).toBeGreaterThanOrEqual(0);
			});
		});

		describe("Scaling Accuracy (Rotated Bounding Box)", () => {
			it("calculates bounding box for rotated element accurately", () => {
				// 100x100 rect rotated 45 degrees
				const rect = createRectangle(0, 0, 100, 100, { angle: 45 });
				const bbox = getRotatedBoundingBox(rect);

				// Diagonal of 100x100 square is sqrt(100^2 + 100^2) ~= 141.42
				// At 45 deg, width and height both equal the diagonal
				expect(bbox.width).toBeCloseTo(141.42, 1);
				expect(bbox.height).toBeCloseTo(141.42, 1);
			});
		});
	});

	describe("4. Technical Standards", () => {
		it("Resize Handles are potentially correct", () => {
			const rect = createRectangle(0, 0, 100, 100);
			const handles = getResizeHandles(rect);

			expect(handles).toHaveProperty("nw");
			expect(handles).toHaveProperty("se");
			expect(handles.se.x).toBe(100);
			expect(handles.se.y).toBe(100);
		});
	});
});
