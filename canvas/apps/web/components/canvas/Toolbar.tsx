/**
 * ============================================================================
 * LEKHAFLOW - TOOLBAR COMPONENT
 * ============================================================================
 * 
 * Excalidraw-style top toolbar for tool selection.
 * 
 * Features:
 * - Tool selection (selection, shapes, line, arrow, freedraw, text)
 * - Visual feedback for active tool
 * - Keyboard shortcut hints
 */

"use client";

import React from "react";
import {
  MousePointer2,
  Square,
  Circle,
  Minus,
  ArrowUpRight,
  Pencil,
  Type,
  Hand,
  Eraser,
} from "lucide-react";
import { useCanvasStore } from "../../store/canvas-store";

// Tool type (simplified to avoid circular imports)
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

// ============================================================================
// TOOL DEFINITIONS
// ============================================================================

interface ToolDefinition {
  id: Tool;
  icon: React.ReactNode;
  label: string;
  shortcut: string;
}

const TOOLS: ToolDefinition[] = [
  { id: "hand", icon: <Hand className="w-5 h-5" />, label: "Pan", shortcut: "H" },
  { id: "selection", icon: <MousePointer2 className="w-5 h-5" />, label: "Selection", shortcut: "V" },
  { id: "rectangle", icon: <Square className="w-5 h-5" />, label: "Rectangle", shortcut: "R" },
  { id: "ellipse", icon: <Circle className="w-5 h-5" />, label: "Ellipse", shortcut: "O" },
  { id: "line", icon: <Minus className="w-5 h-5" />, label: "Line", shortcut: "L" },
  { id: "arrow", icon: <ArrowUpRight className="w-5 h-5" />, label: "Arrow", shortcut: "A" },
  { id: "freedraw", icon: <Pencil className="w-5 h-5" />, label: "Freedraw", shortcut: "P" },
  { id: "text", icon: <Type className="w-5 h-5" />, label: "Text", shortcut: "T" },
  { id: "eraser", icon: <Eraser className="w-5 h-5" />, label: "Eraser", shortcut: "E" },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function Toolbar() {
  const activeTool = useCanvasStore((state) => state.activeTool);
  const setActiveTool = useCanvasStore((state) => state.setActiveTool);

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-1.5 flex items-center gap-0.5">
        {TOOLS.map((tool, index) => (
          <React.Fragment key={tool.id}>
            {/* Add separator after hand and after selection */}
            {(index === 1 || index === 2) && (
              <div className="w-px h-6 bg-gray-200 mx-1" />
            )}
            
            <button
              onClick={() => setActiveTool(tool.id)}
              className={`
                relative p-2.5 rounded-lg transition-all duration-150
                ${activeTool === tool.id
                  ? "bg-violet-100 text-violet-600"
                  : "hover:bg-gray-100 text-gray-700"
                }
              `}
              title={`${tool.label} — ${tool.shortcut}`}
            >
              {tool.icon}
              
              {/* Active indicator */}
              {activeTool === tool.id && (
                <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-violet-600" />
              )}
            </button>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
