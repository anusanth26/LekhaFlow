/**
 * ============================================================================
 * LEKHAFLOW - ZOOM CONTROLS
 * ============================================================================
 *
 * Bottom-center zoom controls with zoom in/out and reset.
 */

"use client";

import { Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import { useCanvasStore } from "../../store/canvas-store";

export function ZoomControls() {
	const { zoom, setZoom, resetViewport } = useCanvasStore();

	const zoomIn = () => setZoom(Math.min(5, zoom * 1.2));
	const zoomOut = () => setZoom(Math.max(0.1, zoom / 1.2));

	return (
		<div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
			<div className="glass-card-elevated rounded-2xl p-1.5 flex items-center gap-1">
				{/* Zoom Out */}
				<button
					type="button"
					onClick={zoomOut}
					title="Zoom out (Ctrl -)"
					className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all cursor-pointer border-none bg-transparent"
				>
					<ZoomOut size={16} />
				</button>

				{/* Zoom Level Display */}
				<button
					type="button"
					onClick={resetViewport}
					title="Reset zoom"
					className="px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-semibold min-w-[56px] tabular-nums cursor-pointer transition-colors border-none"
				>
					{Math.round(zoom * 100)}%
				</button>

				{/* Zoom In */}
				<button
					type="button"
					onClick={zoomIn}
					title="Zoom in (Ctrl +)"
					className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all cursor-pointer border-none bg-transparent"
				>
					<ZoomIn size={16} />
				</button>

				{/* Separator */}
				<div className="w-px h-5 bg-gray-200 mx-1" />

				{/* Fit to Screen */}
				<button
					type="button"
					onClick={resetViewport}
					title="Fit to screen"
					className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all cursor-pointer border-none bg-transparent"
				>
					<Maximize2 size={16} />
				</button>
			</div>
		</div>
	);
}
