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
 * Calculate perpendicular distance from point to line segment
 */
function perpendicularDistance(
	point: [number, number],
	lineStart: [number, number],
	lineEnd: [number, number],
): number {
	const [px, py] = point;
	const [x1, y1] = lineStart;
	const [x2, y2] = lineEnd;

	const dx = x2 - x1;
	const dy = y2 - y1;

	if (dx === 0 && dy === 0) {
		return Math.hypot(px - x1, py - y1);
	}

	const t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);
	const projX = x1 + Math.max(0, Math.min(1, t)) * dx;
	const projY = y1 + Math.max(0, Math.min(1, t)) * dy;

	return Math.hypot(px - projX, py - projY);
}

/**
 * Ramer-Douglas-Peucker algorithm for path simplification
 * Reduces point count while preserving shape
 *
 * @param points - Array of points to simplify
 * @param epsilon - Maximum distance threshold (higher = more aggressive)
 * @returns Simplified points array
 */
export function simplifyPath(
	points: Array<[number, number]>,
	epsilon = 2.0,
): Array<[number, number]> {
	if (points.length < 3) return points;

	const firstPoint = points[0];
	const lastPoint = points[points.length - 1];
	if (!firstPoint || !lastPoint) return points;

	// Find point with maximum distance from line
	let maxDistance = 0;
	let maxIndex = 0;

	for (let i = 1; i < points.length - 1; i++) {
		const point = points[i];
		if (!point) continue;
		const distance = perpendicularDistance(point, firstPoint, lastPoint);
		if (distance > maxDistance) {
			maxDistance = distance;
			maxIndex = i;
		}
	}

	// If max distance is greater than epsilon, recursively simplify
	if (maxDistance > epsilon) {
		const left = simplifyPath(points.slice(0, maxIndex + 1), epsilon);
		const right = simplifyPath(points.slice(maxIndex), epsilon);
		return [...left.slice(0, -1), ...right];
	}

	// Return only endpoints
	return [firstPoint, lastPoint];
}

/**
 * Optimize stroke points by reducing redundant points
 * Simple distance-based optimization
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
 * Converts array of [x, y] or [x, y, pressure] points to smooth outline points
 */
export function getStrokeOutline(
	points: Array<[number, number]> | Array<[number, number, number]>,
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
	// If pressure is already included, use it; otherwise default to 0.5
	const strokePoints = points.map((p) =>
		p.length === 3 ? [p[0], p[1], p[2]] : [p[0], p[1], 0.5],
	);

	// Get outline from perfect-freehand
	const outline = getStroke(strokePoints, defaultOptions);

	return outline;
}

/**
 * Calculate pressure based on drawing speed
 * Faster drawing = lower pressure (thinner), slower = higher pressure (thicker)
 *
 * @param points - Array of points with timestamps
 * @returns Array of points with calculated pressure [x, y, pressure]
 */
export function calculatePressureFromSpeed(
	points: Array<[number, number, number]>, // [x, y, timestamp]
): Array<[number, number, number]> {
	if (points.length === 0) return [];
	if (points.length === 1) {
		const p = points[0];
		if (!p) return [];
		return [[p[0], p[1], 0.5]];
	}

	const result: Array<[number, number, number]> = [];

	// First point gets default pressure
	const first = points[0];
	if (first) result.push([first[0], first[1], 0.5]);

	for (let i = 1; i < points.length; i++) {
		const prev = points[i - 1];
		const curr = points[i];
		if (!prev || !curr) continue;

		const dx = curr[0] - prev[0];
		const dy = curr[1] - prev[1];
		const dt = curr[2] - prev[2];

		const distance = Math.sqrt(dx * dx + dy * dy);
		const speed = dt > 0 ? distance / dt : 0;

		// Speed normalization: 0-1 range
		// Lower speed (< 0.5) = higher pressure (thicker)
		// Higher speed (> 0.5) = lower pressure (thinner)
		const normalizedSpeed = Math.min(1, speed / 2);
		const pressure = 1 - normalizedSpeed * 0.6; // Range: 0.4 to 1.0

		result.push([curr[0], curr[1], pressure]);
	}

	return result;
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
 *
 * @param points - Array of [x, y] or [x, y, pressure] points
 * @param options - Stroke options (size, thinning, etc.)
 */
export function outlineToSvgPath(
	points: Array<[number, number]> | Array<[number, number, number]>,
	options?: StrokeOptions,
): string {
	if (points.length === 0) return "";
	if (points.length === 1) {
		const point = points[0];
		if (!point) return "";
		const [x, y] = point;
		return `M ${x},${y} L ${x},${y}`;
	}

	// Get stroke outline from perfect-freehand
	const outline = getStrokeOutline(points, options);

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
