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
}

const EXPORT_OPTIONS: ExportOption[] = [
	{
		id: "png",
		icon: <Image size={22} />,
		label: "PNG",
		description: "Raster image",
	},
	{
		id: "svg",
		icon: <FileCode size={22} />,
		label: "SVG",
		description: "Scalable vector",
	},
	{
		id: "json",
		icon: <FileJson size={22} />,
		label: "JSON",
		description: "Raw data",
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
		<div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
			{/* Backdrop */}
			<button
				type="button"
				className="absolute inset-0 bg-black/50 backdrop-blur-sm border-none cursor-default"
				onClick={onClose}
				aria-hidden="true"
				tabIndex={-1}
			/>

			{/* Modal */}
			<div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[480px] overflow-hidden animate-scale-in">
				{/* Header */}
				<div className="bg-gradient-to-br from-violet-500 via-violet-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
							<Download size={22} className="text-white" />
						</div>
						<div>
							<h2 className="text-lg font-bold text-white m-0">
								Export Canvas
							</h2>
							<p className="text-[13px] text-white/70 m-0">
								{elements.length} elements
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="p-2.5 rounded-xl border-none bg-white/10 cursor-pointer hover:bg-white/20 transition-colors"
					>
						<X size={20} className="text-white" />
					</button>
				</div>

				{/* Content */}
				<div className="p-6">
					{/* Format Selection */}
					<div className="mb-5">
						<p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
							Export Format
						</p>
						<div className="flex gap-3">
							{EXPORT_OPTIONS.map((option) => (
								<button
									type="button"
									key={option.id}
									onClick={() => setSelectedFormat(option.id)}
									className={`relative flex-1 py-4 px-3 rounded-xl cursor-pointer transition-all flex flex-col items-center gap-2 border-none ${
										selectedFormat === option.id
											? "bg-violet-50 ring-2 ring-violet-500 shadow-sm"
											: "bg-white ring-1 ring-gray-200 hover:ring-gray-300"
									}`}
								>
									<span
										className={
											selectedFormat === option.id
												? "text-violet-500"
												: "text-gray-400"
										}
									>
										{option.icon}
									</span>
									<span className="text-[13px] font-semibold text-gray-700">
										{option.label}
									</span>
									<span className="text-[11px] text-gray-400">
										{option.description}
									</span>
								</button>
							))}
						</div>
					</div>

					{/* PNG Options */}
					{selectedFormat === "png" && (
						<div className="mb-5">
							<p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
								Scale (Resolution)
							</p>
							<div className="flex gap-2">
								{[1, 2, 3, 4].map((s) => (
									<button
										type="button"
										key={s}
										onClick={() => setScale(s)}
										className={`flex-1 py-2.5 rounded-lg cursor-pointer text-[13px] font-semibold transition-all border-none ${
											scale === s
												? "bg-violet-50 ring-2 ring-violet-500 text-violet-600"
												: "bg-white ring-1 ring-gray-200 text-gray-500 hover:ring-gray-300"
										}`}
									>
										{s}x
									</button>
								))}
							</div>
						</div>
					)}

					{/* Background Option */}
					{(selectedFormat === "png" || selectedFormat === "svg") && (
						<div className="mb-5">
							<label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-gray-50">
								<input
									type="checkbox"
									checked={includeBackground}
									onChange={(e) => setIncludeBackground(e.target.checked)}
									className="w-[18px] h-[18px] accent-violet-500"
								/>
								<span className="text-sm font-medium text-gray-700">
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
						className={`w-full py-3.5 rounded-xl border-none bg-gradient-to-r from-violet-500 to-violet-600 text-white text-[15px] font-bold cursor-pointer flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(139,92,246,0.3)] transition-opacity ${
							isExporting ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"
						}`}
					>
						{isExporting ? (
							<>
								<Loader2 size={18} className="animate-spin" />
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
		</div>
	);
}
