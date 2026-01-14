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
}

function SidebarMenu({ isOpen, onClose }: SidebarMenuProps) {
	return (
		<>
			{/* Backdrop */}
			{isOpen && (
				<button
					type="button"
					style={{
						position: "fixed",
						inset: "0",
						backgroundColor: "rgba(0, 0, 0, 0.4)",
						backdropFilter: "blur(4px)",
						zIndex: 40,
						transition: "opacity 0.3s",
						border: "none",
						cursor: "default",
					}}
					onClick={onClose}
					tabIndex={-1}
					aria-hidden="true"
				/>
			)}

			{/* Menu Card - Right Side Popup */}
			<div
				style={{
					position: "fixed",
					top: "200px",
					right: "16px",
					width: "280px",
					backgroundColor: "white",
					borderRadius: "16px",
					boxShadow:
						"0 20px 60px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.15)",
					border: "1px solid #e5e7eb",
					zIndex: 50,
					transform: isOpen
						? "translateY(0) scale(1)"
						: "translateY(-10px) scale(0.95)",
					opacity: isOpen ? 1 : 0,
					pointerEvents: isOpen ? "auto" : "none",
					transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
					maxHeight: "calc(100vh - 180px)",
					display: "flex",
					flexDirection: "column",
				}}
			>
				{/* Header */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						padding: "16px",
						borderBottom: "1px solid #f3f4f6",
						background: "linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)",
						borderRadius: "16px 16px 0 0",
					}}
				>
					<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
						<div
							style={{
								width: "32px",
								height: "32px",
								background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
								borderRadius: "10px",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
							}}
						>
							<Menu size={18} color="white" />
						</div>
						<div>
							<h3
								style={{
									fontSize: "14px",
									fontWeight: 700,
									color: "#1f2937",
									margin: 0,
								}}
							>
								Menu
							</h3>
							<p
								style={{
									fontSize: "11px",
									color: "#8b5cf6",
									margin: 0,
									fontWeight: 500,
								}}
							>
								Quick Actions
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						style={{
							padding: "6px",
							borderRadius: "8px",
							backgroundColor: "transparent",
							border: "none",
							cursor: "pointer",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							transition: "background-color 0.15s",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.backgroundColor = "#f3f4f6";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.backgroundColor = "transparent";
						}}
					>
						<X size={18} color="#6b7280" />
					</button>
				</div>

				{/* Menu Items - Scrollable */}
				<div
					style={{
						flex: 1,
						overflowY: "auto",
						padding: "12px",
					}}
				>
					{/* File Section */}
					<div style={{ marginBottom: "16px" }}>
						<p
							style={{
								padding: "8px 12px",
								fontSize: "10px",
								fontWeight: 700,
								color: "#9ca3af",
								textTransform: "uppercase",
								letterSpacing: "0.5px",
								margin: 0,
							}}
						>
							File
						</p>
						<div
							style={{ display: "flex", flexDirection: "column", gap: "4px" }}
						>
							<MenuItem
								icon={<Plus />}
								label="New Canvas"
								shortcut="⌘N"
								color="#8b5cf6"
							/>
							<MenuItem
								icon={<FolderOpen />}
								label="Open..."
								shortcut="⌘O"
								color="#3b82f6"
							/>
							<MenuItem
								icon={<Save />}
								label="Save"
								shortcut="⌘S"
								color="#10b981"
							/>
						</div>
					</div>

					{/* Export Section */}
					<div style={{ marginBottom: "16px" }}>
						<p
							style={{
								padding: "8px 12px",
								fontSize: "10px",
								fontWeight: 700,
								color: "#9ca3af",
								textTransform: "uppercase",
								letterSpacing: "0.5px",
								margin: 0,
							}}
						>
							Export
						</p>
						<div
							style={{ display: "flex", flexDirection: "column", gap: "4px" }}
						>
							<MenuItem
								icon={<Image />}
								label="Export as PNG"
								color="#ec4899"
							/>
							<MenuItem
								icon={<FileText />}
								label="Export as SVG"
								color="#f59e0b"
							/>
							<MenuItem
								icon={<Download />}
								label="Export as JSON"
								color="#06b6d4"
							/>
						</div>
					</div>

					{/* Canvas Section */}
					<div>
						<p
							style={{
								padding: "8px 12px",
								fontSize: "10px",
								fontWeight: 700,
								color: "#9ca3af",
								textTransform: "uppercase",
								letterSpacing: "0.5px",
								margin: 0,
							}}
						>
							Canvas
						</p>
						<div
							style={{ display: "flex", flexDirection: "column", gap: "4px" }}
						>
							<MenuItem
								icon={<Trash2 />}
								label="Clear Canvas"
								variant="danger"
								color="#ef4444"
							/>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div
					style={{
						padding: "12px",
						borderTop: "1px solid #f3f4f6",
						backgroundColor: "#fafafa",
						borderRadius: "0 0 16px 16px",
					}}
				>
					<div style={{ display: "flex", gap: "8px" }}>
						<button
							type="button"
							style={{
								flex: 1,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								gap: "6px",
								padding: "10px",
								fontSize: "12px",
								fontWeight: 600,
								color: "#4b5563",
								backgroundColor: "white",
								border: "1px solid #e5e7eb",
								borderRadius: "10px",
								cursor: "pointer",
								transition: "all 0.15s",
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = "#f9fafb";
								e.currentTarget.style.borderColor = "#3b82f6";
								e.currentTarget.style.color = "#3b82f6";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = "white";
								e.currentTarget.style.borderColor = "#e5e7eb";
								e.currentTarget.style.color = "#4b5563";
							}}
						>
							<HelpCircle size={16} />
							Help
						</button>
						<button
							type="button"
							style={{
								flex: 1,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								gap: "6px",
								padding: "10px",
								fontSize: "12px",
								fontWeight: 600,
								color: "#4b5563",
								backgroundColor: "white",
								border: "1px solid #e5e7eb",
								borderRadius: "10px",
								cursor: "pointer",
								transition: "all 0.15s",
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = "#f9fafb";
								e.currentTarget.style.borderColor = "#8b5cf6";
								e.currentTarget.style.color = "#8b5cf6";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = "white";
								e.currentTarget.style.borderColor = "#e5e7eb";
								e.currentTarget.style.color = "#4b5563";
							}}
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
	color?: string;
	variant?: "default" | "danger";
}

