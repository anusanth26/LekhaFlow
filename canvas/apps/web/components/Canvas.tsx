/**
 * ============================================================================
 * LEKHAFLOW - MAIN CANVAS COMPONENT
 * ============================================================================
 *
 * LINE-BY-LINE EXPLANATION OF THE SYNC ENGINE INTEGRATION:
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                    CANVAS COMPONENT ARCHITECTURE                        │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │                                                                         │
 * │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
 * │  │   Canvas    │    │  useYjsSync │    │ Zustand     │                 │
 * │  │ Component   │◄───│    Hook     │◄───│   Store     │                 │
 * │  └─────────────┘    └─────────────┘    └─────────────┘                 │
 * │         │                  │                  │                        │
 * │         │ Mouse Events     │ Yjs Updates      │ State                  │
 * │         ▼                  ▼                  ▼                        │
 * │  ┌─────────────────────────────────────────────────────┐              │
 * │  │                 React Konva Stage                   │              │
 * │  │  - Renders all elements from store                  │              │
 * │  │  - Handles mouse/touch interactions                 │              │
 * │  │  - Supports zoom and pan                            │              │
 * │  └─────────────────────────────────────────────────────┘              │
 * │                                                                         │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * DATA FLOW (When User Draws):
 *
 * 1. User clicks and drags on canvas
 * 2. Mouse events trigger element creation/update
 * 3. useYjsSync.addElement() updates Yjs document
 * 4. Yjs broadcasts update to server
 * 5. Server broadcasts to other clients
 * 6. All clients' Yjs observers fire
 * 7. Zustand store updates with new elements
 * 8. React re-renders the canvas
 *
 * This ensures REAL-TIME COLLABORATION:
 * - All users see the same canvas state
 * - No manual refresh needed
 * - Conflicts are auto-resolved by CRDT
 */

"use client";

import type {
	ArrowElement,
	CanvasElement,
	FreedrawElement,
	LineElement,
	Point,
	TextElement,
	Tool,
} from "@repo/common";
import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { useCallback, useEffect, useRef, useState } from "react";

import { Ellipse, Layer, Line, Path, Rect, Stage, Text } from "react-konva";

import { useYjsSync } from "../hooks/useYjsSync";
import {
	createArrow,
	createFreedraw,
	createShape,
	createText,
	getElementAtPoint,
	type ShapeModifiers,
} from "../lib/element-utils";
import { outlineToSvgPath } from "../lib/stroke-utils";
import {
	useCanvasStore,
	useCollaboratorsArray,
	useElementsArray,
} from "../store/canvas-store";
import { CollaboratorCursors } from "./canvas/CollaboratorCursors";
import { ConnectionStatus } from "./canvas/ConnectionStatus";
import { ContextMenu } from "./canvas/ContextMenu";
import { ExportModal } from "./canvas/ExportModal";
import { HeaderLeft, HeaderRight } from "./canvas/Header";
import { HelpPanel } from "./canvas/HelpPanel";
import { PropertiesPanel } from "./canvas/PropertiesPanel";
// Import components directly to avoid circular dependencies through barrel exports
import { Toolbar } from "./canvas/Toolbar";
import { ZoomControls } from "./canvas/ZoomControls";

// ============================================================================
// TYPES
// ============================================================================

interface CanvasProps {
	roomId: string;
	token?: string | null;
}

// ============================================================================
// HELPER: RENDER ELEMENT
// ============================================================================

/**
 * Render a single element based on its type
 *
 * @param element - The element to render
 * @param isSelected - Whether the element is selected
 * @param isDraggable - Whether the element can be dragged
 * @param isPreview - Whether this is a preview (dashed rendering)
 * @param onDragEnd - Callback when drag ends
 */
