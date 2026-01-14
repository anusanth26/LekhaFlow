"use client";

import { useEffect, useState } from "react";

interface ConnectionStatusProps {
	isConnected: boolean;
	isSynced: boolean;
	collaboratorCount: number;
	onReconnect?: () => void;
}

export function ConnectionStatus({
	isConnected,
	isSynced,
	collaboratorCount,
	onReconnect,
}: ConnectionStatusProps) {
	const [showTooltip, setShowTooltip] = useState(false);
	const [isReconnecting, setIsReconnecting] = useState(false);

	// Auto-reconnect logic
	useEffect(() => {
		if (!isConnected && !isReconnecting) {
			setIsReconnecting(true);
			const timer = setTimeout(() => {
				onReconnect?.();
				setIsReconnecting(false);
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [isConnected, isReconnecting, onReconnect]);

	const getStatusColor = () => {
		if (!isConnected) return "#ef4444"; // red
		if (!isSynced) return "#f59e0b"; // amber
		return "#22c55e"; // green
	};

	const getStatusText = () => {
		if (!isConnected) return "Disconnected";
		if (!isSynced) return "Syncing...";
		return "Synced";
	};

	const containerStyle: React.CSSProperties = {
		position: "fixed",
		bottom: "16px",
		left: "50%",
		transform: "translateX(-50%)",
		zIndex: 40,
		display: "flex",
		alignItems: "center",
		gap: "8px",
		padding: "8px 16px",
		backgroundColor: "rgba(255, 255, 255, 0.95)",
		backdropFilter: "blur(8px)",
		borderRadius: "9999px",
		boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1), 0 0 1px rgba(0, 0, 0, 0.1)",
		border: "1px solid rgba(0, 0, 0, 0.05)",
		cursor: "pointer",
		transition: "all 0.2s ease",
	};

	const dotStyle: React.CSSProperties = {
		width: "8px",
		height: "8px",
		borderRadius: "50%",
		backgroundColor: getStatusColor(),
		animation: !isConnected || !isSynced ? "pulse 2s infinite" : "none",
	};

	const textStyle: React.CSSProperties = {
		fontSize: "12px",
		fontWeight: 500,
		color: "#374151",
	};

	const collaboratorStyle: React.CSSProperties = {
		display: "flex",
		alignItems: "center",
		gap: "4px",
		paddingLeft: "8px",
		borderLeft: "1px solid #e5e7eb",
		marginLeft: "4px",
	};

	const avatarStackStyle: React.CSSProperties = {
		display: "flex",
		marginLeft: "-4px",
	};

	const tooltipStyle: React.CSSProperties = {
		position: "absolute",
		bottom: "100%",
		left: "50%",
		transform: "translateX(-50%)",
		marginBottom: "8px",
		padding: "8px 12px",
		backgroundColor: "#1f2937",
		color: "white",
		borderRadius: "8px",
		fontSize: "12px",
		whiteSpace: "nowrap",
		opacity: showTooltip ? 1 : 0,
		visibility: showTooltip ? "visible" : "hidden",
		transition: "opacity 0.2s, visibility 0.2s",
	};

	const reconnectButtonStyle: React.CSSProperties = {
		marginLeft: "8px",
		padding: "4px 8px",
		fontSize: "11px",
		fontWeight: 500,
		color: "#6965db",
		backgroundColor: "#f0f0ff",
		border: "none",
		borderRadius: "4px",
		cursor: "pointer",
	};

	return (
		// biome-ignore lint/a11y/useSemanticElements: Cannot use <button> here as it contains another <button> (invalid HTML)
		<div
			style={{
				...containerStyle,
				background: "transparent",
				border: "none",
				padding: 0,
				font: "inherit",
				textAlign: "inherit",
			}}
			onMouseEnter={() => setShowTooltip(true)}
			onMouseLeave={() => setShowTooltip(false)}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					setShowTooltip(!showTooltip);
				}
			}}
			tabIndex={0}
			role="button"
		>
			{/* Pulse animation */}
			<style>
				{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
			</style>

			{/* Status indicator */}
			<div style={dotStyle} />
			<span style={textStyle}>{getStatusText()}</span>

			{/* Collaborator count */}
			{isConnected && collaboratorCount > 0 && (
				<div style={collaboratorStyle}>
					<div style={avatarStackStyle}>
						{Array.from({ length: Math.min(collaboratorCount, 3) }).map(
							(_, i) => (
								<div
									key={`avatar-${String.fromCharCode(65 + i)}`}
									style={{
										width: "20px",
										height: "20px",
										borderRadius: "50%",
										backgroundColor: `hsl(${(i * 60 + 200) % 360}, 70%, 60%)`,
										border: "2px solid white",
										marginLeft: i > 0 ? "-8px" : "0",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										fontSize: "10px",
										fontWeight: 600,
										color: "white",
									}}
								>
									{String.fromCharCode(65 + i)}
								</div>
							),
						)}
					</div>
					<span style={{ fontSize: "11px", color: "#6b7280" }}>
						{collaboratorCount} online
					</span>
				</div>
			)}

			{/* Reconnect button when disconnected */}
			{!isConnected && (
				<button
					type="button"
					style={reconnectButtonStyle}
					onClick={(e) => {
						e.stopPropagation();
						onReconnect?.();
					}}
				>
					{isReconnecting ? "Reconnecting..." : "Reconnect"}
				</button>
			)}

			{/* Tooltip */}
			<div style={tooltipStyle}>
				{isConnected
					? `Connected • ${collaboratorCount + 1} ${collaboratorCount === 0 ? "person" : "people"} in this room`
					: "Connection lost. Click to reconnect."}
			</div>
		</div>
	);
}
