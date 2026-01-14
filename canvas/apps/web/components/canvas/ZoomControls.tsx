/**
 * ============================================================================
 * LEKHAFLOW - ZOOM CONTROLS
 * ============================================================================
 *
 * Bottom-center zoom controls with zoom in/out and reset.
 */

"use client";

import { Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import type React from "react";
import { useCanvasStore } from "../../store/canvas-store";

export function ZoomControls() {
	const { zoom, setZoom, resetViewport } = useCanvasStore();

	const zoomIn = () => setZoom(Math.min(5, zoom * 1.2));
	const zoomOut = () => setZoom(Math.max(0.1, zoom / 1.2));

	const buttonStyle: React.CSSProperties = {
		width: "40px",
		height: "40px",
		borderRadius: "10px",
		border: "none",
		cursor: "pointer",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "transparent",
		color: "#64748b",
		transition: "all 0.15s ease",
	};

	return (
		<div
			style={{
				position: "absolute",
				bottom: "16px",
				left: "50%",
				transform: "translateX(-50%)",
				zIndex: 50,
			}}
		>
			<div
				style={{
					backgroundColor: "white",
					borderRadius: "14px",
					boxShadow:
						"0 10px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)",
					border: "1px solid #e5e7eb",
					padding: "6px",
					display: "flex",
					alignItems: "center",
					gap: "4px",
				}}
			>
				{/* Zoom Out */}
				<button
					type="button"
					onClick={zoomOut}
					title="Zoom out (Ctrl -)"
					style={buttonStyle}
					onMouseEnter={(e) => {
						e.currentTarget.style.backgroundColor = "#f1f5f9";
						e.currentTarget.style.color = "#1e293b";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.backgroundColor = "transparent";
						e.currentTarget.style.color = "#64748b";
					}}
				>
					<ZoomOut size={18} />
				</button>

				{/* Zoom Level Display */}
				<button
					type="button"
					onClick={resetViewport}
					title="Reset zoom (double-click)"
					style={{
						padding: "8px 12px",
						borderRadius: "8px",
						border: "none",
						cursor: "pointer",
						backgroundColor: "#f8fafc",
						color: "#334155",
						fontWeight: 600,
						fontSize: "13px",
						minWidth: "64px",
						fontVariantNumeric: "tabular-nums",
						transition: "all 0.15s ease",
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.backgroundColor = "#e2e8f0";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.backgroundColor = "#f8fafc";
					}}
				>
					{Math.round(zoom * 100)}%
				</button>

				{/* Zoom In */}
				<button
					type="button"
					onClick={zoomIn}
					title="Zoom in (Ctrl +)"
					style={buttonStyle}
					onMouseEnter={(e) => {
						e.currentTarget.style.backgroundColor = "#f1f5f9";
						e.currentTarget.style.color = "#1e293b";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.backgroundColor = "transparent";
						e.currentTarget.style.color = "#64748b";
					}}
				>
					<ZoomIn size={18} />
				</button>

				{/* Separator */}
				<div
					style={{
						width: "1px",
						height: "24px",
						backgroundColor: "#e5e7eb",
						margin: "0 4px",
					}}
				/>

				{/* Fit to Screen */}
				<button
					type="button"
					onClick={resetViewport}
					title="Fit to screen"
					style={buttonStyle}
					onMouseEnter={(e) => {
						e.currentTarget.style.backgroundColor = "#f1f5f9";
						e.currentTarget.style.color = "#1e293b";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.backgroundColor = "transparent";
						e.currentTarget.style.color = "#64748b";
					}}
				>
					<Maximize2 size={18} />
				</button>
			</div>
		</div>
	);
}
