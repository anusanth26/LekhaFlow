/**
 * ============================================================================
 * LEKHAFLOW - TOOLBAR COMPONENT
 * ============================================================================
 *
 * Excalidraw-style vertical toolbar for tool selection.
 */

"use client";

import {
	ArrowUpRight,
	Circle,
	Eraser,
	Hand,
	Minus,
	MousePointer2,
	Pencil,
	Square,
	Type,
} from "lucide-react";
import React from "react";
import { useCanvasStore } from "../../store/canvas-store";

type Tool =
	| "selection"
	| "rectangle"
	| "ellipse"
	| "line"
	| "arrow"
	| "freedraw"
	| "text"
	| "eraser"
	| "hand";

interface ToolDefinition {
	id: Tool;
	icon: React.ReactNode;
	label: string;
	shortcut: string;
	color: string;
}

const TOOLS: ToolDefinition[] = [
	{
		id: "hand",
		icon: <Hand size={20} />,
		label: "Pan",
		shortcut: "H",
		color: "#6366f1",
	},
	{
		id: "selection",
		icon: <MousePointer2 size={20} />,
		label: "Selection",
		shortcut: "V",
		color: "#8b5cf6",
	},
	{
		id: "rectangle",
		icon: <Square size={20} />,
		label: "Rectangle",
		shortcut: "R",
		color: "#ec4899",
	},
	{
		id: "ellipse",
		icon: <Circle size={20} />,
		label: "Ellipse",
		shortcut: "O",
		color: "#f43f5e",
	},
	{
		id: "line",
		icon: <Minus size={20} />,
		label: "Line",
		shortcut: "L",
		color: "#f97316",
	},
	{
		id: "arrow",
		icon: <ArrowUpRight size={20} />,
		label: "Arrow",
		shortcut: "A",
		color: "#eab308",
	},
	{
		id: "freedraw",
		icon: <Pencil size={20} />,
		label: "Freedraw",
		shortcut: "P",
		color: "#22c55e",
	},
	{
		id: "text",
		icon: <Type size={20} />,
		label: "Text",
		shortcut: "T",
		color: "#06b6d4",
	},
	{
		id: "eraser",
		icon: <Eraser size={20} />,
		label: "Eraser",
		shortcut: "E",
		color: "#64748b",
	},
];

export function Toolbar() {
	const activeTool = useCanvasStore((state) => state.activeTool);
	const setActiveTool = useCanvasStore((state) => state.setActiveTool);

	return (
		<div
			style={{
				position: "absolute",
				left: "16px",
				top: "50%",
				transform: "translateY(-50%)",
				zIndex: 50,
			}}
		>
			<div
				style={{
					backgroundColor: "white",
					borderRadius: "16px",
					boxShadow:
						"0 10px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)",
					border: "1px solid #e5e7eb",
					padding: "8px",
					display: "flex",
					flexDirection: "column",
					gap: "4px",
				}}
			>
				{TOOLS.map((tool, index) => {
					const isActive = activeTool === tool.id;
					return (
						<React.Fragment key={tool.id}>
							{/* Separators */}
							{index === 2 && (
								<div
									style={{
										width: "32px",
										height: "1px",
										backgroundColor: "#e5e7eb",
										margin: "4px auto",
									}}
								/>
							)}

							<button
								type="button"
								onClick={() => setActiveTool(tool.id)}
								title={`${tool.label} (${tool.shortcut})`}
								style={{
									width: "44px",
									height: "44px",
									borderRadius: "12px",
									border: "none",
									cursor: "pointer",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									transition: "all 0.15s ease",
									backgroundColor: isActive ? `${tool.color}15` : "transparent",
									color: isActive ? tool.color : "#64748b",
									boxShadow: isActive ? `0 0 0 2px ${tool.color}30` : "none",
									position: "relative",
								}}
								onMouseEnter={(e) => {
									if (!isActive) {
										e.currentTarget.style.backgroundColor = "#f1f5f9";
										e.currentTarget.style.color = "#1e293b";
									}
								}}
								onMouseLeave={(e) => {
									if (!isActive) {
										e.currentTarget.style.backgroundColor = "transparent";
										e.currentTarget.style.color = "#64748b";
									}
								}}
							>
								{tool.icon}

								{/* Active indicator bar */}
								{isActive && (
									<div
										style={{
											position: "absolute",
											right: "-2px",
											top: "50%",
											transform: "translateY(-50%)",
											width: "3px",
											height: "16px",
											borderRadius: "2px",
											backgroundColor: tool.color,
										}}
									/>
								)}
							</button>
						</React.Fragment>
					);
				})}
			</div>
		</div>
	);
}
