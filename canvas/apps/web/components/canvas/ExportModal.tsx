/**
 * ============================================================================
 * LEKHAFLOW - EXPORT MODAL
 * ============================================================================
 *
 * Modal for exporting canvas as PNG, SVG, or JSON.
 */

"use client";

import type { CanvasElement } from "@repo/common";
import {
	Check,
	Download,
	FileCode,
	FileJson,
	Image,
	Loader2,
	X,
} from "lucide-react";
import type React from "react";
import { useState } from "react";

interface ExportModalProps {
	isOpen: boolean;
	onClose: () => void;
	elements: CanvasElement[];
	// biome-ignore lint/suspicious/noExplicitAny: External library RefObject type
	stageRef: React.RefObject<any>;
}

type ExportFormat = "png" | "svg" | "json";

interface ExportOption {
	id: ExportFormat;
	icon: React.ReactNode;
	label: string;
	description: string;
	color: string;
}

const EXPORT_OPTIONS: ExportOption[] = [
	{
		id: "png",
		icon: <Image size={24} />,
		label: "PNG Image",
		description: "Raster image, best for sharing",
		color: "#22c55e",
	},
	{
		id: "svg",
		icon: <FileCode size={24} />,
		label: "SVG Vector",
		description: "Scalable, editable in design tools",
		color: "#f97316",
	},
	{
		id: "json",
		icon: <FileJson size={24} />,
		label: "JSON Data",
		description: "Raw data, can be imported later",
		color: "#8b5cf6",
	},
];

