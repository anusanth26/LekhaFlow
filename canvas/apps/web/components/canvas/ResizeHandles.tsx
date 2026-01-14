"use client";

import { Circle, Rect } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";

export type HandlePosition = 
  | "top-left" 
  | "top-right" 
  | "bottom-left" 
  | "bottom-right"
  | "top-center"
  | "bottom-center"
  | "left-center"
  | "right-center";

interface ResizeHandlesProps {
  x: number;
  y: number;
  width: number;
  height: number;
  elementId: string;
  onResizeStart: (elementId: string, handle: HandlePosition, e: KonvaEventObject<MouseEvent>) => void;
  onResizeMove: (elementId: string, handle: HandlePosition, e: KonvaEventObject<MouseEvent>) => void;
  onResizeEnd: (elementId: string) => void;
}

const HANDLE_SIZE = 8;
const HANDLE_COLOR = "#6965db";
const HANDLE_STROKE = "#ffffff";

export function ResizeHandles({
  x,
  y,
  width,
  height,
  elementId,
  onResizeStart,
  onResizeMove,
  onResizeEnd,
}: ResizeHandlesProps) {
  // Calculate handle positions
  const handles: { position: HandlePosition; cx: number; cy: number; cursor: string }[] = [
    // Corners
    { position: "top-left", cx: x, cy: y, cursor: "nwse-resize" },
    { position: "top-right", cx: x + width, cy: y, cursor: "nesw-resize" },
    { position: "bottom-left", cx: x, cy: y + height, cursor: "nesw-resize" },
    { position: "bottom-right", cx: x + width, cy: y + height, cursor: "nwse-resize" },
    // Edges
    { position: "top-center", cx: x + width / 2, cy: y, cursor: "ns-resize" },
    { position: "bottom-center", cx: x + width / 2, cy: y + height, cursor: "ns-resize" },
    { position: "left-center", cx: x, cy: y + height / 2, cursor: "ew-resize" },
    { position: "right-center", cx: x + width, cy: y + height / 2, cursor: "ew-resize" },
  ];

  return (
    <>
      {/* Selection border */}
      <Rect
        x={x - 1}
        y={y - 1}
        width={width + 2}
        height={height + 2}
        stroke={HANDLE_COLOR}
        strokeWidth={1}
        dash={[4, 4]}
        listening={false}
      />

      {/* Resize handles */}
      {handles.map(({ position, cx, cy, cursor }) => (
        <Circle
          key={`handle-${elementId}-${position}`}
          x={cx}
          y={cy}
          radius={HANDLE_SIZE / 2}
          fill={HANDLE_COLOR}
          stroke={HANDLE_STROKE}
          strokeWidth={1}
          draggable
          onMouseEnter={(e) => {
            const container = e.target.getStage()?.container();
            if (container) container.style.cursor = cursor;
          }}
          onMouseLeave={(e) => {
            const container = e.target.getStage()?.container();
            if (container) container.style.cursor = "default";
          }}
          onDragStart={(e) => {
            e.cancelBubble = true;
            onResizeStart(elementId, position, e as unknown as KonvaEventObject<MouseEvent>);
          }}
          onDragMove={(e) => {
            e.cancelBubble = true;
            onResizeMove(elementId, position, e as unknown as KonvaEventObject<MouseEvent>);
          }}
          onDragEnd={(e) => {
            e.cancelBubble = true;
            onResizeEnd(elementId);
          }}
        />
      ))}
    </>
  );
}
