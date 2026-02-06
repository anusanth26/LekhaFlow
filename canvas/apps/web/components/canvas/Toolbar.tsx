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
}

const TOOLS: ToolDefinition[] = [
	{ id: "hand", icon: <Hand size={18} />, label: "Pan", shortcut: "H" },
	{ id: "selection", icon: <MousePointer2 size={18} />, label: "Selection", shortcut: "V" },
	{ id: "rectangle", icon: <Square size={18} />, label: "Rectangle", shortcut: "R" },
	{ id: "ellipse", icon: <Circle size={18} />, label: "Ellipse", shortcut: "O" },
	{ id: "line", icon: <Minus size={18} />, label: "Line", shortcut: "L" },
	{ id: "arrow", icon: <ArrowUpRight size={18} />, label: "Arrow", shortcut: "A" },
	{ id: "freedraw", icon: <Pencil size={18} />, label: "Freedraw", shortcut: "P" },
	{ id: "text", icon: <Type size={18} />, label: "Text", shortcut: "T" },
	{ id: "eraser", icon: <Eraser size={18} />, label: "Eraser", shortcut: "E" },
];

export function Toolbar() {
	const activeTool = useCanvasStore((state) => state.activeTool);
	const setActiveTool = useCanvasStore((state) => state.setActiveTool);

	return (
		<div className="absolute left-4 top-1/2 -translate-y-1/2 z-50">
			<div className="glass-card-elevated rounded-2xl p-2 flex flex-col gap-1">
				{TOOLS.map((tool, index) => {
					const isActive = activeTool === tool.id;
					return (
						<React.Fragment key={tool.id}>
							{/* Separator after pan tools */}
							{index === 2 && (
								<div className="w-8 h-px bg-gray-200 mx-auto my-1" />
							)}
							{/* Separator before eraser */}
							{index === 8 && (
								<div className="w-8 h-px bg-gray-200 mx-auto my-1" />
							)}

							<button
								type="button"
								onClick={() => setActiveTool(tool.id)}
								title={`${tool.label} (${tool.shortcut})`}
								className={`
									relative w-10 h-10 rounded-xl flex items-center justify-center
									transition-all duration-150 cursor-pointer border-none
									${isActive
										? "bg-violet-100 text-violet-600 shadow-[0_0_0_2px_rgba(139,92,246,0.2)]"
										: "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
									}
								`}
							>
								{tool.icon}

								{/* Active indicator */}
								{isActive && (
									<div className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full bg-violet-500" />
								)}
							</button>
						</React.Fragment>
					);
				})}
			</div>
		</div>
	);
}
