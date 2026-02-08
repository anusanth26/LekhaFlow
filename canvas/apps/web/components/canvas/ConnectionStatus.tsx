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

	const dotColor = !isConnected
		? "bg-red-500"
		: !isSynced
			? "bg-amber-500"
			: "bg-green-500";

	const statusText = !isConnected
		? "Disconnected"
		: !isSynced
			? "Syncing..."
			: "Synced";

	return (
		<div
			className="fixed bottom-[72px] left-1/2 -translate-x-1/2 z-40"
			onMouseEnter={() => setShowTooltip(true)}
			onMouseLeave={() => setShowTooltip(false)}
			role="status"
		>
			<div className="glass-card rounded-full px-4 py-2 flex items-center gap-2 cursor-default">
				{/* Status dot */}
				<div
					className={`w-2 h-2 rounded-full ${dotColor} ${
						!isConnected || !isSynced ? "animate-pulse-dot" : ""
					}`}
				/>

				{/* Status text */}
				<span className="text-xs font-medium text-gray-600">{statusText}</span>

				{/* Collaborator count */}
				{isConnected && collaboratorCount > 0 && (
					<div className="flex items-center gap-1.5 pl-2 border-l border-gray-200 ml-1">
						<div className="flex -space-x-1.5">
							{Array.from({ length: Math.min(collaboratorCount, 3) }).map(
								(_, i) => (
									<div
										key={`avatar-${String.fromCharCode(65 + i)}`}
										className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white"
										style={{
											backgroundColor: `hsl(${(i * 60 + 200) % 360}, 70%, 60%)`,
										}}
									>
										{String.fromCharCode(65 + i)}
									</div>
								),
							)}
						</div>
						<span className="text-[11px] text-gray-400">
							{collaboratorCount} online
						</span>
					</div>
				)}

				{/* Reconnect button */}
				{!isConnected && (
					<button
						type="button"
						className="ml-2 px-2 py-1 text-[11px] font-medium text-violet-600 bg-violet-50 rounded cursor-pointer border-none hover:bg-violet-100 transition-colors"
						onClick={(e) => {
							e.stopPropagation();
							onReconnect?.();
						}}
					>
						{isReconnecting ? "Reconnecting..." : "Reconnect"}
					</button>
				)}
			</div>

			{/* Tooltip */}
			<div
				className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white rounded-lg text-xs whitespace-nowrap transition-all duration-200 ${
					showTooltip ? "opacity-100 visible" : "opacity-0 invisible"
				}`}
			>
				{isConnected
					? `Connected • ${collaboratorCount + 1} ${collaboratorCount === 0 ? "person" : "people"} in this room`
					: "Connection lost. Click to reconnect."}
			</div>
		</div>
	);
}