function renderElement(
	element: CanvasElement,
	_isSelected: boolean,
	isDraggable: boolean,
	isPreview: boolean,
	onDragEnd: (id: string, x: number, y: number) => void,
) {
	const commonProps = {
		id: element.id,
		x: element.x,
		y: element.y,
		opacity: element.opacity / 100,
		rotation: element.angle,
		draggable: isDraggable,
		onDragEnd: (e: KonvaEventObject<DragEvent>) => {
			onDragEnd(element.id, e.target.x(), e.target.y());
		},
	};

	const strokeProps = {
		stroke: element.strokeColor,
		strokeWidth: element.strokeWidth,
		dash: isPreview
			? [10, 5] // Dashed preview
			: element.strokeStyle === "dashed"
				? [10, 5]
				: element.strokeStyle === "dotted"
					? [2, 2]
					: undefined,
	};

	switch (element.type) {
		case "rectangle":
			return (
				<Rect
					key={element.id}
					{...commonProps}
					{...strokeProps}
					width={element.width}
					height={element.height}
					fill={
						element.backgroundColor === "transparent"
							? undefined
							: element.backgroundColor
					}
					cornerRadius={element.roundness?.value ?? 0}
				/>
			);

		case "ellipse":
			return (
				<Ellipse
					key={element.id}
					{...commonProps}
					{...strokeProps}
					radiusX={Math.abs(element.width) / 2}
					radiusY={Math.abs(element.height) / 2}
					offsetX={-element.width / 2}
					offsetY={-element.height / 2}
					fill={
						element.backgroundColor === "transparent"
							? undefined
							: element.backgroundColor
					}
				/>
			);

		case "line":
		case "arrow": {
			const lineElement = element as LineElement | ArrowElement;
			const points = lineElement.points.flatMap((p) => [p.x, p.y]);
			return (
				<Line
					key={element.id}
					{...commonProps}
					{...strokeProps}
					points={points}
					tension={0}
					lineCap="round"
					lineJoin="round"
					// Expand hit region for thin strokes (Story 2.4)
					hitStrokeWidth={Math.max(element.strokeWidth, 10)}
					// Arrow heads for arrow type
					{...(element.type === "arrow" && {
						pointerLength: 10,
						pointerWidth: 10,
					})}
				/>
			);
		}

		case "freedraw": {
			const freedrawElement = element as FreedrawElement;
			// Use perfect-freehand for variable-width strokes
			// Convert points to [x, y] format (strip optional pressure)
			const points = freedrawElement.points.map(
				([x, y]) => [x, y] as [number, number],
			);
			const pathData = outlineToSvgPath(points);
			return (
				<Path
					key={element.id}
					id={element.id}
					x={element.x}
					y={element.y}
					data={pathData}
					fill={element.strokeColor}
					opacity={element.opacity / 100}
					rotation={element.angle}
					draggable={isDraggable}
					onDragEnd={(e: KonvaEventObject<DragEvent>) => {
						onDragEnd(element.id, e.target.x(), e.target.y());
					}}
				/>
			);
		}

		case "diamond": {
			const w = element.width;
			const h = element.height;
			const diamondPoints = [
				w / 2,
				0, // top
				w,
				h / 2, // right
				w / 2,
				h, // bottom
				0,
				h / 2, // left
				w / 2,
				0, // close path
			];
			return (
				<Line
					key={element.id}
					{...commonProps}
					{...strokeProps}
					points={diamondPoints}
					closed={true}
					// Expand hit region for thin strokes (Story 2.4)
					hitStrokeWidth={Math.max(element.strokeWidth, 10)}
					fill={
						element.backgroundColor === "transparent"
							? undefined
							: element.backgroundColor
					}
				/>
			);
		}

		case "text": {
			const textElement = element as TextElement;
			return (
				<Text
					key={element.id}
					{...commonProps}
					text={textElement.text}
					fontSize={textElement.fontSize}
					fontFamily="Arial"
					fill={element.strokeColor}
					width={element.width || undefined}
					align={textElement.textAlign}
				/>
			);
		}

		default:
			return null;
	}
}

// ============================================================================
// MAIN CANVAS COMPONENT
// ============================================================================

