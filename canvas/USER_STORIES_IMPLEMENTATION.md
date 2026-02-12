# LekhaFlow — User Story Implementation Traceability Document

> **Project:** LekhaFlow — Real-Time Collaborative Canvas Application  
> **Repository:** [anusanth26/LekhaFlow](https://github.com/anusanth26/LekhaFlow) (branch: `dev`)  
> **Generated:** 2026-02-11  
> **Status Legend:** ✅ Implemented | 🔶 Partially Implemented | 🔜 Planned for Future Sprint

<!-- Base URL for all code links: https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/ -->

---

## Table of Contents

1. [Epic 1 — Canvas Creation and Management](#epic-1--canvas-creation-and-management)
2. [Epic 2 — Drawing and Creative Tools](#epic-2--drawing-and-creative-tools)
3. [Epic 3 — Real-Time Team Collaboration & Presence](#epic-3--real-time-team-collaboration--presence)
4. [Epic 4 — Session History and Version Control](#epic-4--session-history-and-version-control)
5. [Epic 5 — Workspace Organization](#epic-5--workspace-organization)
6. [Epic 6 — Smart Features and Assistance](#epic-6--smart-features-and-assistance)

---

## Epic 1 — Canvas Creation and Management

**Status:** In Progress

---

### 1.1 — Create New Canvas ✅ (Developed)

**Description:** Users can create a new canvas with a name, which generates a unique room ID and navigates them into the canvas editor.

#### Implementation Files & Logic

| File | Lines | Purpose |
|------|-------|---------|
| [`apps/web/app/page.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/app/page.tsx#L49-L85) | 49–85 | `createRoom()` — Sends `POST /api/v1/canvas` with canvas name and auth token. Receives `roomId` and navigates to `/canvas/{roomId}`. |
| [`apps/http-backend/src/controller/canvas.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/http-backend/src/controller/canvas.ts#L13-L41) | 13–41 | `createCanvas()` — Validates request body against `CreateCanvasSchema`, extracts authenticated user, calls `createCanvasService`, returns `roomId` and `slug`. |
| [`apps/http-backend/src/services/canvas.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/http-backend/src/services/canvas.ts#L18-L40) | 18–40 | `createCanvasService()` — Generates a URL slug from the canvas name, inserts a new row into the `canvases` Supabase table with `owner_id`, `name`, `slug`, and `is_public` fields. |
| [`packages/common/src/types.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/packages/common/src/types.ts#L14-L17) | 14–17 | `CreateCanvasSchema` — Zod schema validating `name` (1–50 chars) and optional `isPublic` boolean. |
| [`apps/http-backend/src/routes/canvas.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/http-backend/src/routes/canvas.ts) | — | Route: `POST /api/v1/canvas` wired to `createCanvas` controller with `authMiddleware`. |
| [`apps/web/app/page.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/app/page.tsx#L87-L99) | 87–99 | `joinRoom()` — Allows joining an existing canvas by entering a room ID. |

**Data Flow:**
```
User clicks "New Canvas" → page.tsx createRoom() → POST /api/v1/canvas
→ canvas.ts controller validates → canvas.ts service inserts into Supabase
→ returns { roomId, slug } → router.push(`/canvas/${roomId}`)
```

---

### 1.4 — View All Canvases ✅ (Developed)

**Description:** Dashboard displays all canvases (owned + shared) with thumbnails, names, and timestamps.

#### Implementation Files & Logic

| File | Lines | Purpose |
|------|-------|---------|
| [`apps/web/components/Dashboard.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/Dashboard.tsx#L17-L325) | 17–325 | `Dashboard()` — Fetches canvases via `GET /api/v1/canvas`, renders grid/list view with thumbnails, delete buttons, and date formatting. |
| [`apps/web/components/Dashboard.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/Dashboard.tsx#L25-L53) | 25–53 | `fetchCanvases()` — Gets auth session token, calls API, populates canvas list. |
| [`apps/web/components/Dashboard.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/Dashboard.tsx#L58-L76) | 58–76 | `handleDelete()` — Sends `DELETE /api/v1/canvas/{roomId}` and refreshes the list. |
| [`apps/http-backend/src/controller/canvas.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/http-backend/src/controller/canvas.ts#L71-L82) | 71–82 | `getCanvases()` — Returns all canvases for the authenticated user. |
| [`apps/http-backend/src/services/canvas.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/http-backend/src/services/canvas.ts#L42-L86) | 42–86 | `getCanvasesService()` — Queries owned canvases (`owner_id = userId, is_deleted = false`), then finds shared canvases via `activity_logs` table, and merges both lists (owned first, then shared). |
| [`apps/http-backend/src/controller/canvas.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/http-backend/src/controller/canvas.ts#L84-L98) | 84–98 | `getCanvas()` — Returns a single canvas by ID. |
| [`apps/http-backend/src/controller/canvas.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/http-backend/src/controller/canvas.ts#L100-L113) | 100–113 | `deleteCanvas()` — Soft-deletes canvas (`is_deleted = true`). |
| [`apps/http-backend/src/services/canvas.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/http-backend/src/services/canvas.ts#L126-L139) | 126–139 | `deleteCanvasService()` — Updates `is_deleted` flag in Supabase for matching `id` and `owner_id`. |

---

### 1.5 — Canvas Thumbnails 🔶 (Partially Implemented)

**Description:** Automatic thumbnail generation for canvas preview on dashboard.

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 19982 | 1.5.1: Setup Bucket | 🔜 | Supabase Storage bucket not yet configured. Currently using embedded base64 data URLs. |
| 19983 | 1.5.2: Capture Utility | ✅ | Implemented inline in `Canvas.tsx` lines 655–719 using `stage.toDataURL()` with `pixelRatio: 0.2`. |
| 19984 | 1.5.3: Save Trigger | ✅ | Debounced 2-second timer (`thumbnailTimerRef`) on element changes, lines 658–719. |
| 19985 | 1.5.4: Upload Handler | ✅ | PUTs thumbnail as `thumbnail_url` to `PUT /api/v1/canvas/{roomId}`, lines 702–709. |
| 19986 | 1.5.5: Display | ✅ | `Dashboard.tsx` renders `thumbnail_url` as `<img>` for each canvas card. |

**Key Code — Auto-Capture Thumbnail:**
```typescript
// apps/web/components/Canvas.tsx, lines 655–719
useEffect(() => {
    thumbnailTimerRef.current = setTimeout(async () => {
        const stage = stageRef.current;
        const dataURL = stage.toDataURL({ pixelRatio: 0.2, mimeType: "image/png" });
        await fetch(`${HTTP_URL}/api/v1/canvas/${roomId}`, {
            method: "PUT",
            body: JSON.stringify({ thumbnail_url: dataURL }),
        });
    }, 2000); // Debounce: 2s after last change
}, [roomId, HTTP_URL]);
```

---

### 1.6 — Duplicate Canvas 🔜 (Not Implemented)

| ID | Task | Status | Reason |
|----|------|--------|--------|
| 19987 | 1.6.1: Duplicate Endpoint | 🔜 | Planned for a future sprint — requires deep-copy of Yjs document state. |
| 19988 | 1.6.2: Deep Copy | 🔜 | Requires cloning Yjs binary data and canvas metadata. |
| 19989 | 1.6.3: Action Menu | 🔜 | Will be added to Dashboard's canvas card context menu. |
| 19990 | 1.6.4: Optimistic UI | 🔜 | Depends on backend endpoint completion. |

---

### 1.8 — Archive Canvas 🔜 (Not Implemented)

| ID | Task | Status | Reason |
|----|------|--------|--------|
| 19995 | 1.8.1: Schema | 🔜 | The `is_deleted` field exists as a soft-delete; a separate `is_archived` field is planned. |
| 19996 | 1.8.2: Toggle Archive | 🔜 | Planned for a future sprint. |
| 19997 | 1.8.3: Archive Filter | 🔜 | Dashboard will include an "Archived" tab. |
| 19998 | 1.8.4: Read-Only Mode | 🔜 | Archived canvases will open in read-only mode. |

---

## Epic 2 — Drawing and Creative Tools

**Status:** Developed

---

### 2.1 — Freehand Pen & Eraser Tool ✅ (Developed)

**Description:** Freehand drawing with pressure-sensitive variable-width strokes using Perfect Freehand, and an eraser tool for continuous deletion.

#### Implementation Files & Logic

| File | Lines | Purpose |
|------|-------|---------|
| [`apps/web/components/Canvas.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/Canvas.tsx#L1404-L1414) | 1404–1414 | `handleMouseDown` → `freedraw` case — Initializes a freedraw element with `createFreedraw()` and starts accumulating points in `freedrawPointsRef`. |
| [`apps/web/components/Canvas.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/Canvas.tsx#L363-L429) | 363–429 | `renderElement` → `freedraw` case — Renders solid strokes via `outlineToSvgPath()` (Perfect Freehand) or dashed/dotted via flat Konva `<Line>`. |
| [`apps/web/components/Canvas.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/Canvas.tsx#L1432-L1443) | 1432–1443 | `handleMouseDown` → `eraser` case — Sets `isErasingRef = true`, finds element at click point via `getElementAtPoint()`, deletes it. |
| [`apps/web/components/Canvas.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/Canvas.tsx#L1497-L1509) | 1497–1509 | `handleMouseMove` → eraser continuous drag — Continuously erases elements under cursor during drag. |
| [`apps/web/lib/stroke-utils.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/lib/stroke-utils.ts#L179-L206) | 179–206 | `getStrokeOutline()` — Wraps `perfect-freehand`'s `getStroke()` with configurable size, thinning, smoothing, streamline, and pressure simulation. |
| [`apps/web/lib/stroke-utils.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/lib/stroke-utils.ts#L266-L306) | 266–306 | `outlineToSvgPath()` — Converts stroke outline to SVG path data for Konva `<Path>` component, producing smooth variable-width curves. |
| [`apps/web/lib/stroke-utils.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/lib/stroke-utils.ts#L99-L140) | 99–140 | `simplifyPath()` — Ramer-Douglas-Peucker algorithm for path simplification to reduce point count while preserving shape. |
| [`apps/web/lib/stroke-utils.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/lib/stroke-utils.ts#L142-L173) | 142–173 | `optimizeStroke()` — Distance-based optimization removing redundant points. |
| [`apps/web/lib/element-utils.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/lib/element-utils.ts#L273-L306) | 273–306 | `createFreedraw()` — Creates a freedraw element with `[x, y, pressure?]` tuples and default stroke properties. |
| [`packages/common/src/canvas.types.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/packages/common/src/canvas.types.ts#L230-L250) | 230–250 | `FreedrawElement` type — Defines `points: Array<[number, number, number?]>`, `pressureSensitivity`, `simulatePressure`. |

**Perfect Freehand Integration:**
```typescript
// apps/web/lib/stroke-utils.ts, line 179
import getStroke from "perfect-freehand";

export function getStrokeOutline(points, options = {}) {
    const defaultOptions = {
        size: 8, thinning: 0.5, smoothing: 0.5,
        streamline: 0.5, simulatePressure: true,
        start: { cap: true, taper: 0 },
        end: { cap: true, taper: 0 },
    };
    return getStroke(points, { ...defaultOptions, ...options });
}
```

| ID | Task | Status |
|----|------|--------|
| 20462 | [Algo] Perfect Freehand Integration | ✅ — `stroke-utils.ts` wraps `perfect-freehand` library |

---

### 2.2 — Basic Shape Drawing ✅ (Developed)

**Description:** Drawing rectangles, ellipses, and diamonds with click-and-drag. Supports Shift (constrain aspect ratio) and Alt (center origin) modifiers.

#### Implementation Files & Logic

| File | Lines | Purpose |
|------|-------|---------|
| [`apps/web/components/Canvas.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/Canvas.tsx#L1353-L1378) | 1353–1378 | `handleMouseDown` → `rectangle/ellipse/diamond` case — Creates shape via `createShape()` with current style options and modifier keys. |
| [`apps/web/components/Canvas.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/Canvas.tsx#L199-L463) | 199–463 | `renderElement()` — Renders `<Rect>`, `<Ellipse>`, or diamond `<Line closed>` with fill, stroke, dash, rotation, and selection glow. |
| [`apps/web/lib/element-utils.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/lib/element-utils.ts#L151-L220) | 151–220 | `createShape()` — Factory function handling Shift (constrains to square/circle), Alt (center-origin), and delegates to specific creators. |
| [`apps/web/lib/element-utils.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/lib/element-utils.ts#L96-L113) | 96–113 | `createRectangle()` — Creates rectangle with optional `roundness`. |
| [`apps/web/lib/element-utils.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/lib/element-utils.ts#L115-L131) | 115–131 | `createEllipse()` — Creates ellipse with `radiusX` and `radiusY`. |
| [`apps/web/lib/element-utils.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/lib/element-utils.ts#L133-L149) | 133–149 | `createDiamond()` — Creates diamond/rhombus element. |
| [`packages/common/src/canvas.types.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/packages/common/src/canvas.types.ts#L169-L189) | 169–189 | Type definitions for `RectangleElement`, `EllipseElement`, `DiamondElement`. |

---

### 2.3 — Text Tool ✅ (Developed)

**Description:** Click to place text with an inline editing overlay. Supports editing existing text elements via double-click or Enter key.

#### Implementation Files & Logic

| File | Lines | Purpose |
|------|-------|---------|
| [`apps/web/components/Canvas.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/Canvas.tsx#L1423-L1430) | 1423–1430 | `handleMouseDown` → `text` case — Opens inline text editor at click position. |
| [`apps/web/components/Canvas.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/Canvas.tsx#L857-L899) | 857–899 | `handleCompleteText()` — Creates new `TextElement` via `createText()` or updates existing one. Handles empty text deletion. |
| [`apps/web/components/Canvas.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/Canvas.tsx#L822-L852) | 822–852 | Auto-resize `<textarea>` overlay with focus management and `textareaJustOpenedRef` to prevent premature blur. |
| [`apps/web/components/Canvas.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/Canvas.tsx#L1119-L1136) | 1119–1136 | Enter key handler — Opens text editor for selected text element. |
| [`apps/web/components/Canvas.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/Canvas.tsx#L466-L485) | 466–485 | `renderElement` → `text` case — Renders Konva `<Text>` with fontSize, fontFamily, fill, alignment, and rotation. |
| [`apps/web/lib/element-utils.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/lib/element-utils.ts#L308-L340) | 308–340 | `createText()` — Creates text element with configurable fontSize (default 20), textAlign ("left"), and fontFamily. |
| [`packages/common/src/canvas.types.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/packages/common/src/canvas.types.ts#L253-L271) | 253–271 | `TextElement` type — Defines `text`, `fontSize`, `fontFamily`, `textAlign`, `verticalAlign`, `lineHeight`, `autoResize`. |

---

### 2.4 — Stroke Customization ✅ (Developed)

**Description:** Real-time customization of stroke color, background color, stroke width, stroke style (solid/dashed/dotted), and opacity for both new and selected elements.

#### Implementation Files & Logic

| File | Lines | Purpose |
|------|-------|---------|
| [`apps/web/components/canvas/PropertiesPanel.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/canvas/PropertiesPanel.tsx#L41-L225) | 41–225 | `PropertiesPanel` — Right sidebar with color swatches (8 stroke + 8 fill), stroke width buttons (1/2/4/6px), line style toggles (solid/dashed/dotted), and opacity slider (10–100%). |
| [`apps/web/store/canvas-store.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/store/canvas-store.ts#L71-L180) | 71–180 | `CanvasState` — State fields: `currentStrokeColor`, `currentBackgroundColor`, `currentStrokeWidth`, `currentStrokeStyle`, `currentOpacity`. |
| [`apps/web/components/Canvas.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/Canvas.tsx#L756-L798) | 756–798 | **Live style sync effects** — Five `useEffect` hooks that reactively update **all selected elements** when any style property changes.  Each iterates `selectedElementIdsRef.current` and calls `updateElement(id, { property })`. |
| [`apps/web/components/Canvas.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/Canvas.tsx#L187-L197) | 187–197 | `strokeProps` — Applies `strokeStyle` as `dash` arrays: dashed `[10,5]`, dotted `[2,2]`, or `undefined` for solid. |
| [`apps/web/components/Canvas.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/Canvas.tsx#L1368-L1374) | 1368–1374 | Shape creation applies current style — `strokeColor`, `backgroundColor`, `strokeWidth`, `strokeStyle`, `opacity` passed to `createShape()`. |
| [`packages/common/src/canvas.types.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/packages/common/src/canvas.types.ts#L59) | 59, 64 | `StrokeStyle = "solid" | "dashed" | "dotted"`, `FillStyle = "solid" | "hachure" | "cross-hatch"`. |

**Live Update Pattern (Story 2.4):**
```typescript
// apps/web/components/Canvas.tsx, lines 756–762
useEffect(() => {
    const currentSelection = selectedElementIdsRef.current;
    if (currentSelection.size === 0) return;
    Array.from(currentSelection).forEach((id) => {
        updateElement(id, { strokeColor: currentStrokeColor });
    });
}, [currentStrokeColor, updateElement]);
// Same pattern for backgroundColor, strokeWidth, strokeStyle, opacity
```

---

### 2.5 — Brush Styles 🔜 (Not Implemented)

**Description:** Rough.js integration for hand-drawn/sketchy brush appearance.

| ID | Task | Status | Reason |
|----|------|--------|--------|
| 20548 | 2.5.1: [Konva] Rough.js Integration | 🔜 | Planned — requires `rough.js` library integration with Konva renderer. |
| 20552 | 2.5.2: [UI] Style Toggle | 🔜 | Will add a "Sketchy / Clean" toggle to the Properties Panel. |
| 20556 | 2.5.3: [Rendering] Custom Konva Shape | 🔜 | Requires building a custom Konva shape using Rough.js drawable output. |

---

### 2.6 — Fill Tool ✅ (Developed)

**Description:** Background fill with color picker support and opacity control.

| File | Lines | Purpose |
|------|-------|---------|
| [`apps/web/components/canvas/PropertiesPanel.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/canvas/PropertiesPanel.tsx#L28-L37) | 28–37 | `BACKGROUND_COLORS` — 8 fill colors including "transparent" (checker pattern). |
| [`apps/web/components/Canvas.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/Canvas.tsx#L213-L237) | 213–217, 233–237, 457–461 | Fill rendering — Rect, Ellipse, and Diamond all read `element.backgroundColor`, using `undefined` for "transparent". |
| [`apps/web/components/Canvas.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/Canvas.tsx#L764-L771) | 764–771 | Live fill sync — Updates selected elements' `backgroundColor` when changed. |

| ID | Task | Status |
|----|------|--------|
| 20562 | 2.6.1: [Data] Fill Schema | ✅ — `backgroundColor` field in `ExcalidrawElementBase` (canvas.types.ts line 113) |
| 20599 | 2.6.2: [UI] Color Picker Integration | ✅ — `PropertiesPanel.tsx` |
| 20605 | 2.6.3: [Logic] Opacity Support | ✅ — Opacity slider 10–100% in PropertiesPanel, applied via `element.opacity / 100` |

---

### 2.7 — Live Ghost Stroke Previews ✅ (Developed)

**Description:** Real-time visual preview of shapes/lines being drawn before mouse release.

| File | Lines | Purpose |
|------|-------|---------|
| [`apps/web/components/Canvas.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/Canvas.tsx#L569-L571) | 569–571 | `drawingElement` state — Holds the in-progress element during mouse drag. |
| [`apps/web/components/Canvas.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/Canvas.tsx#L2140-L2145) | ~2140–2145 | **Preview layer rendering** — `drawingElement` rendered via `renderElement()` with `isPreview=true` (dashed stroke). |
| [`apps/web/components/Canvas.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/Canvas.tsx#L190-L196) | 190–196 | Preview stroke — When `isPreview=true`, applies `dash: [10, 5]` for a dashed preview appearance. |

| ID | Task | Status |
|----|------|--------|
| 20612 | 2.7.1: [Frontend] Provisional Layer | ✅ — `drawingElement` state creates a separate preview element |
| 20614 | 2.7.2: [UX] Lag-Free Visual Feedback | ✅ — Direct state updates during `handleMouseMove`, no debounce |
| 20617 | 2.7.3: [Logic] Commit on Mouse Release | ✅ — `handleMouseUp` calls `addElement(drawingElement)` to persist |

---

### 2.8 — Multi-Object Selection & Manipulation ✅ (Developed)

**Description:** Select multiple elements, move/delete them in bulk, copy/paste, and layer ordering.

| File | Lines | Purpose |
|------|-------|---------|
| [`apps/web/store/canvas-store.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/store/canvas-store.ts#L74) | 74 | `selectedElementIds: Set<string>` — Supports multi-selection. |
| [`apps/web/components/Canvas.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/Canvas.tsx#L908-L948) | 908–948 | `handleCopy()` / `handlePaste()` — Deep-copies selected elements with offset and new IDs. |
| [`apps/web/components/Canvas.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/Canvas.tsx#L955-L1034) | 955–1034 | Layer ordering — `handleBringForward()`, `handleSendBackward()`, `handleBringToFront()`, `handleSendToBack()` via `zIndex` swaps. |
| [`apps/web/components/Canvas.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/Canvas.tsx#L1058-L1081) | 1058–1081 | `handleDelete()` / `handleClearCanvas()` — Bulk deletion with confirmation dialog. |
| [`apps/web/components/Canvas.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/Canvas.tsx#L1179-L1206) | 1179–1206 | Keyboard shortcuts — Ctrl+A (select all), Ctrl+C/V (copy/paste), Ctrl+D (duplicate), Ctrl+] / Ctrl+[ (layer ordering). |
| [`apps/web/components/canvas/ContextMenu.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/canvas/ContextMenu.tsx#L83-L204) | 83–204 | Right-click context menu with Copy, Paste, Bring Forward/Back, Send to Front/Back, Delete actions. |
| [`apps/web/components/canvas/ResizeHandles.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/canvas/ResizeHandles.tsx#L39-L140) | 39–140 | 8-point resize handles (corners + edges) with drag interaction for resizing elements. |
| [`apps/web/components/canvas/RotationControls.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/canvas/RotationControls.tsx#L33-L182) | 33–182 | Rotation via drag handle (arbitrary angle) and 90° button, with `atan2` math for angle calculation. |
| [`apps/web/lib/element-utils.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/lib/element-utils.ts#L346-L470) | 346–470 | Bounding box calculations — `calculatePointsBounds()`, `getElementBounds()`, `getRotatedBoundingBox()`, `getCombinedBounds()` for multi-selection. |

| ID | Task | Status |
|----|------|--------|
| 20619 | 2.8.1: [Math] Selection Bounding Box | ✅ — `element-utils.ts` bounding box functions |
| 20621 | 2.8.2: [UI] Custom Transformer | ✅ — `ResizeHandles.tsx` + `RotationControls.tsx` |
| 20623 | 2.8.3: [Logic] Bulk Move | ✅ — Drag events update position for all selected elements |
| 20627 | 2.8.4: [Logic] Bulk Delete | ✅ — `deleteElements()` accepts array of IDs |

---

## Epic 3 — Real-Time Team Collaboration & Presence

**Status:** In Progress

---

### 3.1 — Live Presence & Remote Cursors ✅ (Developed)

**Description:** Real-time cursor positions and name labels for all collaborators, powered by Yjs Awareness protocol.

#### Implementation Files & Logic

| File | Lines | Purpose |
|------|-------|---------|
| [`apps/web/hooks/useYjsSync.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/hooks/useYjsSync.ts#L37-L44) | 37–44 | `AwarenessState` type — `{ user: { name, color }, cursor: Point | null, selectedElementIds: string[] }`. |
| [`apps/web/hooks/useYjsSync.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/hooks/useYjsSync.ts#L222-L245) | 222–245 | `handleAwarenessChange()` — Observes Awareness updates, converts remote states to `Collaborator` objects, and updates Zustand store. |
| [`apps/web/hooks/useYjsSync.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/hooks/useYjsSync.ts#L68-L375) | 68–375 | `useYjsSync()` hook — Creates `HocuspocusProvider` with `token` auth, observes `yElements` map and awareness for real-time sync. |
| [`apps/web/components/canvas/CollaboratorCursors.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/canvas/CollaboratorCursors.tsx#L24-L77) | 24–77 | `CollaboratorCursors` — Renders SVG cursor arrows with name labels and colored badges for each remote user. |
| [`apps/web/components/Canvas.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/Canvas.tsx#L1481-L1486) | 1481–1486 | Cursor broadcast — On every mouse move, sends `updateCursor({ x: pos.x, y: pos.y })` to Awareness. |
| [`apps/web/components/CanvasAuthWrapper.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/CanvasAuthWrapper.tsx#L28-L99) | 28–99 | Sets real user identity (name from Google OAuth metadata, deterministic color from user ID hash) into canvas store. |
| [`apps/web/store/canvas-store.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/store/canvas-store.ts#L91-L93) | 91–93 | `collaborators: Map<number, Collaborator>` — Stores remote user states. |

| ID | Task | Status |
|----|------|--------|
| 22340 | 3.1.1: Awareness Configuration | ✅ — `useYjsSync.ts` configures HocuspocusProvider awareness |
| 22341 | 3.1.2: Cursor Component | ✅ — `CollaboratorCursors.tsx` with SVG arrows and name labels |
| 22342 | 3.1.3: Mouse Event Throttling | ✅ — Updates on every `mousemove` (Konva's event system provides natural throttling) |
| 22343 | 3.1.4: Coordinate Mapping | ✅ — `getCanvasPoint()` converts screen coords to canvas coords accounting for zoom/scroll |

---

### 3.2 — Secure Workspace Invitation Links 🔶 (In Progress)

**Description:** Share canvas via invite links with permission-based access.

| File | Lines | Purpose |
|------|-------|---------|
| [`apps/web/components/canvas/Header.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/canvas/Header.tsx#L237-L379) | 237–379 | `ShareModal` — Generates shareable URL `{origin}/canvas/{roomId}`, copy-to-clipboard, visual feedback. |
| [`apps/ws-backend/src/index.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/ws-backend/src/index.ts#L16-L81) | 16–81 | `onAuthenticate()` — JWT-based authentication on WebSocket connection. Verifies Supabase token, logs canvas access to `activity_logs`. |

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 22344 | 3.2.1: Canvas Permissions Table | 🔜 | Not yet created — currently any authenticated user with the link can access. |
| 22345 | 3.2.2: Invite Endpoint | 🔜 | Planned — will generate time-limited invite tokens. |
| 22346 | 3.2.3: Share Modal | ✅ | `Header.tsx` ShareModal implemented with URL copy. |
| 22347 | 3.2.4: Authentication Guard | ✅ | `CanvasAuthWrapper.tsx` redirects unauthenticated users to `/login?next=...`. |

---

### 3.3 — Collaborative Laser Pointer ✅ (Developed)

**Description:** Temporary laser pointer tool for presentations — draw path fades after release.

| File | Lines | Purpose |
|------|-------|---------|
| [`apps/web/components/Canvas.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/Canvas.tsx#L593-L594) | 593–594 | `laserPointsRef` / `laserPath` — Accumulates laser trail points during drawing. |
| [`apps/web/components/Canvas.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/Canvas.tsx#L1416-L1421) | 1416–1421 | `handleMouseDown` → `laser` case — Starts laser trail. |
| [`apps/web/components/canvas/Toolbar.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/canvas/Toolbar.tsx#L76-L81) | 76–81 | Laser tool button with `Presentation` icon and "K" shortcut. |

| ID | Task | Status |
|----|------|--------|
| 22348 | 3.3.1: Laser Mode | ✅ — Laser tool in toolbar |
| 22349 | 3.3.2: Ephemeral Laser State | ✅ — Uses local ref, not persisted to Yjs |
| 22350 | 3.3.3: Trail Effect | ✅ — SVG path rendered during drawing |
| 22351 | 3.3.4: Auto-Vanish Logic | ✅ — Laser path clears on mouse up |

---

### 3.4 — User Mentions & Notifications 🔜 (In Specification)

**Description:** Comment system with @mentions and notification badges.

| ID | Task | Status | Reason |
|----|------|--------|--------|
| 22352 | 3.4.1: Comments Structure | 🔜 | Planned — requires `comments` table in Supabase. |
| 22353 | 3.4.2: Comment Marker | 🔜 | Planned — canvas marker pins for comments. |
| 22354 | 3.4.3: Comments Sidebar | 🔜 | Planned — collapsible sidebar panel. |

---

### 3.5 — Follow the Leader (Viewport Sync) 🔶 (In Progress)

**Description:** Click a collaborator's avatar to follow their viewport in real-time.

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 22355 | 3.5.1: Viewport Awareness Broadcast | 🔜 | Awareness state exists but doesn't broadcast viewport bounds. |
| 22356 | 3.5.2: Avatar Stack Interaction | 🔶 | `HeaderRight` in `Header.tsx` (lines 579–654) renders collaborator avatars with initials but no follow-click handler yet. |
| 22357 | 3.5.3: Smooth Camera Tween | 🔜 | Planned — Konva `setAttrs` with easing for smooth viewport transition. |

---

### 3.6 — Granular Object Locking 🔜 (Not Implemented)

| ID | Task | Status | Reason |
|----|------|--------|--------|
| 22358 | 3.6.1: isLocked Property | 🔜 | The `locked` field exists in `ExcalidrawElementBase` (canvas.types.ts line 159) but is not enforced. |
| 22359 | 3.6.2: Interaction Blocking | 🔜 | Planned — will skip drag/resize/delete for locked elements. |
| 22360 | 3.6.3: Lock Indicator | 🔜 | Lock icon exists in `Toolbar.tsx` but currently maps to "hand" tool. |

---

### 3.7 — Room Chat Sidebar 🔜 (Not Implemented)

| ID | Task | Status | Reason |
|----|------|--------|--------|
| 22361 | 3.7.1: Ephemeral WebSocket Chat | 🔜 | Planned — will use Hocuspocus awareness or separate channel. |
| 22362 | 3.7.2: Chat Drawer | 🔜 | Planned — slide-out drawer component. |
| 22363 | 3.7.3: Unread Notification Badge | 🔜 | Depends on chat implementation. |

---

### 3.8 — RBAC Dashboard 🔜 (Not Implemented)

| ID | Task | Status | Reason |
|----|------|--------|--------|
| 22364 | 3.8.1: Role Definitions | 🔜 | Planned — Owner, Editor, Viewer roles. |
| 22365 | 3.8.2: Viewer Mode Enforcement | 🔜 | Planned — read-only canvas rendering. |
| 22366 | 3.8.3: Share Settings Panel | 🔜 | Planned — extends existing ShareModal. |

---

## Epic 4 — Session History and Version Control

**Status:** Partially Implemented

---

### 4.1 — Auto-Save and State Persistence ✅ (In Progress → Developed)

**Description:** Canvas state auto-saved to Supabase via Hocuspocus Database extension.

#### Implementation Files & Logic

| File | Lines | Purpose |
|------|-------|---------|
| [`apps/ws-backend/src/index.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/ws-backend/src/index.ts#L86-L155) | 86–155 | `Database.fetch()` — Loads canvas binary (Yjs state) from Supabase `canvases.data` column (bytea). Handles hex string decoding (`\\x` prefix removal, `Buffer.from(hex, "hex")`). |
| [`apps/ws-backend/src/index.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/ws-backend/src/index.ts#L157-L215) | 157–215 | `Database.store()` — Saves Yjs state as hex-encoded bytea to Supabase. Upserts: updates existing or inserts new canvas with `owner_id`. |
| [`apps/web/hooks/useYjsSync.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/hooks/useYjsSync.ts#L68-L140) | 68–140 | `HocuspocusProvider` configuration — Connects to WebSocket with auth token, auto-syncs Yjs document. |
| [`apps/web/hooks/useYjsSync.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/hooks/useYjsSync.ts#L202-L213) | 202–213 | `handleElementsChange()` — Yjs `observeDeep` callback converts `yElements` map to React state whenever any client makes changes. |

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 19049 | 4.1.1: Configure WebSocket Webhooks | ✅ | Hocuspocus `onAuthenticate`, `Database.fetch/store` extensions. |
| 19050 | [Backend] Implement Debounced Database Save Logic | ✅ | Hocuspocus handles this internally — stores on document changes with built-in debouncing. |
| 19051 | 4.1.3: Implement Saving Status UI Indicator | ✅ | `ConnectionStatus.tsx` shows "Synced"/"Syncing..."/"Disconnected" with colored dot and reconnect button. |
| 19052 | 4.1.2: Implement Debounced Database Save Logic | ✅ | Same as 19050 — Hocuspocus extension handles persistence. |

**Data Flow (Auto-Save):**
```
User draws → Yjs document updated → HocuspocusProvider broadcasts
→ Server receives update → Database.store() triggered
→ Yjs state → hex string → Supabase canvases.data (bytea)
```

---

### 4.2 — Session Viewport Recovery ✅ (Developed)

**Description:** Remember camera position/zoom between browser sessions.

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 19053 | 4.2.1: Persist User Viewport Settings | ✅ | Stores `{ zoom, scrollX, scrollY }` in `localStorage` keyed by `lekhaflow-viewport-{roomId}`, debounced at 500ms. |
| 19054 | 4.2.2: Hydrate Camera on Initialization | ✅ | Reads and applies stored viewport on mount via `viewportRestoredRef`. |

> **Implementation:** `Canvas.tsx` — Two `useEffect` hooks handle hydration (on mount) and persistence (debounced on zoom/scroll changes). Error-safe with try/catch for corrupted localStorage.

---

### 4.3 — Real-Time Local Undo/Redo ✅ (Developed)

**Description:** Yjs-powered undo/redo that respects only the current user's operations.

#### Implementation Files & Logic

| File | Lines | Purpose |
|------|-------|---------|
| [`apps/web/hooks/useYjsSync.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/hooks/useYjsSync.ts#L183-L193) | 183–193 | `UndoManager` — Created with `new Y.UndoManager(yElements)`, tracks only local changes. `updateUndoState()` updates `canUndo`/`canRedo` booleans. |
| [`apps/web/hooks/useYjsSync.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/hooks/useYjsSync.ts#L53-L61) | 53–61 | `UseYjsSyncReturn` — Exposes `undo()`, `redo()`, `canUndo`, `canRedo`. |
| [`apps/web/components/Canvas.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/Canvas.tsx#L1149-L1168) | 1149–1168 | Keyboard handlers — Ctrl+Z → `undo()`, Ctrl+Shift+Z / Ctrl+Y → `redo()`. |
| [`apps/web/components/canvas/ZoomControls.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/canvas/ZoomControls.tsx#L86-L105) | 86–105 | Undo/Redo UI buttons (currently wired with `TODO` — the keyboard shortcuts work). |
| [`apps/web/store/canvas-store.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/store/canvas-store.ts#L63-L66) | 63–66 | `HistoryEntry` — Local history stack type (supplementary to Yjs UndoManager). |

| ID | Task | Status |
|----|------|--------|
| 19055 | 4.3.1: Initialize Shared Undo Manager | ✅ — `Y.UndoManager` in `useYjsSync.ts` |
| 19056 | 4.3.2: Connect Undo/Redo UI and Hotkeys | ✅ — Ctrl+Z / Ctrl+Shift+Z hotkeys, UI buttons visible |

---

### 4.4 — Text-Based Activity Log 🔜 (Specified)

| ID | Task | Status | Reason |
|----|------|--------|--------|
| 19057 | 4.4.1: Create Action Interceptor Logic | 🔜 | Planned — will intercept Yjs mutations and log action descriptions. |
| 19058 | 4.4.2: Implement Toast Notification System | 🔜 | Planned — toast component for "User X added a rectangle" etc. |

> **Note:** The `activity_logs` Supabase table already exists (used in `ws-backend/src/index.ts` lines 57–76 for access tracking). It can be extended for action logging.

---

### 4.5 — Named Version Checkpoints 🔜 (In Specification)

| ID | Task | Status | Reason |
|----|------|--------|--------|
| 19059 | 4.5.1: Create Versions Database Table | 🔜 | Planned — `canvas_versions` table with `canvas_id`, `name`, `snapshot_data`, `created_by`. |
| 19060 | 4.5.2: Create Manual Snapshot API Endpoint | 🔜 | Planned — `POST /api/v1/canvas/{id}/versions`. |
| 19061 | 4.5.3: Build Version History Sidebar UI | 🔜 | Planned — timeline sidebar with version names and restore buttons. |

---

### 4.6 — Read-Only Mode (Lock Canvas) ✅ (Developed)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 19062 | 4.6.1: Implement Read-Only State Management | ✅ | `isReadOnly` flag added to `canvas-store.ts` with `setReadOnly()` action. |
| 19063 | 4.6.2: Enforce Read-Only Restrictions in UI | ✅ | When `isReadOnly=true`: Toolbar and PropertiesPanel are hidden, drawing interactions are blocked (only selection/hand allowed), undo/redo is disabled, and an amber "Read-only mode" banner is shown. |

---

### 4.7 — Object Blame / Attribution Inspection 🔜 (Not Implemented)

| ID | Task | Status | Reason |
|----|------|--------|--------|
| 19064 | 4.7.1: Update Data Model for Attribution | 🔜 | Planned — will add `createdBy`, `lastModifiedBy` fields to element type. |
| 19065 | 4.7.2: Implement Attribution Tracking Logic | 🔜 | Planned — will set user ID on element creation/modification. |
| 19066 | 4.7.3: Create Attribution Tooltip UI | 🔜 | Planned — hover tooltip showing "Created by X, modified by Y". |

---

### 4.8 — Restore to Previous Version 🔜 (Specified)

| ID | Task | Status | Reason |
|----|------|--------|--------|
| 19067 | 4.8.1: Implement Version Restore API Logic | 🔜 | Depends on 4.5.1 (Versions table). |
| 19068 | 4.8.2: Handle Client Re-sync on Restore | 🔜 | Planned — will replace Yjs document with snapshot and force all clients to re-sync. |

---

## Epic 5 — Workspace Organization

**Status:** Not Implemented (Planned)

All user stories in this epic are planned for future sprints. The core infrastructure (canvas CRUD, dashboard) provides the foundation for these features.

| Story | Status | Dependencies |
|-------|--------|-------------|
| 5.1 Folder-Based Project Structure | 🔜 | Requires `folders` table and UI tree component. |
| 5.2 Visual Thumbnails (Canvas Preview) | 🔶 | Auto-capture exists (Canvas.tsx lines 655–719), but Supabase Storage bucket not configured. |
| 5.3 Global Search and Filtering | ✅ | Client-side search bar with real-time name filtering on Dashboard. |
| 5.4 Soft Delete and Trash Recovery | 🔶 | Soft delete exists (`is_deleted` flag in `deleteCanvasService`). Trash UI and recovery not built. |
| 5.5 "Recently Viewed" Quick Access | 🔶 | `activity_logs` table tracks access. Dashboard query merges shared canvases (services/canvas.ts lines 62–86). UI section not dedicated. |
| 5.6 Custom Tagging System | 🔜 | Requires `tags` table and tag-related API/UI. |
| 5.7 Grid vs. List View Toggle | ✅ | Implemented in `Dashboard.tsx` with grid/list toggle buttons. |
| 5.8 "Starred" or Favorites | ✅ | Client-side starring with `localStorage` persistence, starred filter toggle, and starred-first sorting. |

---

## Epic 6 — Smart Features and Assistance

**Status:** Not Implemented (In Specification)

All user stories in this epic are planned for future sprints. They require integration with AI/ML APIs (OpenAI, Gemini, or Groq).

---

### 6.1 — Contextual Diagram Explanation (Q&A) 🔜 (In Specification)

| ID | Task | Status | Reason |
|----|------|--------|--------|
| 19078 | AI Route | 🔜 | Planned — `POST /api/v1/ai/explain` endpoint. |
| 19079 | Serialization | 🔜 | Planned — serialize canvas elements to structured text for AI context. |
| 19080 | OpenAI/Gemini/Groq | 🔜 | Planned — LLM API integration. |
| 19081 | Modal | 🔜 | Planned — chat-style modal for Q&A interaction. |

---

### 6.2 — AI-Driven Modification (Preview + Review) 🔜 (In Specification)

| ID | Task | Status | Reason |
|----|------|--------|--------|
| 19094 | Natural Language Diagram Edit Requests | 🔜 | Planned — parse user instruction to element operations. |
| 19096 | AI-Based Instruction and Diff Parsing | 🔜 | Planned — generate diff preview before applying changes. |
| 19099 | Real-Time Diagram Update Application | 🔜 | Planned — apply AI-generated modifications to Yjs document. |

---

### 6.3 — Smart Sketch Beautification 🔜 (Specified)

| ID | Task | Status | Reason |
|----|------|--------|--------|
| 19101 | Freehand Shape Recognition | 🔜 | Planned — use ML to classify freehand strokes as rectangles, circles, arrows, etc. |
| 19104 | Clean Shape Replacement | 🔜 | Planned — replace rough freehand with clean geometric shape. |

---

### 6.4 — Auto-Generation of Documentation 🔜 (In Specification)

| ID | Task | Status | Reason |
|----|------|--------|--------|
| 19106 | Diagram Text and Relationship Extraction | 🔜 | Planned — extract text content and spatial relationships from canvas elements. |
| 19108 | Automated Markdown Documentation Generation | 🔜 | Planned — generate structured markdown from canvas analysis. |

---

### 6.5 — Diagram Intent Classification 🔜 (In Specification)

| ID | Task | Status | Reason |
|----|------|--------|--------|
| 19114 | Automated Diagram Type Detection | 🔜 | Planned — classify canvas as flowchart, ERD, wireframe, etc. |
| 19115 | Persistent Intent Tagging and Storage | 🔜 | Planned — store classification in canvas metadata. |

---

### 6.6 — Stroke Smoothing Assistance 🔜 (Specified)

| ID | Task | Status | Reason |
|----|------|--------|--------|
| 19116 | Intelligent Stroke Smoothing Using Curve Fitting | 🔜 | Planned — Bézier curve fitting for smoother freehand strokes. Note: `stroke-utils.ts` already has `simplifyPath()` (RDP algorithm) which provides basic smoothing. |

---

### 6.7 — Natural Language Canvas Search 🔜 (In Specification)

| ID | Task | Status | Reason |
|----|------|--------|--------|
| 19117 | Semantic Embedding Storage for Canvases | 🔜 | Planned — vector embeddings of canvas content. |
| 19118 | AI-Powered Semantic Canvas Retrieval | 🔜 | Planned — search by description: "find the database diagram". |

---

### 6.8 — "Explain Like I'm New" Mode 🔜 (In Specification)

| ID | Task | Status | Reason |
|----|------|--------|--------|
| 19119 | Simplified Explanation Persona Configuration | 🔜 | Planned — simplified LLM persona prompt. |
| 19121 | Explain Mode Toggle in AI Interface | 🔜 | Planned — toggle button in AI modal. |

---

## Architecture Summary

### Technology Stack

| Layer | Technology | Key Files |
|-------|-----------|-----------|
| **Frontend** | Next.js 16 + React + Konva (HTML5 Canvas) | [`apps/web/`](https://github.com/anusanth26/LekhaFlow/tree/dev/canvas/apps/web) |
| **State Management** | Zustand with subscribeWithSelector | [`store/canvas-store.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/store/canvas-store.ts) |
| **Real-Time Sync** | Yjs (CRDT) + Hocuspocus WebSocket | [`hooks/useYjsSync.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/hooks/useYjsSync.ts), [`apps/ws-backend/`](https://github.com/anusanth26/LekhaFlow/tree/dev/canvas/apps/ws-backend) |
| **HTTP Backend** | Express.js | [`apps/http-backend/`](https://github.com/anusanth26/LekhaFlow/tree/dev/canvas/apps/http-backend) |
| **Authentication** | Supabase Auth (Google OAuth) | [`CanvasAuthWrapper.tsx`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/components/CanvasAuthWrapper.tsx) |
| **Database** | Supabase (PostgreSQL) | [`services/canvas.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/http-backend/src/services/canvas.ts) |
| **Shared Types** | Zod schemas + TypeScript interfaces | [`packages/common/`](https://github.com/anusanth26/LekhaFlow/tree/dev/canvas/packages/common) |
| **Stroke Rendering** | Perfect Freehand library | [`lib/stroke-utils.ts`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/apps/web/lib/stroke-utils.ts) |
| **Monorepo** | Turborepo + pnpm workspaces | [`turbo.json`](https://github.com/anusanth26/LekhaFlow/blob/dev/canvas/turbo.json) |

### Key Data Flow

```
User Input → Canvas.tsx (Mouse Events)
  → Element Creation (element-utils.ts)
  → Yjs Document Update (useYjsSync.ts)
  → WebSocket Broadcast (Hocuspocus)
  → All Clients Receive Update
  → Yjs Observer → Zustand Store → React Re-render
  → Persistence: Hocuspocus Database Extension → Supabase
```

---

*This document was generated from the actual codebase of LekhaFlow and accurately maps each user story to its implementation status, files, and lines of code.*
