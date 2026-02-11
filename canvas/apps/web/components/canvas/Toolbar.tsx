/**
 * ============================================================================
 * LEKHAFLOW - TOOLBAR COMPONENT
 * ============================================================================
 *
 * Floating pill-shaped toolbar for tool selection - horizontal at top center.
 */

"use client";

import type { Tool } from "@repo/common";
import {
	ArrowUpRight,
	Circle,
	Diamond,
	Eraser,
	Hand,
	Lock,
	Minus,
	MousePointer2,
	Pencil,
	Presentation,
	Square,
	Type,
} from "lucide-react";
import React from "react";
import { useCanvasStore } from "../../store/canvas-store";

interface ToolDefinition {
	id: Tool;
	icon: React.ReactNode;
	label: string;
	shortcut: string;
}

const TOOLS: ToolDefinition[] = [
	{ id: "hand", icon: <Lock size={18} />, label: "Lock", shortcut: "L" },
	{ id: "hand", icon: <Hand size={18} />, label: "Hand", shortcut: "H" },
	{
		id: "selection",
		icon: <MousePointer2 size={18} />,
		label: "Select",
		shortcut: "V",
	},
	{
		id: "rectangle",
		icon: <Square size={18} />,
		label: "Rectangle",
		shortcut: "R",
	},
	{
		id: "diamond",
		icon: <Diamond size={18} />,
		label: "Diamond",
		shortcut: "D",
	},
	{
		id: "ellipse",
		icon: <Circle size={18} />,
		label: "Circle",
		shortcut: "O",
	},
	{
		id: "arrow",
		icon: <ArrowUpRight size={18} />,
		label: "Arrow",
		shortcut: "A",
	},
	{ id: "line", icon: <Minus size={18} />, label: "Line", shortcut: "-" },
	{
		id: "freedraw",
		icon: <Pencil size={18} />,
		label: "Pencil",
		shortcut: "P",
	},
	{
		id: "laser",
		icon: <Presentation size={18} />,
		label: "Laser",
		shortcut: "K",
	},
	{ id: "text", icon: <Type size={18} />, label: "Text", shortcut: "T" },
	{ id: "eraser", icon: <Eraser size={18} />, label: "Eraser", shortcut: "E" },
];

export function Toolbar() {
	const activeTool = useCanvasStore((state) => state.activeTool);
	const setActiveTool = useCanvasStore((state) => state.setActiveTool);

	return (
		<div className="absolute left-1/2 top-6 -translate-x-1/2 z-[var(--z-toolbar)]">
			<div
				className="glass-card-elevated flex items-center gap-1 px-2 py-2"
				style={{
					borderRadius: "28px",
					height: "56px",
					boxShadow: "var(--shadow-lg)",
					animation: "fade-in 0.3s ease-out, slide-in-top 0.3s ease-out",
				}}
			>
				{TOOLS.map((tool, index) => {
					const isActive = activeTool === tool.id;
					return (
						<React.Fragment key={`${tool.id}-${index}`}>
							{/* Separator after selection tools (after index 2) */}
							{index === 3 && (
								<div className="h-6 w-px bg-gray-200 mx-1" />
							)}
							{/* Separator before eraser (before last tool) */}
							{index === TOOLS.length - 1 && (
								<div className="h-6 w-px bg-gray-200 mx-1" />
							)}

							<button
								type="button"
								onClick={() => setActiveTool(tool.id)}
								title={`${tool.label} (${tool.shortcut})`}
								className={`
									relative w-10 h-10 rounded-lg flex items-center justify-center
									transition-all duration-150 cursor-pointer border-none group
									${
										isActive
											? "bg-violet-100 text-violet-600"
											: "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
									}
								`}
								style={{
									borderRadius: "8px",
								}}
							>
								{tool.icon}

								{/* Keyboard shortcut badge */}
								<div
									className={`
										absolute -bottom-1 -right-1 
										w-4 h-4 rounded flex items-center justify-center
										text-[10px] font-mono font-medium
										transition-all duration-150
										${
											isActive
												? "bg-violet-600 text-white"
												: "bg-gray-300 text-gray-600 group-hover:bg-gray-400"
										}
									`}
									style={{
										fontSize: "10px",
										lineHeight: "1",
									}}
								>
									{tool.shortcut}
								</div>
							</button>
						</React.Fragment>
					);
				})}
			</div>
		</div>
	);
}
