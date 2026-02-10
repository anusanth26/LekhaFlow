# PowerShell script to apply all User Story 2.1, 2.2, 2.3 changes
# Run this from canvas folder: .\APPLY_STORIES_2.1_2.2_2.3.ps1

$ErrorActionPreference = "Stop"

$canvasPath = "apps\web\components\Canvas.tsx"
$toolbarPath = "apps\web\components\canvas\Toolbar.tsx"

Write-Host "Applying User Story 2.1, 2.2, 2.3 changes..." -ForegroundColor Cyan

# Read the Canvas.tsx file
$content = Get-Content $canvasPath -Raw

# Story 2.1 & 2.2 & 2.3: Add imports
$content = $content -replace 'import { Ellipse, Layer, Line, Rect, Stage, Text } from "react-konva";', 'import { Ellipse, Layer, Line, Path, Rect, Stage, Text } from "react-konva";'

$oldImport = @'
import {
	createArrow,
	createEllipse,
	createFreedraw,
	createLine,
	createRectangle,
	createText,
	getElementAtPoint,
} from "../lib/element-utils";
'@

$newImport = @'
import {
	createArrow,
	createDiamond,
	createEllipse,
	createFreedraw,
	createLine,
	createRectangle,
	createShape,
	createText,
	getElementAtPoint,
	type ShapeModifiers,
} from "../lib/element-utils";
import {
	getStrokeOutline,
	optimizeStroke,
Human: Looks like your last response got cut off. Can you continue from where you left off?