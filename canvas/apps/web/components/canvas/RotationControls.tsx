"use client";

import type { KonvaEventObject } from "konva/lib/Node";
import { useState } from "react";
import { Circle, Group, Line, Path } from "react-konva";

interface RotationControlsProps {
	x: number;
	y: number;
	width: number;
	height: number;
	elementId: string;
	zoom: number;
	scrollX: number;
	scrollY: number;
	onRotate90: (elementId: string) => void;
	onRotationStart: (elementId: string, e: KonvaEventObject<MouseEvent>) => void;
	onRotationMove: (
		elementId: string,
		angle: number,
		e: KonvaEventObject<MouseEvent>,
	) => void;
	onRotationEnd: (elementId: string) => void;
}

const HANDLE_SIZE = 10;
const BUTTON_SIZE = 24;
const HANDLE_COLOR = "#6965db";
const HANDLE_STROKE = "#ffffff";
const BUTTON_BG = "#ffffff";
const HANDLE_OFFSET = 40; // Distance above element

export function RotationControls({
	x,
	y,
	width,
	height,
	elementId,
	zoom,
	scrollX,
	scrollY,
	onRotate90,
	onRotationStart,
	onRotationMove,
	onRotationEnd,
}: RotationControlsProps) {
	const [isDragging, setIsDragging] = useState(false);
	const centerX = x + width / 2;
	const centerY = y + height / 2;

	// Calculate rotation handle position (above the rotation button)
	const handleY = y - HANDLE_OFFSET - BUTTON_SIZE;
	const handleX = centerX;

	// Calculate rotation button position (above element)
	const buttonY = y - HANDLE_OFFSET / 2;
	const buttonX = centerX;

	// Circular arrow icon (cleaner design matching reference)
	const rotateIconPath = `
		M 6 -2
		A 5 5 0 1 1 1 3
		L 1 0
		L 4 3
		L 1 3
		Z
	`;

	return (
		<>
			{/* Connection line from element to rotation controls */}
			<Line
				points={[centerX, y, centerX, handleY]}
				stroke={HANDLE_COLOR}
				strokeWidth={1}
				dash={[4, 4]}
				listening={false}
			/>

			{/* 90° Rotation Button */}
			<Group
				x={buttonX}
				y={buttonY}
				onClick={(e) => {
					e.cancelBubble = true;
					onRotate90(elementId);
				}}
				onMouseEnter={(e) => {
					const container = e.target.getStage()?.container();
					if (container) container.style.cursor = "pointer";
				}}
				onMouseLeave={(e) => {
					const container = e.target.getStage()?.container();
					if (container) container.style.cursor = "default";
				}}
			>
				{/* Button background */}
				<Circle
					radius={BUTTON_SIZE / 2}
					fill={BUTTON_BG}
					stroke={HANDLE_COLOR}
					strokeWidth={2}
					shadowColor="rgba(0,0,0,0.2)"
					shadowBlur={4}
					shadowOffset={{ x: 0, y: 2 }}
				/>

				{/* Rotation icon - circular arrow */}
				<Path
					data={rotateIconPath}
					fill={HANDLE_COLOR}
					scaleX={1.2}
					scaleY={1.2}
				/>
			</Group>

			{/* Arbitrary Rotation Drag Handle */}
			<Circle
				x={handleX}
				y={handleY}
				radius={HANDLE_SIZE / 2}
				fill={isDragging ? "#8b7cf6" : HANDLE_COLOR}
				stroke={HANDLE_STROKE}
				strokeWidth={2}
				draggable
				onMouseEnter={(e) => {
					const container = e.target.getStage()?.container();
					if (container) container.style.cursor = "grab";
				}}
				onMouseLeave={(e) => {
					const container = e.target.getStage()?.container();
					if (container) container.style.cursor = "default";
				}}
				onDragStart={(e) => {
					e.cancelBubble = true;
					setIsDragging(true);
					const container = e.target.getStage()?.container();
					if (container) container.style.cursor = "grabbing";
					onRotationStart(
						elementId,
						e as unknown as KonvaEventObject<MouseEvent>,
					);
				}}
				onDragMove={(e) => {
					e.cancelBubble = true;

					// Get mouse position in screen coordinates
					const stage = e.target.getStage();
					const screenPos = stage?.getPointerPosition();
					if (!screenPos) return;

					// Convert screen coordinates to canvas coordinates
					// Stage transforms: canvas = (screen - scroll) / zoom
					const canvasMouseX = (screenPos.x - scrollX) / zoom;
					const canvasMouseY = (screenPos.y - scrollY) / zoom;

					// Calculate angle from element center (in canvas coordinates) to mouse position (now in canvas coordinates)
					const dx = canvasMouseX - centerX;
					const dy = canvasMouseY - centerY;
					const angleRad = Math.atan2(dy, dx);
					const angleDeg = (angleRad * 180) / Math.PI + 90; // Offset by 90 to make top = 0°

					// Normalize to 0-360
					const normalizedAngle = ((angleDeg % 360) + 360) % 360;

					onRotationMove(
						elementId,
						normalizedAngle,
						e as unknown as KonvaEventObject<MouseEvent>,
					);
				}}
				onDragEnd={(e) => {
					e.cancelBubble = true;
					setIsDragging(false);
					const container = e.target.getStage()?.container();
					if (container) container.style.cursor = "default";
					onRotationEnd(elementId);
				}}
			/>
		</>
	);
}