export function ExportModal({
	isOpen,
	onClose,
	elements,
	stageRef,
}: ExportModalProps) {
	const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("png");
	const [isExporting, setIsExporting] = useState(false);
	const [scale, setScale] = useState(2);
	const [includeBackground, setIncludeBackground] = useState(true);

	const handleExport = async () => {
		setIsExporting(true);

		try {
			const timestamp = new Date().toISOString().slice(0, 10);
			const filename = `lekhaflow-canvas-${timestamp}`;

			switch (selectedFormat) {
				case "png": {
					if (stageRef.current) {
						const dataURL = stageRef.current.toDataURL({
							pixelRatio: scale,
							mimeType: "image/png",
						});
						downloadFile(dataURL, `${filename}.png`);
					}
					break;
				}

				case "svg": {
					// Generate SVG from elements
					const svg = generateSVG(elements, includeBackground);
					const blob = new Blob([svg], { type: "image/svg+xml" });
					const url = URL.createObjectURL(blob);
					downloadFile(url, `${filename}.svg`);
					URL.revokeObjectURL(url);
					break;
				}

				case "json": {
					const data = {
						version: "1.0",
						exportedAt: new Date().toISOString(),
						elements: elements,
					};
					const blob = new Blob([JSON.stringify(data, null, 2)], {
						type: "application/json",
					});
					const url = URL.createObjectURL(blob);
					downloadFile(url, `${filename}.json`);
					URL.revokeObjectURL(url);
					break;
				}
			}

			// Small delay for UX
			await new Promise((r) => setTimeout(r, 500));
			onClose();
		} catch (error) {
			console.error("Export failed:", error);
		} finally {
			setIsExporting(false);
		}
	};

	const downloadFile = (url: string, filename: string) => {
		const link = document.createElement("a");
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const generateSVG = (
		elements: CanvasElement[],
		withBackground: boolean,
	): string => {
		// Calculate bounds
		let minX = Infinity,
			minY = Infinity,
			maxX = -Infinity,
			maxY = -Infinity;

		for (const el of elements) {
			minX = Math.min(minX, el.x);
			minY = Math.min(minY, el.y);
			maxX = Math.max(maxX, el.x + (el.width || 0));
			maxY = Math.max(maxY, el.y + (el.height || 0));
		}

		const padding = 20;
		const width = maxX - minX + padding * 2;
		const height = maxY - minY + padding * 2;
		const offsetX = -minX + padding;
		const offsetY = -minY + padding;

		let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;

		if (withBackground) {
			svgContent += `<rect width="100%" height="100%" fill="#fafafa"/>`;
		}

		for (const el of elements) {
			if (el.isDeleted) continue;

			const x = el.x + offsetX;
			const y = el.y + offsetY;
			const stroke = el.strokeColor || "#1e1e1e";
			const strokeWidth = el.strokeWidth || 1;
			const fill =
				el.backgroundColor === "transparent"
					? "none"
					: el.backgroundColor || "none";
			const opacity = (el.opacity || 100) / 100;

			switch (el.type) {
				case "rectangle":
					svgContent += `<rect x="${x}" y="${y}" width="${el.width}" height="${el.height}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}" opacity="${opacity}"/>`;
					break;
				case "ellipse":
					svgContent += `<ellipse cx="${x + (el.width || 0) / 2}" cy="${y + (el.height || 0) / 2}" rx="${(el.width || 0) / 2}" ry="${(el.height || 0) / 2}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}" opacity="${opacity}"/>`;
					break;
				case "text": {
					const textElement = el as { text?: string };
					svgContent += `<text x="${x}" y="${y + 16}" fill="${stroke}" font-size="16" opacity="${opacity}">${textElement.text || ""}</text>`;
					break;
				}
			}
		}

		svgContent += "</svg>";
		return svgContent;
	};

	if (!isOpen) return null;

	return (
		<div
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 1000,
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
					backgroundColor: "rgba(0,0,0,0.5)",
					backdropFilter: "blur(4px)",
					border: "none",
					cursor: "default",
				}}
				onClick={onClose}
				aria-hidden="true"
				tabIndex={-1}
			/>

			{/* Modal */}
			<div
				style={{
					position: "relative",
					backgroundColor: "white",
					borderRadius: "20px",
					boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
					width: "100%",
					maxWidth: "480px",
					overflow: "hidden",
				}}
			>
				{/* Header */}
				<div
					style={{
						background: "linear-gradient(135deg, #8b5cf6, #7c3aed, #6366f1)",
						padding: "20px 24px",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
						<div
							style={{
								width: "44px",
								height: "44px",
								borderRadius: "12px",
								backgroundColor: "rgba(255,255,255,0.2)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<Download size={22} color="white" />
						</div>
						<div>
							<h2
								style={{
									fontSize: "18px",
									fontWeight: 700,
									color: "white",
									margin: 0,
								}}
							>
								Export Canvas
							</h2>
							<p
								style={{
									fontSize: "13px",
									color: "rgba(255,255,255,0.7)",
									margin: 0,
								}}
							>
								{elements.length} elements
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						style={{
							padding: "10px",
							borderRadius: "10px",
							border: "none",
							backgroundColor: "rgba(255,255,255,0.1)",
							cursor: "pointer",
						}}
					>
						<X size={20} color="white" />
					</button>
				</div>

				{/* Content */}
				<div style={{ padding: "24px" }}>
					{/* Format Selection */}
					<div style={{ marginBottom: "20px" }}>
						<p
							style={{
								fontSize: "12px",
								fontWeight: 600,
								color: "#6b7280",
								textTransform: "uppercase",
								letterSpacing: "0.5px",
								marginBottom: "12px",
								display: "block",
							}}
						>
							Export Format
						</p>
						<div style={{ display: "flex", gap: "12px" }}>
							{EXPORT_OPTIONS.map((option) => (
								<button
									type="button"
									key={option.id}
									onClick={() => setSelectedFormat(option.id)}
									style={{
										flex: 1,
										padding: "16px 12px",
										borderRadius: "12px",
										border: `2px solid ${selectedFormat === option.id ? option.color : "#e5e7eb"}`,
										backgroundColor:
											selectedFormat === option.id
												? `${option.color}10`
												: "white",
										cursor: "pointer",
										transition: "all 0.15s",
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										gap: "8px",
									}}
								>
									<div style={{ color: option.color }}>{option.icon}</div>
									<span
										style={{
											fontSize: "13px",
											fontWeight: 600,
											color: "#374151",
										}}
									>
										{option.label}
									</span>
									{selectedFormat === option.id && (
										<div
											style={{
												position: "absolute",
												top: "-6px",
												right: "-6px",
												width: "20px",
												height: "20px",
												borderRadius: "50%",
												backgroundColor: option.color,
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
											}}
										>
											<Check size={12} color="white" />
										</div>
									)}
								</button>
							))}
						</div>
					</div>

					{/* PNG Options */}
					{selectedFormat === "png" && (
						<div style={{ marginBottom: "20px" }}>
							<p
								style={{
									fontSize: "12px",
									fontWeight: 600,
									color: "#6b7280",
									textTransform: "uppercase",
									letterSpacing: "0.5px",
									marginBottom: "12px",
									display: "block",
								}}
							>
								Scale (Resolution)
							</p>
							<div style={{ display: "flex", gap: "8px" }}>
								{[1, 2, 3, 4].map((s) => (
									<button
										type="button"
										key={s}
										onClick={() => setScale(s)}
										style={{
											flex: 1,
											padding: "10px",
											borderRadius: "8px",
											border: `2px solid ${scale === s ? "#8b5cf6" : "#e5e7eb"}`,
											backgroundColor: scale === s ? "#8b5cf610" : "white",
											cursor: "pointer",
											fontSize: "13px",
											fontWeight: 600,
											color: scale === s ? "#8b5cf6" : "#64748b",
										}}
									>
										{s}x
									</button>
								))}
							</div>
						</div>
					)}

					{/* Background Option */}
					{(selectedFormat === "png" || selectedFormat === "svg") && (
						<div style={{ marginBottom: "20px" }}>
							<label
								style={{
									display: "flex",
									alignItems: "center",
									gap: "12px",
									cursor: "pointer",
									padding: "12px",
									borderRadius: "10px",
									backgroundColor: "#f8fafc",
								}}
							>
								<input
									type="checkbox"
									checked={includeBackground}
									onChange={(e) => setIncludeBackground(e.target.checked)}
									style={{
										width: "18px",
										height: "18px",
										accentColor: "#8b5cf6",
									}}
								/>
								<span
									style={{
										fontSize: "14px",
										fontWeight: 500,
										color: "#374151",
									}}
								>
									Include background
								</span>
							</label>
						</div>
					)}

					{/* Export Button */}
					<button
						type="button"
						onClick={handleExport}
						disabled={isExporting}
						style={{
							width: "100%",
							padding: "14px",
							borderRadius: "12px",
							border: "none",
							background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
							color: "white",
							fontSize: "15px",
							fontWeight: 700,
							cursor: isExporting ? "not-allowed" : "pointer",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: "8px",
							boxShadow: "0 8px 24px rgba(139, 92, 246, 0.3)",
							opacity: isExporting ? 0.7 : 1,
						}}
					>
						{isExporting ? (
							<>
								<Loader2
									size={18}
									style={{ animation: "spin 1s linear infinite" }}
								/>
								Exporting...
							</>
						) : (
							<>
								<Download size={18} />
								Export as {selectedFormat.toUpperCase()}
							</>
						)}
					</button>
				</div>
			</div>

			<style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
		</div>
	);
}
