/**
 * ============================================================================
 * LEKHAFLOW - HELP PANEL
 * ============================================================================
 *
 * Bottom-right keyboard shortcuts help panel.
 */

"use client";

import { HelpCircle, Keyboard, X } from "lucide-react";
import { useState } from "react";

const SHORTCUTS = [
	{ keys: ["V"], action: "Select" },
	{ keys: ["H"], action: "Pan" },
	{ keys: ["R"], action: "Rectangle" },
	{ keys: ["O"], action: "Ellipse" },
	{ keys: ["L"], action: "Line" },
	{ keys: ["A"], action: "Arrow" },
	{ keys: ["P"], action: "Pencil" },
	{ keys: ["T"], action: "Text" },
	{ keys: ["E"], action: "Eraser" },
	{ keys: ["Ctrl", "Z"], action: "Undo" },
	{ keys: ["Ctrl", "⇧", "Z"], action: "Redo" },
	{ keys: ["Del"], action: "Delete" },
	{ keys: ["Esc"], action: "Deselect" },
];

export function HelpPanel() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="absolute bottom-4 right-4 z-50">
			{isOpen ? (
				<div className="glass-card-elevated rounded-2xl p-4 w-[232px] animate-scale-in">
					{/* Header */}
					<div className="flex items-center justify-between mb-3">
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
								<Keyboard size={16} className="text-violet-500" />
							</div>
							<span className="text-[13px] font-bold text-gray-800 uppercase tracking-wider">
								Shortcuts
							</span>
						</div>
						<button
							type="button"
							onClick={() => setIsOpen(false)}
							className="p-1.5 rounded-lg bg-transparent border-none cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-center"
						>
							<X size={16} className="text-gray-400" />
						</button>
					</div>

					{/* Shortcuts List */}
					<div className="max-h-[280px] overflow-y-auto">
						{SHORTCUTS.map((shortcut, index) => (
							<div
								key={shortcut.action}
								className={`flex items-center justify-between py-2 ${
									index < SHORTCUTS.length - 1 ? "border-b border-gray-100" : ""
								}`}
							>
								<span className="text-[13px] text-gray-600 font-medium">
									{shortcut.action}
								</span>
								<div className="flex gap-1">
									{shortcut.keys.map((key) => (
										<kbd
											key={key}
											className="px-2 py-1 text-[11px] font-mono font-semibold text-violet-500 bg-violet-50 border border-violet-200 rounded-md"
										>
											{key}
										</kbd>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			) : (
				<button
					type="button"
					onClick={() => setIsOpen(true)}
					title="Keyboard shortcuts (?)"
					className="glass-card-elevated rounded-2xl p-3 cursor-pointer flex items-center gap-2 border-none transition-all hover:bg-gray-50 hover:border-violet-300"
				>
					<HelpCircle size={20} className="text-gray-500" />
				</button>
			)}
		</div>
	);
}
