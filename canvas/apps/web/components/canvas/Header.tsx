/**
 * ============================================================================
 * LEKHAFLOW - HEADER COMPONENT
 * ============================================================================
 *
 * Modern header with hamburger menu, document title, and collaboration UI.
 */

"use client";

import {
	Check,
	Copy,
	Download,
	FileText,
	FolderOpen,
	HelpCircle,
	Image,
	Link2,
	Mail,
	Menu,
	Plus,
	QrCode,
	Save,
	Settings,
	Share2,
	Trash2,
	Users,
	X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
	useCanvasStore,
	useCollaboratorsArray,
} from "../../store/canvas-store";

// ============================================================================
// SIDEBAR MENU COMPONENT
// ============================================================================

interface SidebarMenuProps {
	isOpen: boolean;
	onClose: () => void;
	onClearCanvas?: () => void;
}

function SidebarMenu({ isOpen, onClose, onClearCanvas }: SidebarMenuProps) {
	return (
		<>
			{/* Backdrop */}
			{isOpen && (
				<button
					type="button"
					className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 border-none cursor-default transition-opacity duration-300"
					onClick={onClose}
					tabIndex={-1}
					aria-hidden="true"
				/>
			)}

			{/* Menu Card */}
			<div
				className={`fixed top-20 right-4 w-[300px] glass-card-elevated rounded-2xl z-50 max-h-[calc(100vh-100px)] flex flex-col transition-all duration-200 ease-out ${
					isOpen
						? "translate-y-0 scale-100 opacity-100 pointer-events-auto"
						: "-translate-y-2.5 scale-95 opacity-0 pointer-events-none"
				}`}
			>
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white rounded-t-2xl">
					<div className="flex items-center gap-2.5">
						<div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-600 rounded-[10px] flex items-center justify-center shadow-[0_4px_12px_rgba(139,92,246,0.3)]">
							<Menu size={18} className="text-white" />
						</div>
						<div>
							<h3 className="text-sm font-bold text-gray-800 m-0">Menu</h3>
							<p className="text-[11px] text-violet-500 m-0 font-medium">
								Quick Actions
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="p-1.5 rounded-lg bg-transparent border-none cursor-pointer flex items-center justify-center hover:bg-gray-100 transition-colors"
					>
						<X size={18} className="text-gray-500" />
					</button>
				</div>

				{/* Menu Items */}
				<div className="flex-1 overflow-y-auto p-3">
					{/* File Section */}
					<div className="mb-4">
						<p className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider m-0">
							File
						</p>
						<div className="flex flex-col gap-1">
							<MenuItem icon={<Plus />} label="New Canvas" shortcut="Ctrl+N" />
							<MenuItem
								icon={<FolderOpen />}
								label="Open..."
								shortcut="Ctrl+O"
							/>
							<MenuItem icon={<Save />} label="Save" shortcut="Ctrl+S" />
						</div>
					</div>

					{/* Export Section */}
					<div className="mb-4">
						<p className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider m-0">
							Export
						</p>
						<div className="flex flex-col gap-1">
							<MenuItem icon={<Image />} label="Export as PNG" />
							<MenuItem icon={<FileText />} label="Export as SVG" />
							<MenuItem icon={<Download />} label="Export as JSON" />
						</div>
					</div>

					{/* Canvas Section */}
					<div>
						<p className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider m-0">
							Canvas
						</p>
						<div className="flex flex-col gap-1">
							<MenuItem
								icon={<Trash2 />}
								label="Clear Canvas"
								variant="danger"
								onClick={() => {
									if (onClearCanvas) {
										onClearCanvas();
									}
									onClose();
								}}
							/>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
					<div className="flex gap-2">
						<button
							type="button"
							className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-[10px] cursor-pointer transition-all hover:bg-gray-50 hover:border-violet-300 hover:text-violet-500"
						>
							<HelpCircle size={16} />
							Help
						</button>
						<button
							type="button"
							className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-[10px] cursor-pointer transition-all hover:bg-gray-50 hover:border-violet-300 hover:text-violet-500"
						>
							<Settings size={16} />
							Settings
						</button>
					</div>
				</div>
			</div>
		</>
	);
}

// ============================================================================
// MENU ITEM COMPONENT
// ============================================================================

interface MenuItemProps {
	icon: React.ReactNode;
	label: string;
	shortcut?: string;
	onClick?: () => void;
	variant?: "default" | "danger";
}

