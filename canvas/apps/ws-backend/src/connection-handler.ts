/**
 * ============================================================================
 * LEKHAFLOW WS BACKEND - CONNECTION HANDLER
 * ============================================================================
 * 
 * Handles individual WebSocket connections and their lifecycle.
 * 
 * LINE-BY-LINE EXPLANATION:
 * 
 * This module is responsible for:
 * 1. Setting up a new WebSocket connection
 * 2. Handling incoming messages
 * 3. Integrating with y-websocket for Yjs sync
 * 4. Managing connection cleanup
 * 
 * PROTOCOL OVERVIEW:
 * - We use y-websocket library which implements the Yjs sync protocol
 * - The protocol handles:
 *   - State vector exchange (what updates each client has)
 *   - Update propagation (sending/receiving document changes)
 *   - Awareness (cursor positions, user info)
 */

import type { IncomingMessage } from "http";
import type { LekhaSocket } from "./types.js";
import { createLogger } from "./logger.js";
import { roomManager } from "./room-manager.js";

const logger = createLogger("ConnectionHandler");

// y-websocket utilities will be loaded dynamically
let setupWSConnection: any = null;

/**
 * Initialize y-websocket module (ESM-compatible dynamic import)
 */
async function initYWebsocket(): Promise<void> {
  if (!setupWSConnection) {
    // Dynamic import for ESM compatibility
    const yWebsocket = await import("y-websocket/bin/utils");
    setupWSConnection = yWebsocket.setupWSConnection;
  }
}

/**
 * Parse room ID from WebSocket request URL
 * 
 * URL FORMAT: ws://server:port/roomId
 * 
 * @param req - HTTP upgrade request
 * @returns Room ID extracted from path
 * 
 * EXAMPLE:
 * - URL: "ws://localhost:8080/canvas-123"
 * - Returns: "canvas-123"
 */
function parseRoomId(req: IncomingMessage): string {
  const url = req.url || "/default-room";
  
  // Remove leading slash and query params
  // "/canvas-123?param=value" -> "canvas-123"
  const roomId = url.slice(1).split("?")[0] || "default-room";
  
  return roomId;
}

/**
 * Parse user info from query parameters (optional)
 * 
 * @param req - HTTP upgrade request
 * @returns User info object
 */
function parseUserInfo(req: IncomingMessage): { userId?: string; userName?: string } {
  const url = req.url || "";
  const queryStart = url.indexOf("?");
  
  if (queryStart === -1) return {};
  
  const queryString = url.slice(queryStart + 1);
  const params = new URLSearchParams(queryString);
  
  return {
    userId: params.get("userId") || undefined,
    userName: params.get("userName") || undefined,
  };
}

/**
 * Handle a new WebSocket connection
 * 
 * @param ws - WebSocket instance
 * @param req - HTTP upgrade request
 * 
 * FLOW:
 * 1. Parse room ID from URL
 * 2. Extract user info from query params
 * 3. Set up heartbeat for connection health
 * 4. Join the room
 * 5. Hand off to y-websocket for sync protocol
 * 6. Set up cleanup handlers
 */
export async function handleConnection(ws: LekhaSocket, req: IncomingMessage): Promise<void> {
  // Initialize y-websocket module (ESM dynamic import)
  await initYWebsocket();
  
  // STEP 1: Parse room ID from the URL path
  // Example: ws://localhost:8080/room-abc -> roomId = "room-abc"
  const roomId = parseRoomId(req);
  
  // STEP 2: Extract optional user information
  const userInfo = parseUserInfo(req);
  
  // Store info on socket for later use
  ws.roomId = roomId;
  ws.userId = userInfo.userId;
  ws.userName = userInfo.userName;
  ws.isAlive = true;

  logger.info("New connection", {
    roomId,
    userId: userInfo.userId,
    userName: userInfo.userName,
  });

  // STEP 3: Set up heartbeat (pong response)
  // The server sends ping, client responds with pong
  // If no pong received, connection is considered dead
  ws.on("pong", () => {
    ws.isAlive = true;
  });

  // STEP 4: Join the room (for our custom room management)
  roomManager.joinRoom(roomId, ws);

  // STEP 5: Hand off to y-websocket
  // This is the CRITICAL integration point!
  // 
  // y-websocket handles:
  // - Initial sync (exchanging state vectors)
  // - Document updates (binary Yjs updates)
  // - Awareness protocol (cursor positions)
  // 
  // The library expects:
  // - ws: WebSocket instance
  // - req: HTTP request (for room ID extraction)
  // - options: Additional configuration
  //
  // It will:
  // 1. Parse room name from req.url
  // 2. Create/get shared Y.Doc for that room
  // 3. Set up message handlers for sync protocol
  // 4. Broadcast updates to other clients in room
  setupWSConnection(ws, req, {
    // Disable built-in GC - we handle cleanup ourselves
    gc: true,
  });

  // STEP 6: Set up cleanup on close
  ws.on("close", (code, reason) => {
    logger.info("Connection closed", {
      roomId,
      userId: userInfo.userId,
      code,
      reason: reason?.toString() || "unknown",
    });

    // Remove from our room manager
    roomManager.leaveRoom(ws);
  });

  // Handle errors
  ws.on("error", (error) => {
    logger.error("WebSocket error", {
      roomId,
      userId: userInfo.userId,
      error: error.message,
    });
  });
}

/**
 * Heartbeat interval to detect dead connections
 * 
 * WHY HEARTBEAT?
 * - WebSocket connections can silently die (network issues)
 * - The server needs to detect and clean up dead connections
 * - We send periodic pings and expect pongs back
 * - No pong = connection is dead = terminate it
 */
export function startHeartbeat(
  getClients: () => Set<LekhaSocket>,
  interval = 30000
): NodeJS.Timeout {
  return setInterval(() => {
    const clients = getClients();
    
    for (const ws of clients) {
      // If we didn't receive pong since last check, terminate
      if (ws.isAlive === false) {
        logger.warn("Terminating dead connection", {
          roomId: ws.roomId,
          userId: ws.userId,
        });
        ws.terminate();
        continue;
      }

      // Mark as dead, wait for pong to mark alive
      ws.isAlive = false;
      ws.ping();
    }
  }, interval);
}
