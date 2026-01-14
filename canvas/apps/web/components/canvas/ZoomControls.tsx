/**
 * ============================================================================
 * LEKHAFLOW - ZOOM CONTROLS
 * ============================================================================
 * 
 * Bottom-left zoom controls with zoom in/out and reset.
 */

"use client";

import React from "react";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { useCanvasStore } from "../../store/canvas-store";

export function ZoomControls() {
  const { zoom, setZoom, resetViewport } = useCanvasStore();

  const zoomIn = () => setZoom(Math.min(5, zoom * 1.2));
  const zoomOut = () => setZoom(Math.max(0.1, zoom / 1.2));

  return (
    <div className="absolute bottom-4 left-4 z-30">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-1.5 flex items-center gap-1">
        {/* Zoom Out */}
        <button
          onClick={zoomOut}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
          title="Zoom out (Ctrl -)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        {/* Zoom Level Display */}
        <button
          onClick={resetViewport}
          className="px-3 py-1.5 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-700 min-w-[60px] text-center transition-colors"
          title="Reset zoom"
        >
          {Math.round(zoom * 100)}%
        </button>

        {/* Zoom In */}
        <button
          onClick={zoomIn}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
          title="Zoom in (Ctrl +)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Fit to Screen */}
        <button
          onClick={resetViewport}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
          title="Fit to screen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