function MenuItem({
	icon,
	label,
	shortcut,
	onClick,
	color = "#6b7280",
	variant = "default",
}: MenuItemProps) {
	const [isHovered, setIsHovered] = React.useState(false);

	const itemStyle: React.CSSProperties = {
		width: "100%",
		display: "flex",
		alignItems: "center",
		gap: "10px",
		padding: "10px 12px",
		borderRadius: "10px",
		fontSize: "13px",
		fontWeight: 600,
		border: "none",
		cursor: "pointer",
		transition: "all 0.15s",
		backgroundColor: isHovered
			? variant === "danger"
				? "#fef2f2"
				: `${color}15`
			: "transparent",
		color: variant === "danger" ? "#ef4444" : isHovered ? color : "#4b5563",
	};

	const iconStyle: React.CSSProperties = {
		width: "18px",
		height: "18px",
		color: variant === "danger" ? "#ef4444" : color,
		flexShrink: 0,
	};

	const shortcutStyle: React.CSSProperties = {
		padding: "3px 8px",
		fontSize: "11px",
		fontFamily: "monospace",
		color: "#9ca3af",
		backgroundColor: isHovered ? "#ffffff" : "#f3f4f6",
		borderRadius: "6px",
		border: "1px solid #e5e7eb",
	};

	return (
		<button
			type="button"
			onClick={onClick}
			style={itemStyle}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<span style={iconStyle}>
				{React.cloneElement(
					icon as React.ReactElement,
					{
						size: 18,
					} as React.Attributes,
				)}
			</span>
			<span style={{ flex: 1, textAlign: "left" }}>{label}</span>
			{shortcut && <kbd style={shortcutStyle}>{shortcut}</kbd>}
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
			? `${window.location.origin}/room/${roomId}`
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
		<div
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 50,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: "16px",
			}}
		>
			{/* Backdrop */}
			<button
				type="button"
				style={{
					position: "absolute",
					inset: 0,
					backgroundColor: "rgba(0, 0, 0, 0.5)",
					backdropFilter: "blur(4px)",
					border: "none",
					cursor: "default",
				}}
				onClick={onClose}
				tabIndex={-1}
				aria-hidden="true"
			/>

			{/* Modal Card */}
			<div
				style={{
					position: "relative",
					backgroundColor: "white",
					borderRadius: "24px",
					boxShadow: "0 25px 60px rgba(0,0,0,0.3), 0 10px 30px rgba(0,0,0,0.2)",
					width: "100%",
					maxWidth: "540px",
					overflow: "hidden",
				}}
			>
				{/* Gradient Header */}
				<div
					style={{
						background:
							"linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6366f1 100%)",
						padding: "24px",
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
						}}
					>
						<div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
							<div
								style={{
									width: "48px",
									height: "48px",
									backgroundColor: "rgba(255, 255, 255, 0.2)",
									borderRadius: "14px",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									backdropFilter: "blur(10px)",
								}}
							>
								<Share2 size={24} color="white" />
							</div>
							<div>
								<h2
									style={{
										fontSize: "20px",
										fontWeight: 700,
										color: "white",
										margin: 0,
									}}
								>
									Share Canvas
								</h2>
								<p
									style={{
										fontSize: "14px",
										color: "rgba(255, 255, 255, 0.8)",
										margin: 0,
									}}
								>
									Collaborate in real-time
								</p>
							</div>
						</div>
						<button
							type="button"
							onClick={onClose}
							style={{
								padding: "10px",
								borderRadius: "12px",
								backgroundColor: "transparent",
								border: "none",
								cursor: "pointer",
								transition: "background-color 0.15s",
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor =
									"rgba(255, 255, 255, 0.1)";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = "transparent";
							}}
						>
							<X size={20} color="white" />
						</button>
					</div>
				</div>

				{/* Content */}
				<div
					style={{
						padding: "24px",
						display: "flex",
						flexDirection: "column",
						gap: "20px",
					}}
				>
					{/* Share Link Section */}
					<div>
						<p
							style={{
								display: "flex",
								alignItems: "center",
								gap: "8px",
								fontSize: "13px",
								fontWeight: 700,
								color: "#374151",
								marginBottom: "12px",
							}}
						>
							<Link2 size={16} color="#8b5cf6" />
							Shareable Link
						</p>
						<div style={{ display: "flex", gap: "10px" }}>
							<div
								style={{
									flex: 1,
									backgroundColor: "#f9fafb",
									border: "1px solid #e5e7eb",
									borderRadius: "12px",
									padding: "14px 16px",
									fontSize: "13px",
									color: "#6b7280",
									fontFamily: "monospace",
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap",
								}}
							>
								{shareUrl}
							</div>
							<button
								type="button"
								onClick={handleCopy}
								style={{
									padding: "14px 24px",
									borderRadius: "12px",
									fontWeight: 700,
									border: "none",
									cursor: "pointer",
									display: "flex",
									alignItems: "center",
									gap: "8px",
									transition: "all 0.2s",
									fontSize: "14px",
									...(copied
										? {
												backgroundColor: "#10b981",
												color: "white",
												boxShadow: "0 8px 24px rgba(16, 185, 129, 0.3)",
											}
										: {
												background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
												color: "white",
												boxShadow: "0 8px 24px rgba(139, 92, 246, 0.35)",
											}),
								}}
								onMouseEnter={(e) => {
									if (!copied) {
										e.currentTarget.style.transform = "translateY(-1px)";
										e.currentTarget.style.boxShadow =
											"0 12px 32px rgba(139, 92, 246, 0.45)";
									}
								}}
								onMouseLeave={(e) => {
									if (!copied) {
										e.currentTarget.style.transform = "translateY(0)";
										e.currentTarget.style.boxShadow =
											"0 8px 24px rgba(139, 92, 246, 0.35)";
									}
								}}
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
					<div
						style={{
							background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
							border: "1px solid #e9d5ff",
							borderRadius: "16px",
							padding: "20px",
						}}
					>
						<div
							style={{
								display: "flex",
								alignItems: "start",
								justifyContent: "space-between",
							}}
						>
							<div>
								<p
									style={{
										fontSize: "11px",
										fontWeight: 700,
										color: "#8b5cf6",
										textTransform: "uppercase",
										letterSpacing: "0.5px",
										marginBottom: "6px",
									}}
								>
									Room ID
								</p>
								<p
									style={{
										fontSize: "18px",
										fontWeight: 700,
										color: "#581c87",
										fontFamily: "monospace",
									}}
								>
									{roomId}
								</p>
							</div>
							<div
								style={{
									width: "48px",
									height: "48px",
									backgroundColor: "white",
									borderRadius: "12px",
									boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<QrCode size={24} color="#a78bfa" />
							</div>
						</div>
						<p
							style={{
								fontSize: "13px",
								color: "#7c3aed",
								marginTop: "12px",
								lineHeight: "1.5",
							}}
						>
							Anyone with this link can view and edit in real-time
						</p>
					</div>

					{/* Quick Share Options */}
					<div style={{ display: "flex", gap: "12px" }}>
						<button
							type="button"
							style={{
								flex: 1,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								gap: "8px",
								padding: "14px",
								backgroundColor: "#f9fafb",
								border: "1px solid #e5e7eb",
								borderRadius: "12px",
								cursor: "pointer",
								fontSize: "13px",
								fontWeight: 600,
								color: "#4b5563",
								transition: "all 0.15s",
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = "#f3f4f6";
								e.currentTarget.style.borderColor = "#3b82f6";
								e.currentTarget.style.color = "#3b82f6";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = "#f9fafb";
								e.currentTarget.style.borderColor = "#e5e7eb";
								e.currentTarget.style.color = "#4b5563";
							}}
						>
							<Mail size={16} />
							Email
						</button>
						<button
							type="button"
							onClick={handleCopy}
							style={{
								flex: 1,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								gap: "8px",
								padding: "14px",
								backgroundColor: "#f9fafb",
								border: "1px solid #e5e7eb",
								borderRadius: "12px",
								cursor: "pointer",
								fontSize: "13px",
								fontWeight: 600,
								color: "#4b5563",
								transition: "all 0.15s",
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = "#f3f4f6";
								e.currentTarget.style.borderColor = "#8b5cf6";
								e.currentTarget.style.color = "#8b5cf6";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = "#f9fafb";
								e.currentTarget.style.borderColor = "#e5e7eb";
								e.currentTarget.style.color = "#4b5563";
							}}
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

export function HeaderLeft() {
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
			<div
				style={{
					position: "absolute",
					top: "16px",
					left: "80px",
					zIndex: 50,
					display: "flex",
					alignItems: "center",
					gap: "12px",
				}}
			>
				{/* Document Title Pill */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "12px",
						padding: "10px 20px",
						borderRadius: "14px",
						backgroundColor: "white",
						boxShadow:
							"0 10px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)",
						border: "1px solid #e5e7eb",
					}}
				>
					{/* Color indicator */}
					<div
						style={{
							width: "10px",
							height: "10px",
							borderRadius: "50%",
							background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
							boxShadow: "0 2px 8px rgba(139, 92, 246, 0.4)",
						}}
					/>

					<input
						type="text"
						value={docName}
						onChange={(e) => setDocName(e.target.value)}
						style={{
							fontSize: "14px",
							fontWeight: 600,
							color: "#1f2937",
							backgroundColor: "transparent",
							border: "none",
							outline: "none",
							minWidth: "140px",
							maxWidth: "220px",
						}}
						placeholder="Untitled"
					/>
				</div>
			</div>

			{/* Hamburger Menu Button - Right Side Below Style Button */}
			<div
				style={{
					position: "absolute",
					top: "120px",
					right: "16px",
					zIndex: 50,
				}}
			>
				<button
					type="button"
					onClick={() => setMenuOpen(true)}
					title="Menu"
					style={{
						padding: "12px",
						borderRadius: "14px",
						backgroundColor: "white",
						boxShadow:
							"0 10px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)",
						border: "1px solid #e5e7eb",
						cursor: "pointer",
						display: "flex",
						alignItems: "center",
						gap: "8px",
						transition: "all 0.15s ease",
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.backgroundColor = "#f8fafc";
						e.currentTarget.style.borderColor = "#8b5cf6";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.backgroundColor = "white";
						e.currentTarget.style.borderColor = "#e5e7eb";
					}}
				>
					<Menu size={20} color="#8b5cf6" />
					<span style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
						Menu
					</span>
				</button>
			</div>

			{/* Sidebar Menu */}
			<SidebarMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
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
			<div
				style={{
					position: "absolute",
					top: "16px",
					right: "16px",
					zIndex: 50,
					display: "flex",
					alignItems: "center",
					gap: "12px",
				}}
			>
				{/* Connection Status */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "8px",
						padding: "10px 16px",
						borderRadius: "999px",
						backgroundColor: isConnected ? "#ecfdf5" : "#fef2f2",
						border: `1px solid ${isConnected ? "#a7f3d0" : "#fecaca"}`,
						boxShadow: `0 4px 12px ${isConnected ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)"}`,
					}}
				>
					<div
						style={{
							width: "8px",
							height: "8px",
							borderRadius: "50%",
							backgroundColor: isConnected ? "#10b981" : "#ef4444",
							animation: isConnected ? "pulse 2s infinite" : "none",
						}}
					/>
					<span
						style={{
							fontSize: "12px",
							fontWeight: 700,
							color: isConnected ? "#047857" : "#b91c1c",
							textTransform: "uppercase",
							letterSpacing: "0.5px",
						}}
					>
						{isConnected ? "Live" : "Offline"}
					</span>
				</div>

				{/* Collaborators */}
				<div style={{ display: "flex", alignItems: "center" }}>
					{/* Avatar Stack */}
					<div style={{ display: "flex" }}>
						{/* My Avatar */}
						<div
							style={{
								position: "relative",
								width: "40px",
								height: "40px",
								borderRadius: "50%",
								backgroundColor: myColor,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontSize: "12px",
								fontWeight: 700,
								color: "white",
								boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
								border: "3px solid white",
								zIndex: 10,
							}}
							title={`You (${myName})`}
						>
							{getInitials(myName)}
							{/* Online indicator */}
							<div
								style={{
									position: "absolute",
									bottom: "-2px",
									right: "-2px",
									width: "14px",
									height: "14px",
									backgroundColor: "#10b981",
									borderRadius: "50%",
									border: "2px solid white",
								}}
							/>
						</div>

						{/* Other Collaborators */}
						{collaborators.slice(0, 4).map((collab, index) => (
							<div
								key={collab.id}
								style={{
									width: "40px",
									height: "40px",
									borderRadius: "50%",
									backgroundColor: collab.color,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									fontSize: "12px",
									fontWeight: 700,
									color: "white",
									boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
									border: "3px solid white",
									marginLeft: "-12px",
									zIndex: 10 - index - 1,
								}}
								title={collab.name}
							>
								{getInitials(collab.name)}
							</div>
						))}

						{/* Overflow Badge */}
						{collaborators.length > 4 && (
							<div
								style={{
									width: "40px",
									height: "40px",
									borderRadius: "50%",
									backgroundColor: "#f1f5f9",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									fontSize: "12px",
									fontWeight: 700,
									color: "#64748b",
									boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
									border: "3px solid white",
									marginLeft: "-12px",
								}}
							>
								+{collaborators.length - 4}
							</div>
						)}
					</div>

					{/* User Count Badge */}
					{collaborators.length > 0 && (
						<div
							style={{
								marginLeft: "12px",
								display: "flex",
								alignItems: "center",
								gap: "6px",
								padding: "8px 12px",
								borderRadius: "999px",
								backgroundColor: "white",
								boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
								border: "1px solid #e5e7eb",
							}}
						>
							<Users size={14} color="#8b5cf6" />
							<span
								style={{ fontSize: "12px", fontWeight: 700, color: "#374151" }}
							>
								{collaborators.length + 1}
							</span>
						</div>
					)}
				</div>

				{/* Share Button */}
				<button
					type="button"
					onClick={() => setShareModalOpen(true)}
					style={{
						display: "flex",
						alignItems: "center",
						gap: "8px",
						padding: "12px 24px",
						borderRadius: "14px",
						background: "linear-gradient(135deg, #8b5cf6, #7c3aed, #6366f1)",
						border: "none",
						cursor: "pointer",
						fontSize: "14px",
						fontWeight: 700,
						color: "white",
						boxShadow: "0 8px 24px rgba(139, 92, 246, 0.35)",
						transition: "all 0.2s ease",
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.transform = "translateY(-1px)";
						e.currentTarget.style.boxShadow =
							"0 12px 32px rgba(139, 92, 246, 0.45)";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.transform = "translateY(0)";
						e.currentTarget.style.boxShadow =
							"0 8px 24px rgba(139, 92, 246, 0.35)";
					}}
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
