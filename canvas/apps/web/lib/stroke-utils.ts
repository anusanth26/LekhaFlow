/**
 * ============================================================================
 * LEKHAFLOW - STROKE UTILITIES (Perfect Freehand Integration)
 * ============================================================================
 *
 * Utilities for rendering smooth, pressure-sensitive freehand strokes.
 * Based on perfect-freehand algorithm - generates variable-width strokes.
 */

import getStroke from "perfect-freehand";

// ============================================================================
// TYPES
// ============================================================================

export interface StrokePoint {
	x: number;
	y: number;
	pressure?: number;
}

export interface StrokeOptions {
	size?: number;
	thinning?: number;
	smoothing?: number;
	streamline?: number;
	easing?: (t: number) => number;
	start?: {
		cap?: boolean;
		taper?: number | boolean;
		easing?: (t: number) => number;
	};
	end?: {
		cap?: boolean;
		taper?: number | boolean;
		easing?: (t: number) => number;
	};
	simulatePressure?: boolean;
	last?: boolean;
}

// ============================================================================
// SPEED & PRESSURE CALCULATION
// ============================================================================

/**
 * Calculate speed between two points for pressure simulation
 * Returns normalized speed value (0-1)
 */
export function calculateSpeed(
	point1: [number, number],
	point2: [number, number],
	timeDelta: number,
): number {
	if (timeDelta === 0) return 0.5;

	const dx = point2[0] - point1[0];
	const dy = point2[1] - point1[1];
	const distance = Math.sqrt(dx * dx + dy * dy);

	// Speed in pixels per millisecond
	const speed = distance / timeDelta;

	// Normalize: slow = 0.1, medium = 0.5, fast = 1.0
	// Clamp between 0.1 and 1.0
	return Math.max(0.1, Math.min(1.0, speed / 2));
}

// ============================================================================
// STROKE OPTIMIZATION
// ============================================================================

/**
 * Optimize stroke points by reducing redundant points
 */
export function optimizeStroke(
	points: Array<[number, number]>,
): Array<[number, number]> {
	if (points.length < 3) return points;

	const firstPoint = points[0];
	const lastPoint = points[points.length - 1];
	if (!firstPoint || !lastPoint) return points;

	const optimized: Array<[number, number]> = [firstPoint];
	const threshold = 2; // Minimum distance between points

	for (let i = 1; i < points.length - 1; i++) {
		const prev = optimized[optimized.length - 1];
		const curr = points[i];
		if (!prev || !curr) continue;
		const dist = Math.hypot(curr[0] - prev[0], curr[1] - prev[1]);

		if (dist >= threshold) {
			optimized.push(curr);
		}
	}

	// Always include the last point
	optimized.push(lastPoint);

	return optimized;
}

// ============================================================================
// PERFECT FREEHAND INTEGRATION
// ============================================================================

/**
 * Get stroke outline using perfect-freehand algorithm
 * Converts array of [x, y] points to smooth outline points
 */
export function getStrokeOutline(
	points: Array<[number, number]>,
	options: StrokeOptions = {},
): number[][] {
	const defaultOptions: StrokeOptions = {
		size: 16,
		thinning: 0.5,
		smoothing: 0.5,
		streamline: 0.5,
		simulatePressure: true,
		...options,
	};

	// Convert points to format expected by perfect-freehand
	const strokePoints = points.map(([x, y]) => [x, y, 0.5]);

	// Get outline from perfect-freehand
	const outline = getStroke(strokePoints, defaultOptions);

	return outline;
}

// ============================================================================
// PATH CONVERSION
// ============================================================================

/**
 * Convert outline to flat array for Konva Line component
 */
export function outlineToFlatArray(outline: number[][]): number[] {
	return outline.flat();
}

/**
 * Convert outline to SVG path data for Konva Path component
 * This creates smooth, variable-width strokes
 */
export function outlineToSvgPath(points: Array<[number, number]>): string {
	if (points.length === 0) return "";
	if (points.length === 1) {
		const point = points[0];
		if (!point) return "";
		const [x, y] = point;
		return `M ${x},${y} L ${x},${y}`;
	}

	// Get stroke outline from perfect-freehand
	const outline = getStrokeOutline(points);

	if (outline.length === 0) return "";
	const firstOutlinePoint = outline[0];
	if (!firstOutlinePoint) return "";

	// Build SVG path
	let pathData = `M ${firstOutlinePoint[0]},${firstOutlinePoint[1]}`;

	// Draw lines to each point
	for (let i = 1; i < outline.length; i++) {
		const outlinePoint = outline[i];
		if (!outlinePoint) continue;
		pathData += ` L ${outlinePoint[0]},${outlinePoint[1]}`;
	}

	// Close the path for filled stroke
	pathData += " Z";

	return pathData;
}
