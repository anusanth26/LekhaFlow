/**
 * ============================================================================
 * LEKHAFLOW - CONTEXT MENU
 * ============================================================================
 *
 * Right-click context menu for quick actions on canvas/elements.
 */

"use client";

import {
	ArrowDown,
	ArrowUp,
	ChevronsDown,
	ChevronsUp,
	ClipboardPaste,
	Copy,
	Layers,
	Trash2,
} from "lucide-react";
import type React from "react";

interface ContextMenuProps {
	x: number;
	y: number;
	isVisible: boolean;
	hasSelection: boolean;
	onClose: () => void;
	onCopy: () => void;
	onPaste: () => void;
	onDelete: () => void;
	onBringForward: () => void;
	onSendBackward: () => void;
	onBringToFront: () => void;
	onSendToBack: () => void;
}

interface MenuItemProps {
	icon: React.ReactNode;
	label: string;
	shortcut?: string;
	onClick: () => void;
	disabled?: boolean;
	danger?: boolean;
}

function MenuItem({
	icon,
	label,
	shortcut,
	onClick,
	disabled,
	danger,
}: MenuItemProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			style={{
				width: "100%",
				display: "flex",
				alignItems: "center",
				gap: "12px",
				padding: "10px 14px",
				border: "none",
				backgroundColor: "transparent",
				cursor: disabled ? "not-allowed" : "pointer",
				opacity: disabled ? 0.4 : 1,
				transition: "background-color 0.1s",
				borderRadius: "8px",
			}}
			onMouseEnter={(e) => {
				if (!disabled) {
					e.currentTarget.style.backgroundColor = danger
						? "#fef2f2"
						: "#f8fafc";
				}
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.backgroundColor = "transparent";
			}}
		>
			<span style={{ color: danger ? "#ef4444" : "#64748b" }}>{icon}</span>
			<span
				style={{
					flex: 1,
					textAlign: "left",
					fontSize: "13px",
					fontWeight: 500,
					color: danger ? "#ef4444" : "#374151",
				}}
			>
				{label}
			</span>
			{shortcut && (
				<kbd
					style={{
						padding: "2px 6px",
						fontSize: "11px",
						fontFamily: "monospace",
						color: "#9ca3af",
						backgroundColor: "#f1f5f9",
						borderRadius: "4px",
					}}
				>
					{shortcut}
				</kbd>
			)}
		</button>
	);
}

export function ContextMenu({
	x,
	y,
	isVisible,
	hasSelection,
	onClose,
	onCopy,
	onPaste,
	onDelete,
	onBringForward,
	onSendBackward,
	onBringToFront,
	onSendToBack,
}: ContextMenuProps) {
	if (!isVisible) return null;

	return (
		<>
			{/* Backdrop */}
			<button
				type="button"
				style={{
					position: "fixed",
					inset: 0,
					zIndex: 998,
					background: "transparent",
					border: "none",
					cursor: "default",
				}}
				onClick={onClose}
				onContextMenu={(e) => {
					e.preventDefault();
					onClose();
				}}
				aria-label="Close menu"
			/>

			{/* Menu */}
			<div
				style={{
					position: "fixed",
					left: x,
					top: y,
					zIndex: 999,
					backgroundColor: "white",
					borderRadius: "12px",
					boxShadow: "0 10px 40px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1)",
					border: "1px solid #e5e7eb",
					padding: "6px",
					minWidth: "200px",
				}}
			>
				{/* Clipboard Actions */}
				<MenuItem
					icon={<Copy size={16} />}
					label="Copy"
					shortcut="⌘C"
					onClick={() => {
						onCopy();
						onClose();
					}}
					disabled={!hasSelection}
				/>
				<MenuItem
					icon={<ClipboardPaste size={16} />}
					label="Paste"
					shortcut="⌘V"
					onClick={() => {
						onPaste();
						onClose();
					}}
				/>

				{/* Separator */}
				<div
					style={{ height: "1px", backgroundColor: "#e5e7eb", margin: "6px 0" }}
				/>

				{/* Layer Actions */}
				<div
					style={{
						padding: "6px 14px 4px",
						fontSize: "11px",
						fontWeight: 600,
						color: "#9ca3af",
						textTransform: "uppercase",
						letterSpacing: "0.5px",
					}}
				>
					<Layers size={12} style={{ display: "inline", marginRight: "6px" }} />
					Layers
				</div>
				<MenuItem
					icon={<ChevronsUp size={16} />}
					label="Bring to Front"
					shortcut="⌘]"
					onClick={() => {
						onBringToFront();
						onClose();
					}}
					disabled={!hasSelection}
				/>
				<MenuItem
					icon={<ArrowUp size={16} />}
					label="Bring Forward"
					onClick={() => {
						onBringForward();
						onClose();
					}}
					disabled={!hasSelection}
				/>
				<MenuItem
					icon={<ArrowDown size={16} />}
					label="Send Backward"
					onClick={() => {
						onSendBackward();
						onClose();
					}}
					disabled={!hasSelection}
				/>
				<MenuItem
					icon={<ChevronsDown size={16} />}
					label="Send to Back"
					shortcut="⌘["
					onClick={() => {
						onSendToBack();
						onClose();
					}}
					disabled={!hasSelection}
				/>

				{/* Separator */}
				<div
					style={{ height: "1px", backgroundColor: "#e5e7eb", margin: "6px 0" }}
				/>

				{/* Delete */}
				<MenuItem
					icon={<Trash2 size={16} />}
					label="Delete"
					shortcut="Del"
					onClick={() => {
						onDelete();
						onClose();
					}}
					disabled={!hasSelection}
					danger
				/>
			</div>
		</>
	);
}
