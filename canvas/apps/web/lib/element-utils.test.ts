/**
 * Unit tests for element-utils.ts
 * Tests the createText function as required by GitHub Issue #15
 */

import { describe, expect, it } from "vitest";
import { createText } from "./element-utils";

describe("createText", () => {
	it("should create a text element with default options", () => {
		const text = createText(100, 200, "Hello World");

		expect(text.type).toBe("text");
		expect(text.x).toBe(100);
		expect(text.y).toBe(200);
		expect(text.text).toBe("Hello World");
		expect(text.originalText).toBe("Hello World");
		expect(text.fontSize).toBe(20); // default
		expect(text.fontFamily).toBe(1); // default
		expect(text.textAlign).toBe("left"); // default
		expect(text.verticalAlign).toBe("top"); // default
		expect(text.lineHeight).toBe(1.25); // default
		expect(text.containerId).toBeNull();
	});

	it("should create a text element with custom options", () => {
		const text = createText(50, 75, "Custom Text", {
			fontSize: 24,
			textAlign: "center",
			strokeColor: "#ff0000",
			opacity: 80,
		});

		expect(text.type).toBe("text");
		expect(text.x).toBe(50);
		expect(text.y).toBe(75);
		expect(text.text).toBe("Custom Text");
		expect(text.fontSize).toBe(24);
		expect(text.textAlign).toBe("center");
		expect(text.strokeColor).toBe("#ff0000");
		expect(text.opacity).toBe(80);
	});

	it("should estimate width based on text length and font size", () => {
		const shortText = createText(0, 0, "Hi");
		const longText = createText(0, 0, "Hello World! This is a longer string");

		expect(longText.width).toBeGreaterThan(shortText.width);
	});

	it("should handle multi-line text", () => {
		const singleLine = createText(0, 0, "One line");
		const multiLine = createText(0, 0, "Line 1\nLine 2\nLine 3");

		expect(multiLine.height).toBeGreaterThan(singleLine.height);
	});

	it("should generate a unique ID", () => {
		const text1 = createText(0, 0, "Text 1");
		const text2 = createText(0, 0, "Text 2");

		expect(text1.id).toBeDefined();
		expect(text2.id).toBeDefined();
		expect(text1.id).not.toBe(text2.id);
	});

	it("should have correct default stroke and fill properties", () => {
		const text = createText(0, 0, "Test");

		expect(text.opacity).toBeDefined();
		expect(text.strokeColor).toBeDefined();
	});

	it("should set empty text correctly", () => {
		const text = createText(100, 100, "");

		expect(text.text).toBe("");
		expect(text.originalText).toBe("");
	});

	it("should preserve special characters in text", () => {
		const special = createText(0, 0, "Hello 🎨 World! @#$%");

		expect(special.text).toBe("Hello 🎨 World! @#$%");
		expect(special.originalText).toBe("Hello 🎨 World! @#$%");
	});
});