function MenuItem({
	icon,
	label,
	shortcut,
	onClick,
	variant = "default",
}: MenuItemProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[13px] font-semibold border-none cursor-pointer transition-all ${
				variant === "danger"
					? "bg-transparent text-red-500 hover:bg-red-50"
					: "bg-transparent text-gray-600 hover:bg-violet-50 hover:text-violet-600"
			}`}
		>
			<span
				className={`flex-shrink-0 ${variant === "danger" ? "text-red-500" : "text-violet-500"}`}
			>
				{React.cloneElement(
					icon as React.ReactElement,
					{ size: 18 } as React.Attributes,
				)}
			</span>
			<span className="flex-1 text-left">{label}</span>
			{shortcut && (
				<kbd className="px-2 py-0.5 text-[11px] font-mono text-gray-400 bg-gray-100 border border-gray-200 rounded-md">
					{shortcut}
				</kbd>
			)}
		</button>
	);
}

// ============================================================================
// SHARE MODAL
// ============================================================================

interface ShareModalProps {
	isOpen: boolean;
	onClose: () => void;
	roomId: string | null;
}

function ShareModal({ isOpen, onClose, roomId }: ShareModalProps) {
	const [copied, setCopied] = useState(false);
	const shareUrl =
		typeof window !== "undefined"
			? `${window.location.origin}/canvas/${roomId}`
			: "";

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(shareUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Backdrop */}
			<button
				type="button"
				className="absolute inset-0 bg-black/50 backdrop-blur-sm border-none cursor-default"
				onClick={onClose}
				tabIndex={-1}
				aria-hidden="true"
			/>

			{/* Modal Card */}
			<div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-[540px] overflow-hidden animate-scale-in">
				{/* Gradient Header */}
				<div className="bg-gradient-to-br from-violet-500 via-violet-600 to-indigo-600 p-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3.5">
							<div className="w-12 h-12 bg-white/20 rounded-[14px] flex items-center justify-center backdrop-blur-sm">
								<Share2 size={24} className="text-white" />
							</div>
							<div>
								<h2 className="text-xl font-bold text-white m-0">
									Share Canvas
								</h2>
								<p className="text-sm text-white/80 m-0">
									Collaborate in real-time
								</p>
							</div>
						</div>
						<button
							type="button"
							onClick={onClose}
							className="p-2.5 rounded-xl bg-transparent border-none cursor-pointer hover:bg-white/10 transition-colors"
						>
							<X size={20} className="text-white" />
						</button>
					</div>
				</div>

				{/* Content */}
				<div className="p-6 flex flex-col gap-5">
					{/* Share Link */}
					<div>
						<p className="flex items-center gap-2 text-[13px] font-bold text-gray-700 mb-3">
							<Link2 size={16} className="text-violet-500" />
							Shareable Link
						</p>
						<div className="flex gap-2.5">
							<div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-[13px] text-gray-500 font-mono truncate">
								{shareUrl}
							</div>
							<button
								type="button"
								onClick={handleCopy}
								className={`px-6 py-3.5 rounded-xl font-bold border-none cursor-pointer flex items-center gap-2 transition-all text-sm text-white ${
									copied
										? "bg-emerald-500 shadow-[0_8px_24px_rgba(16,185,129,0.3)]"
										: "bg-gradient-to-r from-violet-500 to-violet-600 shadow-[0_8px_24px_rgba(139,92,246,0.35)] hover:-translate-y-px hover:shadow-[0_12px_32px_rgba(139,92,246,0.45)]"
								}`}
							>
								{copied ? (
									<>
										<Check size={16} />
										Copied!
									</>
								) : (
									<>
										<Copy size={16} />
										Copy
									</>
								)}
							</button>
						</div>
					</div>

					{/* Room Info Card */}
					<div className="bg-gradient-to-br from-violet-50 to-purple-100 border border-purple-200 rounded-2xl p-5">
						<div className="flex items-start justify-between">
							<div>
								<p className="text-[11px] font-bold text-violet-500 uppercase tracking-wider mb-1.5">
									Room ID
								</p>
								<p className="text-lg font-bold text-purple-900 font-mono">
									{roomId}
								</p>
							</div>
							<div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
								<QrCode size={24} className="text-violet-400" />
							</div>
						</div>
						<p className="text-[13px] text-violet-600 mt-3 leading-relaxed">
							Anyone with this link can view and edit in real-time
						</p>
					</div>

					{/* Quick Share Options */}
					<div className="flex gap-3">
						<button
							type="button"
							className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer text-[13px] font-semibold text-gray-600 transition-all hover:bg-gray-100 hover:border-violet-300 hover:text-violet-500"
						>
							<Mail size={16} />
							Email
						</button>
						<button
							type="button"
							onClick={handleCopy}
							className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer text-[13px] font-semibold text-gray-600 transition-all hover:bg-gray-100 hover:border-violet-300 hover:text-violet-500"
						>
							<Link2 size={16} />
							Copy Link
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

// ============================================================================
// HEADER LEFT (Menu & Title)
// ============================================================================

interface HeaderLeftProps {
	onClearCanvas?: () => void;
}

export function HeaderLeft({ onClearCanvas }: HeaderLeftProps) {
	const [menuOpen, setMenuOpen] = useState(false);
	const [docName, setDocName] = useState("");

	useEffect(() => {
		const date = new Date().toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
		});
		setDocName(`Untitled — ${date}`);
	}, []);

	return (
		<>
			{/* Document Title - Left Side */}
			<div className="absolute top-4 left-20 z-50 flex items-center gap-3">
				<div className="glass-card-elevated rounded-[14px] flex items-center gap-3 px-5 py-2.5">
					{/* Color indicator */}
					<div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 shadow-[0_2px_8px_rgba(139,92,246,0.4)]" />
					<input
						type="text"
						value={docName}
						onChange={(e) => setDocName(e.target.value)}
						className="text-sm font-semibold text-gray-800 bg-transparent border-none outline-none min-w-[140px] max-w-[220px]"
						placeholder="Untitled"
					/>
				</div>
			</div>

			{/* Hamburger Menu Button */}
			<div className="absolute top-[120px] right-4 z-50">
				<button
					type="button"
					onClick={() => setMenuOpen(true)}
					title="Menu"
					className="glass-card-elevated rounded-[14px] px-3 py-3 cursor-pointer flex items-center gap-2 border-none transition-all hover:bg-gray-50 hover:border-violet-300"
				>
					<Menu size={20} className="text-violet-500" />
					<span className="text-[13px] font-semibold text-gray-700">Menu</span>
				</button>
			</div>

			{/* Sidebar Menu */}
			<SidebarMenu
				isOpen={menuOpen}
				onClose={() => setMenuOpen(false)}
				onClearCanvas={onClearCanvas}
			/>
		</>
	);
}

// ============================================================================
// HEADER RIGHT (Collaboration)
// ============================================================================

export function HeaderRight() {
	const { myName, myColor, isConnected, roomId } = useCanvasStore();
	const collaborators = useCollaboratorsArray();
	const [shareModalOpen, setShareModalOpen] = useState(false);

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	return (
		<>
			<div className="absolute top-4 right-4 z-50 flex items-center gap-3">
				{/* Connection Status */}
				<div
					className={`flex items-center gap-2 px-4 py-2.5 rounded-full border ${
						isConnected
							? "bg-emerald-50 border-emerald-200 shadow-[0_4px_12px_rgba(16,185,129,0.15)]"
							: "bg-red-50 border-red-200 shadow-[0_4px_12px_rgba(239,68,68,0.15)]"
					}`}
				>
					<div
						className={`w-2 h-2 rounded-full ${
							isConnected ? "bg-emerald-500 animate-pulse-dot" : "bg-red-500"
						}`}
					/>
					<span
						className={`text-xs font-bold uppercase tracking-wider ${
							isConnected ? "text-emerald-700" : "text-red-700"
						}`}
					>
						{isConnected ? "Live" : "Offline"}
					</span>
				</div>

				{/* Collaborators */}
				<div className="flex items-center">
					{/* Avatar Stack */}
					<div className="flex">
						{/* My Avatar */}
						<div
							className="relative w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md border-[3px] border-white z-10"
							style={{ backgroundColor: myColor }}
							title={`You (${myName})`}
						>
							{getInitials(myName)}
							<div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
						</div>

						{/* Other Collaborators */}
						{collaborators.slice(0, 4).map((collab, index) => (
							<div
								key={collab.id}
								className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md border-[3px] border-white -ml-3"
								style={{
									backgroundColor: collab.color,
									zIndex: 10 - index - 1,
								}}
								title={collab.name}
							>
								{getInitials(collab.name)}
							</div>
						))}

						{/* Overflow Badge */}
						{collaborators.length > 4 && (
							<div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shadow-md border-[3px] border-white -ml-3">
								+{collaborators.length - 4}
							</div>
						)}
					</div>

					{/* User Count Badge */}
					{collaborators.length > 0 && (
						<div className="ml-3 flex items-center gap-1.5 px-3 py-2 rounded-full bg-white shadow-md border border-gray-200">
							<Users size={14} className="text-violet-500" />
							<span className="text-xs font-bold text-gray-700">
								{collaborators.length + 1}
							</span>
						</div>
					)}
				</div>

				{/* Share Button */}
				<button
					type="button"
					onClick={() => setShareModalOpen(true)}
					className="flex items-center gap-2 px-6 py-3 rounded-[14px] bg-gradient-to-r from-violet-500 via-violet-600 to-indigo-600 border-none cursor-pointer text-sm font-bold text-white shadow-[0_8px_24px_rgba(139,92,246,0.35)] transition-all hover:-translate-y-px hover:shadow-[0_12px_32px_rgba(139,92,246,0.45)]"
				>
					<Share2 size={16} />
					Share
				</button>
			</div>

			{/* Share Modal */}
			<ShareModal
				isOpen={shareModalOpen}
				onClose={() => setShareModalOpen(false)}
				roomId={roomId}
			/>
		</>
	);
}
