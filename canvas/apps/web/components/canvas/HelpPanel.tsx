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

interface ShortcutSection {
	title: string;
	shortcuts: { keys: string[]; action: string }[];
}

const SHORTCUT_SECTIONS: ShortcutSection[] = [
	{
		title: "Tools",
		shortcuts: [
			{ keys: ["V"], action: "Select" },
			{ keys: ["H"], action: "Pan" },
			{ keys: ["R"], action: "Rectangle" },
			{ keys: ["O"], action: "Ellipse" },
			{ keys: ["L"], action: "Line" },
			{ keys: ["A"], action: "Arrow" },
			{ keys: ["P"], action: "Pencil" },
			{ keys: ["T"], action: "Text" },
			{ keys: ["E"], action: "Eraser" },
			{ keys: ["K"], action: "Laser" },
		],
	},
	{
		title: "Edit",
		shortcuts: [
			{ keys: ["Ctrl", "Z"], action: "Undo" },
			{ keys: ["Ctrl", "⇧", "Z"], action: "Redo" },
			{ keys: ["Ctrl", "A"], action: "Select All" },
			{ keys: ["Ctrl", "C"], action: "Copy" },
			{ keys: ["Ctrl", "V"], action: "Paste" },
			{ keys: ["Ctrl", "D"], action: "Duplicate" },
			{ keys: ["Del"], action: "Delete" },
			{ keys: ["Esc"], action: "Deselect" },
		],
	},
	{
		title: "Layer",
		shortcuts: [
			{ keys: ["Ctrl", "]"], action: "Bring Forward" },
			{ keys: ["Ctrl", "["], action: "Send Backward" },
		],
	},
	{
		title: "Other",
		shortcuts: [{ keys: ["Ctrl", "E"], action: "Export" }],
	},
];

export function HelpPanel() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div
			className="fixed z-[var(--z-controls)]"
			style={{ bottom: "104px", right: "90px" }}
		>
			{isOpen ? (
				<div
					className="glass-card-elevated p-4 w-[280px]"
					style={{
						borderRadius: "var(--radius-xl)",
						boxShadow: "var(--shadow-lg)",
						animation: "fade-in 0.2s ease-out, scale-in 0.2s ease-out",
					}}
				>
					{/* Header */}
					<div className="flex items-center justify-between mb-3">
						<div className="flex items-center gap-2">
							<div
								className="w-8 h-8 flex items-center justify-center"
								style={{
									borderRadius: "var(--radius-md)",
									background: "var(--color-bg-muted)",
								}}
							>
								<Keyboard size={16} className="text-violet-500" />
							</div>
							<span className="text-sm font-bold text-gray-800 uppercase tracking-wider">
								Shortcuts
							</span>
						</div>
						<button
							type="button"
							onClick={() => setIsOpen(false)}
							className="p-1.5 bg-transparent border-none cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-center"
							style={{ borderRadius: "var(--radius-md)" }}
						>
							<X size={16} className="text-gray-400" />
						</button>
					</div>

					{/* Shortcuts List */}
					<div className="max-h-[400px] overflow-y-auto">
						{SHORTCUT_SECTIONS.map((section, sIdx) => (
							<div key={section.title}>
								{/* Section Title */}
								<div
									className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1"
									style={{ marginTop: sIdx > 0 ? "12px" : "0" }}
								>
									{section.title}
								</div>
								{section.shortcuts.map((shortcut, index) => (
									<div
										key={shortcut.action}
										className={`flex items-center justify-between py-2 ${
											index < section.shortcuts.length - 1
												? "border-b border-gray-50"
												: ""
										}`}
									>
										<span className="text-sm text-gray-600 font-medium">
											{shortcut.action}
										</span>
										<div className="flex gap-1">
											{shortcut.keys.map((key) => (
												<kbd
													key={key}
													className="px-2 py-1 text-xs font-mono font-semibold text-violet-600 bg-violet-50 border border-violet-200"
													style={{ borderRadius: "var(--radius-sm)" }}
												>
													{key}
												</kbd>
											))}
										</div>
									</div>
								))}
							</div>
						))}
					</div>
				</div>
			) : (
				<button
					type="button"
					onClick={() => setIsOpen(true)}
					title="Keyboard shortcuts (?)"
					className="w-12 h-12 cursor-pointer flex items-center justify-center border-none text-white transition-all"
					style={{
						borderRadius: "var(--radius-circle)",
						background: "var(--color-accent)",
						boxShadow: "var(--shadow-accent-strong)",
						animation: "fade-in 0.3s ease-out 0.6s backwards",
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.background = "var(--color-accent-hover)";
						e.currentTarget.style.transform = "scale(1.05)";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.background = "var(--color-accent)";
						e.currentTarget.style.transform = "scale(1)";
					}}
				>
					<HelpCircle size={22} />
				</button>
			)}
		</div>
	);
}
