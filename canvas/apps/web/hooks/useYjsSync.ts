/**
 * ============================================================================
 * LEKHAFLOW - YJS SYNC HOOK
 * ============================================================================
 * 
 * Core synchronization hook that bridges React state with Yjs CRDT.
 * 
 * LINE-BY-LINE EXPLANATION:
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                         SYNC ARCHITECTURE                               │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │                                                                         │
 * │  React Component                                                        │
 * │       │                                                                 │
 * │       ▼                                                                 │
 * │  ┌─────────────┐    observe()     ┌─────────────┐                      │
 * │  │ Zustand     │◄─────────────────│   Y.Map     │                      │
 * │  │ Store       │                  │  (elements) │                      │
 * │  └─────────────┘                  └─────────────┘                      │
 * │       │                                  ▲                              │
 * │       │ User Action                      │ Sync                         │
 * │       ▼                                  │                              │
 * │  ┌─────────────┐    set/delete    ┌─────────────┐                      │
 * │  │ addElement  │─────────────────►│  WebSocket  │                      │
 * │  │ updateElem  │                  │  Provider   │                      │
 * │  │ deleteElem  │                  └─────────────┘                      │
 * │  └─────────────┘                        │                              │
 * │                                         ▼                              │
 * │                                  ┌─────────────┐                      │
 * │                                  │   Server    │                      │
 * │                                  │ (y-websocket)                      │
 * │                                  └─────────────┘                      │
 * │                                                                         │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * KEY PRINCIPLE: UNIDIRECTIONAL DATA FLOW
 * 
 * When user draws a shape:
 * 1. DON'T update React state directly
 * 2. DO update Yjs document (yElements.set)
 * 3. Yjs notifies all observers
 * 4. Observer updates React state
 * 5. React re-renders
 * 
 * This ensures ALL clients get the update, including the originator!
 */

"use client";

import { useEffect, useRef, useMemo, useCallback } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import type { CanvasElement, Collaborator, Point } from "@repo/common";
import { useCanvasStore } from "../store";

// ============================================================================
// CONFIGURATION
// ============================================================================

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Awareness state structure
 * This is ephemeral data that's NOT persisted
 */
interface AwarenessState {
  /** User display name */
  name: string;
  /** User color (for cursor/avatar) */
  color: string;
  /** Current cursor position */
  cursor: Point | null;
  /** Currently selected element IDs */
  selectedElementIds: string[];
}

/**
 * Return type of the hook
 */
