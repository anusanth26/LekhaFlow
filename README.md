# Canvas Store

This directory contains the state management for the LekhaFlow canvas application using Zustand.

## Overview

The canvas store manages all application state including canvas elements, UI controls, collaboration data, and synchronization status. It integrates with Yjs for real-time collaborative editing.

## Architecture

The store is organized into four main areas:

1. **Elements State** - Canvas elements, selection, and history
2. **UI State** - Active tools, colors, and visual settings
3. **Collaboration State** - Connected users and cursors
4. **Sync State** - Connection and synchronization status

## Store Files

- `canvas-store.ts` - Main Zustand store with all state and actions
- `index.ts` - Store exports

## Data Flow

1. User action triggers store action
2. Action updates Yjs document (not React state directly)
3. Yjs broadcasts update to all connected clients
4. Yjs observer fires and updates React state
5. React re-renders with new state

This ensures all clients stay synchronized in real-time.

## Usage

```typescript
import { useCanvasStore } from '@/store';

function MyComponent() {
  const { elements, addElement, activeTool } = useCanvasStore();
  
  // Use state and actions
}
```

## Key Features

- **Real-time collaboration** via Yjs integration
- **Undo/redo** with history management
- **Element management** (add, update, delete)
- **Tool system** (pen, eraser, rectangle, etc.)
- **Color management** (stroke and fill colors)
- **Collaborator tracking** with presence awareness