export function Canvas({ roomId, token }: CanvasProps) {
	// ─────────────────────────────────────────────────────────────────
	// REFS
	// ─────────────────────────────────────────────────────────────────

	const stageRef = useRef<Konva.Stage>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// ─────────────────────────────────────────────────────────────────
	// SYNC HOOK - The heart of collaboration!
	// ─────────────────────────────────────────────────────────────────

	/**
	 * useYjsSync connects to the WebSocket server and handles:
	 * - Document synchronization
	 * - Element CRUD operations
	 * - Awareness (cursors/presence)
	 * - Undo/Redo
	 */
	const {
		addElement,
		updateElement,
		deleteElements,
		updateCursor,
		updateSelection,
		undo,
		redo,
	} = useYjsSync(roomId, token ?? null);

	// ─────────────────────────────────────────────────────────────────
	// STORE - Local state synced with Yjs
	// ─────────────────────────────────────────────────────────────────

	const {
		activeTool,
		setActiveTool,
		selectedElementIds,
		setSelectedElementIds,
		clearSelection,
		currentStrokeColor,
		currentBackgroundColor,
		currentStrokeWidth,
		currentStrokeStyle,
		currentOpacity,
		zoom,
		scrollX,
		scrollY,
		setScroll,
		isDrawing,
		setIsDrawing,
		isDragging,
		setIsDragging,
		interactionStartPoint,
		setInteractionStartPoint,
		isConnected,
		isSynced,
	} = useCanvasStore();

	// Elements and collaborators from store
	const elements = useElementsArray();
	const collaborators = useCollaboratorsArray();

	// ─────────────────────────────────────────────────────────────────
	// LOCAL STATE for drawing
	// ─────────────────────────────────────────────────────────────────

	// Track element being currently drawn
	const [drawingElement, setDrawingElement] = useState<CanvasElement | null>(
		null,
	);

	// Keyboard modifiers for shape creation
	const [shiftPressed, setShiftPressed] = useState(false);
	const [altPressed, setAltPressed] = useState(false);

	// Text editing state
	const [editingText, setEditingText] = useState<{
		x: number;
		y: number;
		initialText?: string;
	} | null>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const textareaJustOpenedRef = useRef<boolean>(false);

	// Freedraw points accumulator
	const freedrawPointsRef = useRef<Array<[number, number]>>([]);

	// Eraser state - track continuous drag
	const isErasingRef = useRef<boolean>(false);
	const erasedElementsRef = useRef<Set<string>>(new Set());

	// Pressure tracking for freedraw
	const lastPointTimeRef = useRef<number>(Date.now());

	// Container dimensions
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

	// Clipboard for copy/paste
	const [clipboard, setClipboard] = useState<CanvasElement[]>([]);

	// Context menu state
	const [contextMenu, setContextMenu] = useState<{
		x: number;
		y: number;
		visible: boolean;
	}>({
		x: 0,
		y: 0,
		visible: false,
	});

	// Export modal state
	const [showExportModal, setShowExportModal] = useState(false);

	// Reconnect function
	const handleReconnect = useCallback(() => {
		// The hook will automatically reconnect when the component re-initializes
		// For now, we can just reload the page or re-establish the connection
		window.location.reload();
	}, []);

	// ─────────────────────────────────────────────────────────────────
	// EFFECTS
	// ─────────────────────────────────────────────────────────────────

	// Set container dimensions
	useEffect(() => {
		const updateDimensions = () => {
			if (containerRef.current) {
				setDimensions({
					width: containerRef.current.clientWidth,
					height: containerRef.current.clientHeight,
				});
			}
		};

		updateDimensions();
		window.addEventListener("resize", updateDimensions);
		return () => window.removeEventListener("resize", updateDimensions);
	}, []);

	// Update selection awareness when selection changes
	useEffect(() => {
		updateSelection(Array.from(selectedElementIds));
	}, [selectedElementIds, updateSelection]);

	// Update selected elements when stroke color changes (Story 2.4)
	// biome-ignore lint/correctness/useExhaustiveDependencies: Intentionally only trigger on color change, not selection change
	useEffect(() => {
		if (selectedElementIds.size === 0) return;
		Array.from(selectedElementIds).forEach((id) => {
			updateElement(id, { strokeColor: currentStrokeColor });
		});
	}, [currentStrokeColor]);

	// Update selected elements when background color changes (Story 2.4)
	// biome-ignore lint/correctness/useExhaustiveDependencies: Intentionally only trigger on color change, not selection change
	useEffect(() => {
		if (selectedElementIds.size === 0) return;
		Array.from(selectedElementIds).forEach((id) => {
			updateElement(id, { backgroundColor: currentBackgroundColor });
		});
	}, [currentBackgroundColor]);

	// Update selected elements when stroke width changes (Story 2.4)
	// biome-ignore lint/correctness/useExhaustiveDependencies: Intentionally only trigger on width change, not selection change
	useEffect(() => {
		if (selectedElementIds.size === 0) return;
		Array.from(selectedElementIds).forEach((id) => {
			updateElement(id, { strokeWidth: currentStrokeWidth });
		});
	}, [currentStrokeWidth]);

	// Update selected elements when stroke style changes (Story 2.4)
	// biome-ignore lint/correctness/useExhaustiveDependencies: Intentionally only trigger on style change, not selection change
	useEffect(() => {
		if (selectedElementIds.size === 0) return;
		Array.from(selectedElementIds).forEach((id) => {
			updateElement(id, { strokeStyle: currentStrokeStyle });
		});
	}, [currentStrokeStyle]);

	// Update selected elements when opacity changes (Story 2.4)
	// biome-ignore lint/correctness/useExhaustiveDependencies: Intentionally only trigger on opacity change, not selection change
	useEffect(() => {
		if (selectedElementIds.size === 0) return;
		Array.from(selectedElementIds).forEach((id) => {
			updateElement(id, { opacity: currentOpacity });
		});
	}, [currentOpacity]);

	// Track keyboard modifiers for shape creation (Shift for aspect ratio, Alt for center scaling)
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Shift") setShiftPressed(true);
			if (e.key === "Alt") setAltPressed(true);
		};

		const handleKeyUp = (e: KeyboardEvent) => {
			if (e.key === "Shift") setShiftPressed(false);
			if (e.key === "Alt") setAltPressed(false);
		};

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
		};
	}, []);

	// Auto-resize textarea when editing text
	useEffect(() => {
		if (editingText && textareaRef.current) {
			const textarea = textareaRef.current;

			// Mark that we just opened the textarea to prevent immediate blur
			textareaJustOpenedRef.current = true;

			// Use setTimeout to ensure focus happens after render
			setTimeout(() => {
				textarea.focus();
				textarea.select();
				// Allow blur events after a short delay
				setTimeout(() => {
					textareaJustOpenedRef.current = false;
				}, 100);
			}, 0);

			// Auto-resize function
			const resize = () => {
				textarea.style.height = "auto";
				textarea.style.height = `${textarea.scrollHeight}px`;
			};

			resize();
			textarea.addEventListener("input", resize);

			return () => {
				textarea.removeEventListener("input", resize);
			};
		}
	}, [editingText]);

	/**
	 * Complete text editing and create text element
	 */
	const handleCompleteText = useCallback(
		(text: string) => {
			if (editingText && text.trim()) {
				const newText = createText(editingText.x, editingText.y, text, {
					strokeColor: currentStrokeColor,
					opacity: currentOpacity,
				});
				addElement(newText);
			}
			setEditingText(null);
		},
		[editingText, currentStrokeColor, currentOpacity, addElement],
	);

	// ─────────────────────────────────────────────────────────────────
	// COPY / PASTE / LAYER HANDLERS
	// ─────────────────────────────────────────────────────────────────

	/**
	 * Copy selected elements to clipboard
	 */
	const handleCopy = useCallback(() => {
		if (selectedElementIds.size === 0) return;

		const selectedElements = elements.filter((el) =>
			selectedElementIds.has(el.id),
		);
		setClipboard(selectedElements);
	}, [selectedElementIds, elements]);

	/**
	 * Paste elements from clipboard
	 */
	const handlePaste = useCallback(() => {
		if (clipboard.length === 0) return;

		const newIds = new Set<string>();
		const offset = 20; // Offset for pasted elements

		for (const el of clipboard) {
			const newId = `${el.id}-copy-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
			const newElement: CanvasElement = {
				...el,
				id: newId,
				x: el.x + offset,
				y: el.y + offset,
				version: 0,
				created: Date.now(),
				updated: Date.now(),
			};
			addElement(newElement);
			newIds.add(newId);
		}

		// Select pasted elements
		setSelectedElementIds(newIds);
	}, [clipboard, addElement, setSelectedElementIds]);

	/**
	 * Bring selected elements forward (increase z-index)
	 */
	const handleBringForward = useCallback(() => {
		if (selectedElementIds.size === 0) return;

		Array.from(selectedElementIds).forEach((id) => {
			const element = elements.find((el) => el.id === id);
			if (element) {
				updateElement(id, { zIndex: (element.zIndex || 0) + 1 });
			}
		});
	}, [selectedElementIds, elements, updateElement]);

	/**
	 * Send selected elements backward (decrease z-index)
	 */
	const handleSendBackward = useCallback(() => {
		if (selectedElementIds.size === 0) return;

		Array.from(selectedElementIds).forEach((id) => {
			const element = elements.find((el) => el.id === id);
			if (element) {
				updateElement(id, { zIndex: Math.max(0, (element.zIndex || 0) - 1) });
			}
		});
	}, [selectedElementIds, elements, updateElement]);

	/**
	 * Bring selected elements to front (max z-index)
	 */
	const handleBringToFront = useCallback(() => {
		if (selectedElementIds.size === 0) return;

		const maxZ = Math.max(...elements.map((el) => el.zIndex || 0), 0);

		Array.from(selectedElementIds).forEach((id) => {
			updateElement(id, { zIndex: maxZ + 1 });
		});
	}, [selectedElementIds, elements, updateElement]);

	/**
	 * Send selected elements to back (z-index = 0)
	 */
	const handleSendToBack = useCallback(() => {
		if (selectedElementIds.size === 0) return;

		Array.from(selectedElementIds).forEach((id) => {
			updateElement(id, { zIndex: 0 });
		});
	}, [selectedElementIds, updateElement]);

	/**
	 * Handle context menu (right-click)
	 */
	const handleContextMenu = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		setContextMenu({
			x: e.clientX,
			y: e.clientY,
			visible: true,
		});
	}, []);

	/**
	 * Close context menu
	 */
	const closeContextMenu = useCallback(() => {
		setContextMenu((prev) => ({ ...prev, visible: false }));
	}, []);

	/**
	 * Handle delete from context menu
	 */
	const handleDelete = useCallback(() => {
		if (selectedElementIds.size > 0) {
			deleteElements(Array.from(selectedElementIds));
			clearSelection();
		}
	}, [selectedElementIds, deleteElements, clearSelection]);

	// ─────────────────────────────────────────────────────────────────
	// KEYBOARD SHORTCUTS
	// ─────────────────────────────────────────────────────────────────

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Ignore if typing in input
			if (
				e.target instanceof HTMLInputElement ||
				e.target instanceof HTMLTextAreaElement
			) {
				return;
			}

			// Tool shortcuts
			const toolShortcuts: Record<string, Tool> = {
				v: "selection",
				h: "hand",
				r: "rectangle",
				o: "ellipse",
				d: "diamond",
				l: "line",
				a: "arrow",
				p: "freedraw",
				t: "text",
				e: "eraser",
			};

			const tool = toolShortcuts[e.key.toLowerCase()];
			if (tool) {
				setActiveTool(tool);
				return;
			}

			// Delete selected elements
			if (
				(e.key === "Delete" || e.key === "Backspace") &&
				selectedElementIds.size > 0
			) {
				deleteElements(Array.from(selectedElementIds));
				clearSelection();
				return;
			}

			// Undo: Ctrl/Cmd + Z
			if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
				e.preventDefault();
				undo();
				return;
			}

			// Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
			if (
				(e.ctrlKey || e.metaKey) &&
				(e.key === "y" || (e.key === "z" && e.shiftKey))
			) {
				e.preventDefault();
				redo();
				return;
			}

			// Escape: Clear selection or cancel drawing
			if (e.key === "Escape") {
				clearSelection();
				setIsDrawing(false);
				setDrawingElement(null);
				return;
			}

			// Select all: Ctrl/Cmd + A
			if ((e.ctrlKey || e.metaKey) && e.key === "a") {
				e.preventDefault();
				setSelectedElementIds(new Set(elements.map((el) => el.id)));
				return;
			}

			// Copy: Ctrl/Cmd + C
			if ((e.ctrlKey || e.metaKey) && e.key === "c") {
				e.preventDefault();
				handleCopy();
				return;
			}

			// Paste: Ctrl/Cmd + V
			if ((e.ctrlKey || e.metaKey) && e.key === "v") {
				e.preventDefault();
				handlePaste();
				return;
			}

			// Duplicate: Ctrl/Cmd + D
			if ((e.ctrlKey || e.metaKey) && e.key === "d") {
				e.preventDefault();
				handleCopy();
				handlePaste();
				return;
			}

			// Bring to front: Ctrl/Cmd + ]
			if ((e.ctrlKey || e.metaKey) && e.key === "]") {
				e.preventDefault();
				handleBringToFront();
				return;
			}

			// Send to back: Ctrl/Cmd + [
			if ((e.ctrlKey || e.metaKey) && e.key === "[") {
				e.preventDefault();
				handleSendToBack();
				return;
			}

			// Export: Ctrl/Cmd + E
			if ((e.ctrlKey || e.metaKey) && e.key === "e") {
				e.preventDefault();
				setShowExportModal(true);
				return;
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [
		setActiveTool,
		selectedElementIds,
		deleteElements,
		clearSelection,
		undo,
		redo,
		setIsDrawing,
		elements,
		setSelectedElementIds,
		handleCopy,
		handlePaste,
		handleBringToFront,
		handleSendToBack,
	]);

	// ─────────────────────────────────────────────────────────────────
	// EVENT HANDLERS
	// ─────────────────────────────────────────────────────────────────

	/**
	 * Get canvas-relative point from mouse event
	 */
	const getCanvasPoint = useCallback(
		(_e: KonvaEventObject<MouseEvent>): Point => {
			const stage = stageRef.current;
			if (!stage) return { x: 0, y: 0 };

			const pos = stage.getPointerPosition();
			if (!pos) return { x: 0, y: 0 };

			// Account for zoom and scroll
			return {
				x: (pos.x - scrollX) / zoom,
				y: (pos.y - scrollY) / zoom,
			};
		},
		[scrollX, scrollY, zoom],
	);

	/**
	 * Handle mouse down - Start drawing or selection
	 *
	 * FLOW:
	 * 1. Get click position
	 * 2. Based on active tool:
	 *    - Selection: Check if clicking element
	 *    - Drawing: Start new element
	 *    - Hand: Start panning
	 */
	const handleMouseDown = useCallback(
		(e: KonvaEventObject<MouseEvent>) => {
			const point = getCanvasPoint(e);
			setInteractionStartPoint(point);

			// Don't handle if clicking on existing element (for drag)
			const clickedOnEmpty = e.target === e.target.getStage();

			switch (activeTool) {
				case "selection":
					if (clickedOnEmpty) {
						clearSelection();
					} else {
						// Check if clicked on an element
						const clickedElement = getElementAtPoint(point, elements);
						if (clickedElement) {
							if (!selectedElementIds.has(clickedElement.id)) {
								setSelectedElementIds(new Set([clickedElement.id]));
							}
							setIsDragging(true);
						}
					}
					break;

				case "hand":
					setIsDragging(true);
					break;

				case "rectangle":
				case "ellipse":
				case "diamond": {
					setIsDrawing(true);
					const modifiers: ShapeModifiers = {
						shift: shiftPressed,
						alt: altPressed,
					};
					const newShape = createShape(
						activeTool as "rectangle" | "ellipse" | "diamond",
						point.x,
						point.y,
						0,
						0,
						modifiers,
						{
							strokeColor: currentStrokeColor,
							backgroundColor: currentBackgroundColor,
							strokeWidth: currentStrokeWidth,
							strokeStyle: currentStrokeStyle,
							opacity: currentOpacity,
						},
					);
					setDrawingElement(newShape);
					break;
				}

				case "arrow": {
					setIsDrawing(true);
					const newArrow = createArrow(point.x, point.y, [{ x: 0, y: 0 }], {
						strokeColor: currentStrokeColor,
						strokeWidth: currentStrokeWidth,
						strokeStyle: currentStrokeStyle,
						opacity: currentOpacity,
					});
					setDrawingElement(newArrow);
					break;
				}

				case "freedraw": {
					setIsDrawing(true);
					freedrawPointsRef.current = [[0, 0]];
					const newFreedraw = createFreedraw(point.x, point.y, [[0, 0]], {
						strokeColor: currentStrokeColor,
						strokeWidth: currentStrokeWidth,
						opacity: currentOpacity,
					});
					setDrawingElement(newFreedraw);
					break;
				}

				case "text": {
					// Open text editor overlay instead of prompt
					setEditingText({
						x: point.x,
						y: point.y,
					});
					break;
				}

				case "eraser": {
					// Start erasing - enable continuous drag deletion
					isErasingRef.current = true;
					erasedElementsRef.current.clear();

					const elementToDelete = getElementAtPoint(point, elements);
					if (elementToDelete) {
						deleteElements([elementToDelete.id]);
						erasedElementsRef.current.add(elementToDelete.id);
					}
					break;
				}
			}
		},
		[
			getCanvasPoint,
			activeTool,
			elements,
			selectedElementIds,
			setSelectedElementIds,
			clearSelection,
			setIsDrawing,
			setIsDragging,
			setInteractionStartPoint,
			currentStrokeColor,
			currentBackgroundColor,
			currentStrokeWidth,
			currentStrokeStyle,
			currentOpacity,
			shiftPressed,
			altPressed,
			deleteElements,
		],
	);

	/**
	 * Handle mouse move - Update drawing or pan
	 *
	 * FLOW:
	 * 1. Update cursor position for awareness
	 * 2. If drawing: Update element dimensions
	 * 3. If panning: Update scroll position
	 */
	const handleMouseMove = useCallback(
		(e: KonvaEventObject<MouseEvent>) => {
			const point = getCanvasPoint(e);

			// Update cursor position for collaboration
			const stage = stageRef.current;
			const pos = stage?.getPointerPosition();
			if (pos) {
				updateCursor({ x: pos.x, y: pos.y });
			}

			// Handle hand tool panning
			if (isDragging && activeTool === "hand" && interactionStartPoint) {
				const dx = point.x - interactionStartPoint.x;
				const dy = point.y - interactionStartPoint.y;
				setScroll(scrollX + dx * zoom, scrollY + dy * zoom);
				return;
			}

			// Handle eraser continuous drag deletion
			if (isErasingRef.current && activeTool === "eraser") {
				const elementToDelete = getElementAtPoint(point, elements);
				if (
					elementToDelete &&
					!erasedElementsRef.current.has(elementToDelete.id)
				) {
					deleteElements([elementToDelete.id]);
					erasedElementsRef.current.add(elementToDelete.id);
				}
				return;
			}

			// Handle drawing
			if (!isDrawing || !drawingElement || !interactionStartPoint) return;

			const dx = point.x - interactionStartPoint.x;
			const dy = point.y - interactionStartPoint.y;

			switch (drawingElement.type) {
				case "rectangle":
				case "ellipse":
				case "diamond": {
					// Apply shape modifiers (Shift for aspect ratio, Alt for center scaling)
					const modifiers: ShapeModifiers = {
						shift: shiftPressed,
						alt: altPressed,
					};
					let width = dx;
					let height = dy;
					let x = drawingElement.x;
					let y = drawingElement.y;

					// Apply aspect ratio lock (Shift key)
					if (modifiers.shift) {
						const size = Math.max(Math.abs(width), Math.abs(height));
						width = width >= 0 ? size : -size;
						height = height >= 0 ? size : -size;
					}

					// Apply center scaling (Alt key)
					if (modifiers.alt) {
						x = interactionStartPoint.x - width / 2;
						y = interactionStartPoint.y - height / 2;
						width = width * 2;
						height = height * 2;
					}

					setDrawingElement({
						...drawingElement,
						x,
						y,
						width,
						height,
					} as CanvasElement);
					break;
				}

				case "line":
				case "arrow": {
					const lineElement = drawingElement as LineElement | ArrowElement;
					setDrawingElement({
						...lineElement,
						points: [
							{ x: 0, y: 0 },
							{ x: dx, y: dy },
						],
						width: Math.abs(dx),
						height: Math.abs(dy),
					} as CanvasElement);
					break;
				}

				case "freedraw": {
					// Add point to freedraw path
					freedrawPointsRef.current.push([dx, dy]);

					setDrawingElement({
						...drawingElement,
						points: [...freedrawPointsRef.current],
					} as FreedrawElement);
					break;
				}
			}
		},
		[
			getCanvasPoint,
			updateCursor,
			isDragging,
			activeTool,
			interactionStartPoint,
			scrollX,
			scrollY,
			zoom,
			setScroll,
			isDrawing,
			drawingElement,
			shiftPressed,
			altPressed,
			elements,
			deleteElements,
		],
	);

	/**
	 * Handle mouse up - Finish drawing
	 *
	 * FLOW:
	 * 1. If drawing: Finalize element and add to Yjs
	 * 2. Reset drawing state
	 */
	const handleMouseUp = useCallback(() => {
		// Finalize drawing
		if (isDrawing && drawingElement) {
			// Only add if element has size
			if (
				Math.abs(drawingElement.width) > 5 ||
				Math.abs(drawingElement.height) > 5
			) {
				// Normalize negative dimensions
				const finalElement = { ...drawingElement };

				if (finalElement.width < 0) {
					finalElement.x += finalElement.width;
					finalElement.width = Math.abs(finalElement.width);
				}
				if (finalElement.height < 0) {
					finalElement.y += finalElement.height;
					finalElement.height = Math.abs(finalElement.height);
				}

				// Add to Yjs - this syncs to all clients!
				addElement(finalElement);

				// Select the new element
				setSelectedElementIds(new Set([finalElement.id]));
			}
		}

		// Reset state
		setIsDrawing(false);
		setIsDragging(false);
		setDrawingElement(null);
		setInteractionStartPoint(null);
		freedrawPointsRef.current = [];

		// Clear eraser state
		isErasingRef.current = false;
		erasedElementsRef.current.clear();

		// Reset pressure tracking
		lastPointTimeRef.current = Date.now();
	}, [
		isDrawing,
		drawingElement,
		addElement,
		setSelectedElementIds,
		setIsDrawing,
		setIsDragging,
		setInteractionStartPoint,
	]);

	/**
	 * Handle element drag end - Update position in Yjs
	 */
	const handleElementDragEnd = useCallback(
		(id: string, x: number, y: number) => {
			updateElement(id, { x, y });
		},
		[updateElement],
	);

	/**
	 * Handle mouse leave - Clear cursor from awareness
	 */
	const handleMouseLeave = useCallback(() => {
		updateCursor(null);
	}, [updateCursor]);

	// ─────────────────────────────────────────────────────────────────
	// RENDER
	// ─────────────────────────────────────────────────────────────────

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: Context menu handler for canvas area
		<div
			ref={containerRef}
			className="relative w-full h-full overflow-hidden"
			style={{ backgroundColor: "#fafafa" }}
			onContextMenu={handleContextMenu}
		>
			{/* Clean dot grid background - Excalidraw style */}
			<div
				className="absolute inset-0 pointer-events-none"
				style={{
					backgroundImage: `
            radial-gradient(circle, #d4d4d4 1px, transparent 1px)
          `,
					backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
					backgroundPosition: `${scrollX}px ${scrollY}px`,
				}}
			/>

			{/* UI Components */}
			<HeaderLeft />
			<HeaderRight />
			<Toolbar />
			<PropertiesPanel />
			<ZoomControls />
			<HelpPanel />

			{/* Collaborator Cursors */}
			<CollaboratorCursors collaborators={collaborators} />

			{/* Connection Status */}
			<ConnectionStatus
				isConnected={isConnected}
				isSynced={isSynced}
				collaboratorCount={collaborators.length}
				onReconnect={handleReconnect}
			/>

			{/* Canvas Stage */}
			<Stage
				ref={stageRef}
				width={dimensions.width || window.innerWidth}
				height={dimensions.height || window.innerHeight}
				scaleX={zoom}
				scaleY={zoom}
				x={scrollX}
				y={scrollY}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseLeave}
				style={{
					cursor:
						activeTool === "hand"
							? isDragging
								? "grabbing"
								: "grab"
							: activeTool === "selection"
								? "default"
								: "crosshair",
				}}
			>
				<Layer>
					{/* Render existing elements */}
					{elements.map((element) =>
						renderElement(
							element,
							selectedElementIds.has(element.id),
							activeTool === "selection",
							false, // not preview
							handleElementDragEnd,
						),
					)}

					{/* Render element being drawn */}
					{drawingElement &&
						renderElement(drawingElement, false, false, true, () => {})}
				</Layer>
			</Stage>

			{/* Help Text (bottom right) */}
			<div className="absolute bottom-4 right-4 z-20 text-xs text-gray-400">
				Press <kbd className="px-1 py-0.5 bg-gray-100 rounded">?</kbd> for
				shortcuts
			</div>

			{/* Context Menu */}
			<ContextMenu
				x={contextMenu.x}
				y={contextMenu.y}
				isVisible={contextMenu.visible}
				hasSelection={selectedElementIds.size > 0}
				onClose={closeContextMenu}
				onCopy={handleCopy}
				onPaste={handlePaste}
				onDelete={handleDelete}
				onBringForward={handleBringForward}
				onSendBackward={handleSendBackward}
				onBringToFront={handleBringToFront}
				onSendToBack={handleSendToBack}
			/>

			{/* Text Editing Overlay */}
			{editingText && (
				<div
					style={{
						position: "absolute",
						left: `${editingText.x * zoom + scrollX}px`,
						top: `${editingText.y * zoom + scrollY}px`,
						zIndex: 1000,
					}}
				>
					<textarea
						ref={textareaRef}
						defaultValue={editingText.initialText || ""}
						style={{
							fontSize: "16px",
							fontFamily: "Arial",
							color: currentStrokeColor,
							background: "white",
							border: "2px solid #6965db",
							borderRadius: "4px",
							padding: "8px",
							minWidth: "200px",
							minHeight: "40px",
							resize: "none",
							overflow: "hidden",
							outline: "none",
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								handleCompleteText(e.currentTarget.value);
							} else if (e.key === "Escape") {
								setEditingText(null);
							}
						}}
						onBlur={(e) => {
							// Ignore blur if textarea just opened (prevents immediate close)
							if (textareaJustOpenedRef.current) {
								return;
							}
							handleCompleteText(e.currentTarget.value);
						}}
					/>
				</div>
			)}

			{/* Export Modal */}
			<ExportModal
				isOpen={showExportModal}
				onClose={() => setShowExportModal(false)}
				elements={elements}
				stageRef={stageRef}
			/>
		</div>
	);
}
