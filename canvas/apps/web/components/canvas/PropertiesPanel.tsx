/**
 * ============================================================================
 * LEKHAFLOW - PROPERTIES PANEL
 * ============================================================================
 * 
 * Left sidebar for element styling properties.
 * 
 * Features:
 * - Stroke color picker
 * - Background color picker
 * - Stroke width selector
 * - Stroke style selector
 * - Opacity slider
 */

"use client";

import React from "react";
import { useCanvasStore } from "../../store/canvas-store";

// Simplified types to avoid circular imports
type StrokeStyle = "solid" | "dashed" | "dotted";

// ============================================================================
// COLOR PALETTES
// ============================================================================

const STROKE_COLORS = [
  "#1e1e1e", // Black
  "#e03131", // Red
  "#2f9e44", // Green
  "#1971c2", // Blue
  "#f08c00", // Orange
  "#9c36b5", // Purple
];

const BACKGROUND_COLORS = [
  "transparent",
  "#ffc9c9", // Light red
  "#b2f2bb", // Light green
  "#a5d8ff", // Light blue
  "#ffec99", // Light yellow
  "#eebefa", // Light purple
];

const STROKE_WIDTHS = [1, 2, 4, 8];

// ============================================================================
// COMPONENT
// ============================================================================

export function PropertiesPanel() {
  const {
    currentStrokeColor,
    currentBackgroundColor,
    currentStrokeWidth,
    currentStrokeStyle,
    currentOpacity,
    setStrokeColor,
    setBackgroundColor,
    setStrokeWidth,
    setStrokeStyle,
    setOpacity,
    selectedElementIds,
  } = useCanvasStore();

  const hasSelection = selectedElementIds.size > 0;

  return (
    <div className="absolute top-20 left-4 z-20">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 w-48 space-y-5">
        {/* Header */}
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {hasSelection ? "Selection" : "Style"}
        </div>

        {/* Stroke Color */}
        <div>
          <div className="text-xs font-medium text-gray-700 mb-2">Stroke</div>
          <div className="flex flex-wrap gap-2">
            {STROKE_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setStrokeColor(color)}
                className={`
                  w-7 h-7 rounded-lg border-2 transition-all duration-150
                  hover:scale-110 hover:shadow-md
                  ${currentStrokeColor === color
                    ? "border-violet-500 ring-2 ring-violet-200"
                    : "border-gray-200"
                  }
                `}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Background Color */}
        <div>
          <div className="text-xs font-medium text-gray-700 mb-2">Background</div>
          <div className="flex flex-wrap gap-2">
            {BACKGROUND_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setBackgroundColor(color)}
                className={`
                  w-7 h-7 rounded-lg border-2 transition-all duration-150
                  hover:scale-110 hover:shadow-md
                  ${currentBackgroundColor === color
                    ? "border-violet-500 ring-2 ring-violet-200"
                    : "border-gray-200"
                  }
                `}
                style={{
                  backgroundColor: color === "transparent" ? "white" : color,
                  backgroundImage:
                    color === "transparent"
                      ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
                      : "none",
                  backgroundSize: color === "transparent" ? "6px 6px" : "auto",
                  backgroundPosition:
                    color === "transparent" ? "0 0, 0 3px, 3px -3px, -3px 0px" : "0 0",
                }}
                title={color === "transparent" ? "Transparent" : color}
              />
            ))}
          </div>
        </div>

        {/* Stroke Width */}
        <div>
          <div className="text-xs font-medium text-gray-700 mb-2">Stroke width</div>
          <div className="flex gap-2">
            {STROKE_WIDTHS.map((width) => (
              <button
                key={width}
                onClick={() => setStrokeWidth(width)}
                className={`
                  w-9 h-9 rounded-lg border-2 flex items-center justify-center
                  transition-all duration-150
                  ${currentStrokeWidth === width
                    ? "border-violet-500 bg-violet-50"
                    : "border-gray-200 hover:border-gray-300"
                  }
                `}
                title={`${width}px`}
              >
                <div
                  className="bg-gray-800 rounded-full"
                  style={{
                    width: Math.max(4, width * 2),
                    height: Math.max(4, width * 2),
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Stroke Style */}
        <div>
          <div className="text-xs font-medium text-gray-700 mb-2">Stroke style</div>
          <div className="flex gap-2">
            {(["solid", "dashed", "dotted"] as StrokeStyle[]).map((style) => (
              <button
                key={style}
                onClick={() => setStrokeStyle(style)}
                className={`
                  flex-1 h-9 rounded-lg border-2 flex items-center justify-center
                  transition-all duration-150
                  ${currentStrokeStyle === style
                    ? "border-violet-500 bg-violet-50"
                    : "border-gray-200 hover:border-gray-300"
                  }
                `}
                title={style}
              >
                <svg width="24" height="2" viewBox="0 0 24 2">
                  <line
                    x1="0"
                    y1="1"
                    x2="24"
                    y2="1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={
                      style === "dashed" ? "6 4" : style === "dotted" ? "2 2" : "none"
                    }
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Opacity */}
        <div>
          <div className="text-xs font-medium text-gray-700 mb-2">
            Opacity: {currentOpacity}%
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={currentOpacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
        </div>
      </div>
    </div>
  );
}