interface UseYjsSyncReturn {
  /** Yjs document instance */
  doc: Y.Doc;
  /** WebSocket provider instance */
  provider: WebsocketProvider | null;
  /** Add a new element to the canvas */
  addElement: (element: CanvasElement) => void;
  /** Update an existing element */
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  /** Delete elements by IDs */
  deleteElements: (ids: string[]) => void;
  /** Update local cursor position */
  updateCursor: (position: Point | null) => void;
  /** Update local selection (for awareness) */
  updateSelection: (ids: string[]) => void;
  /** Get the Yjs elements map directly */
  getYElements: () => Y.Map<CanvasElement>;
  /** Undo last change */
  undo: () => void;
  /** Redo last undone change */
  redo: () => void;
  /** Check if can undo */
  canUndo: boolean;
  /** Check if can redo */
  canRedo: boolean;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Main sync hook
 * 
 * @param roomId - Room identifier for collaboration
 * @returns Sync API for interacting with the canvas
 * 
 * LIFECYCLE:
 * 1. Create Y.Doc (local CRDT database)
 * 2. Connect WebSocketProvider (network layer)
 * 3. Set up observers (sync Y.Doc changes to React)
 * 4. Set up awareness (cursor/presence)
 * 5. Return API for mutations
 * 6. Cleanup on unmount
 */
export function useYjsSync(roomId: string): UseYjsSyncReturn {
  // ─────────────────────────────────────────────────────────────────
  // STEP 1: CREATE YJS DOCUMENT
  // ─────────────────────────────────────────────────────────────────
  
  /**
   * Y.Doc is the core CRDT document.
   * 
   * useMemo ensures we create it only once.
   * The doc contains shared data types (Y.Map, Y.Array, Y.Text)
   * that automatically merge changes from all clients.
   */
  const doc = useMemo(() => new Y.Doc(), []);
  
  /**
   * Y.UndoManager tracks changes for undo/redo.
   * We'll set this up after getting the Y.Map.
   */
  const undoManagerRef = useRef<Y.UndoManager | null>(null);
  
  /**
   * Provider ref for cleanup
   */
  const providerRef = useRef<WebsocketProvider | null>(null);

  // Get store actions
  const {
    setElements,
    setCollaborators,
    setConnectionStatus,
    setRoomId,
    myName,
    myColor,
    selectedElementIds,
  } = useCanvasStore();

  // ─────────────────────────────────────────────────────────────────
  // STEP 2: GET SHARED DATA STRUCTURES
  // ─────────────────────────────────────────────────────────────────
  
  /**
   * Get the shared Y.Map for elements.
   * 
   * doc.getMap("elements") either:
   * - Creates a new empty map (if first client)
   * - Returns existing map with synced data (if joining)
   * 
   * The string "elements" is the key - all clients must use
   * the same key to share the same data.
   */
  const getYElements = useCallback((): Y.Map<CanvasElement> => {
    return doc.getMap<CanvasElement>("elements");
  }, [doc]);

  // ─────────────────────────────────────────────────────────────────
  // STEP 3: CONNECT TO SERVER
  // ─────────────────────────────────────────────────────────────────
  
  useEffect(() => {
    /**
     * Create WebSocket provider.
     * 
     * The provider handles:
     * - WebSocket connection management
     * - Yjs sync protocol (state vectors, updates)
     * - Awareness protocol (ephemeral state)
     * - Automatic reconnection
     * 
     * Parameters:
     * - WS_URL: WebSocket server address
     * - roomId: Room name (becomes URL path)
     * - doc: Y.Doc to sync
     */
    const provider = new WebsocketProvider(WS_URL, roomId, doc);
    providerRef.current = provider;
    
    // Store room ID in state
    setRoomId(roomId);
    
    // ─────────────────────────────────────────────────────────────────
    // STEP 4: SET UP ELEMENT OBSERVER
    // ─────────────────────────────────────────────────────────────────
    
    const yElements = getYElements();
    
    /**
     * Set up undo manager
     * 
     * Y.UndoManager tracks changes to specified types.
     * It understands CRDT semantics, so undo works correctly
     * even with concurrent edits from other users!
     */
    undoManagerRef.current = new Y.UndoManager(yElements, {
      // Group changes within 500ms into single undo step
      captureTimeout: 500,
    });
    
    /**
     * Observer callback - fires when Y.Map changes.
     * 
     * This is THE CRITICAL SYNC POINT!
     * 
     * When this fires:
     * - Could be local change (user drew something)
     * - Could be remote change (other user drew something)
     * - We DON'T CARE which - we always update React state
     * 
     * The callback receives a Y.YMapEvent with:
     * - event.changes: What changed (added/updated/deleted keys)
     * - event.transaction: The transaction context
     */
    const handleElementsChange = () => {
      // Convert Y.Map to regular Map for React state
      // toJSON() returns a plain object, we convert to Map
      const elementsObj = yElements.toJSON() as Record<string, CanvasElement>;
      const elementsMap = new Map<string, CanvasElement>();
      
      for (const [id, element] of Object.entries(elementsObj)) {
        // Filter out soft-deleted elements
        if (!element.isDeleted) {
          elementsMap.set(id, element);
        }
      }
      
      // Update React state
      // This triggers re-render with new elements
      setElements(elementsMap);
    };
    
    // Subscribe to changes
    yElements.observe(handleElementsChange);
    
    // Initial sync - get existing elements
    handleElementsChange();
    
    // ─────────────────────────────────────────────────────────────────
    // STEP 5: SET UP AWARENESS
    // ─────────────────────────────────────────────────────────────────
    
    /**
     * Awareness tracks ephemeral user state:
     * - Cursor positions
     * - Selections
     * - User info (name, color)
     * 
     * Unlike Y.Doc data, awareness is:
     * - NOT persisted
     * - Automatically expires after ~30 seconds
     * - Perfect for presence features
     */
    const awareness = provider.awareness;
    
    // Set our initial awareness state
    awareness.setLocalState({
      name: myName,
      color: myColor,
      cursor: null,
      selectedElementIds: [],
    } as AwarenessState);
    
    /**
     * Handle awareness changes from other users.
     * 
     * When any user moves their cursor or changes selection,
     * this callback fires with the updated states.
     */
    const handleAwarenessChange = () => {
      const states = awareness.getStates();
      const collaborators = new Map<number, Collaborator>();
      
      // Iterate through all connected clients
      // Note: Yjs awareness states are typed as Map<number, { [x: string]: any }>
      // so we cast to our expected shape after validation
      states.forEach((state, clientId) => {
        // Skip our own client
        if (clientId === doc.clientID) return;
        
        // Skip clients without valid state (type guard)
        const awarenessState = state as AwarenessState | undefined;
        if (!awarenessState?.name) return;
        
        collaborators.set(clientId, {
          id: String(clientId),
          name: awarenessState.name,
          color: awarenessState.color,
          cursor: awarenessState.cursor,
          selectedElementIds: awarenessState.selectedElementIds || [],
          isCurrentUser: false,
        });
      });
      
      setCollaborators(collaborators);
    };
    
    // Subscribe to awareness changes
    awareness.on("change", handleAwarenessChange);
    
    // Initial awareness sync
    handleAwarenessChange();
    
    // ─────────────────────────────────────────────────────────────────
    // STEP 6: HANDLE CONNECTION STATUS
    // ─────────────────────────────────────────────────────────────────
    
    /**
     * Track connection state for UI feedback.
     */
    provider.on("status", (event: { status: string }) => {
      setConnectionStatus(event.status === "connected");
    });
    
    /**
     * Track sync state.
     * 'sync' fires when initial sync is complete.
     * Note: Using type assertion because y-websocket types may not include all events
     */
    (provider as any).on("sync", (synced: boolean) => {
      setConnectionStatus(true, synced);
    });
    
    // ─────────────────────────────────────────────────────────────────
    // CLEANUP
    // ─────────────────────────────────────────────────────────────────
    
    return () => {
      // Remove observers
      yElements.unobserve(handleElementsChange);
      awareness.off("change", handleAwarenessChange);
      
      // Destroy undo manager
      undoManagerRef.current?.destroy();
      undoManagerRef.current = null;
      
      // Disconnect and cleanup provider
      provider.disconnect();
      provider.destroy();
      providerRef.current = null;
      
      // Reset connection state
      setConnectionStatus(false, false);
      setRoomId(null);
    };
  }, [roomId, doc, myName, myColor, setElements, setCollaborators, setConnectionStatus, setRoomId, getYElements]);

  // ─────────────────────────────────────────────────────────────────
  // MUTATION FUNCTIONS
  // ─────────────────────────────────────────────────────────────────
  
  /**
   * Add a new element to the canvas.
   * 
   * @param element - Complete element object
   * 
   * IMPORTANT: This updates Yjs, NOT React state directly.
   * The observer will update React state.
   */
  const addElement = useCallback((element: CanvasElement) => {
    const yElements = getYElements();
    
    // Use Y.Doc transaction for atomicity
    doc.transact(() => {
      yElements.set(element.id, element);
    });
  }, [doc, getYElements]);
  
  /**
   * Update an existing element.
   * 
   * @param id - Element ID
   * @param updates - Partial element updates
   * 
   * MERGE SEMANTICS:
   * We get existing element, merge updates, and set the result.
   * Yjs will handle concurrent updates from other clients!
   */
  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    const yElements = getYElements();
    const existing = yElements.get(id);
    
    if (!existing) {
      console.warn(`Element ${id} not found for update`);
      return;
    }
    
    doc.transact(() => {
      // Increment version for conflict resolution
      const newVersion = (existing.version || 0) + 1;
      
      yElements.set(id, {
        ...existing,
        ...updates,
        version: newVersion,
        updated: Date.now(),
      } as CanvasElement);
    });
  }, [doc, getYElements]);
  
  /**
   * Delete elements by IDs.
   * 
   * SOFT DELETE:
   * We set isDeleted: true instead of removing.
   * This ensures deletion syncs correctly with offline clients.
   * Hard deletes can cause resurrection bugs with CRDTs.
   */
  const deleteElements = useCallback((ids: string[]) => {
    const yElements = getYElements();
    
    doc.transact(() => {
      for (const id of ids) {
        const existing = yElements.get(id);
        if (existing) {
          // Soft delete - mark as deleted
          yElements.set(id, {
            ...existing,
            isDeleted: true,
            version: (existing.version || 0) + 1,
            updated: Date.now(),
          } as CanvasElement);
        }
      }
    });
  }, [doc, getYElements]);
  
  /**
   * Update cursor position in awareness.
   * 
   * @param position - Current cursor position or null
   */
  const updateCursor = useCallback((position: Point | null) => {
    const provider = providerRef.current;
    if (!provider) return;
    
    provider.awareness.setLocalStateField("cursor", position);
  }, []);
  
  /**
   * Update selection in awareness.
   * 
   * @param ids - Currently selected element IDs
   */
  const updateSelection = useCallback((ids: string[]) => {
    const provider = providerRef.current;
    if (!provider) return;
    
    provider.awareness.setLocalStateField("selectedElementIds", ids);
  }, []);
  
  /**
   * Undo last change.
   */
  const undo = useCallback(() => {
    undoManagerRef.current?.undo();
  }, []);
  
  /**
   * Redo last undone change.
   */
  const redo = useCallback(() => {
    undoManagerRef.current?.redo();
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // RETURN API
  // ─────────────────────────────────────────────────────────────────
  
  return {
    doc,
    provider: providerRef.current,
    addElement,
    updateElement,
    deleteElements,
    updateCursor,
    updateSelection,
    getYElements,
    undo,
    redo,
    canUndo: undoManagerRef.current?.canUndo() ?? false,
    canRedo: undoManagerRef.current?.canRedo() ?? false,
  };
}
