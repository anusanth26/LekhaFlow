/**
 * ============================================================================
 * LEKHAFLOW WS BACKEND - MAIN ENTRY POINT
 * ============================================================================
 * 
 * Production-ready WebSocket server for real-time canvas collaboration.
 * 
 * LINE-BY-LINE EXPLANATION OF THE SYNC ENGINE:
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                         SYNC ENGINE ARCHITECTURE                         │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │                                                                         │
 * │  Client A                    Server                    Client B         │
 * │  ┌───────┐                 ┌────────┐                 ┌───────┐        │
 * │  │Y.Doc A│◄───WebSocket───►│Yjs Hub │◄───WebSocket───►│Y.Doc B│        │
 * │  └───────┘                 └────────┘                 └───────┘        │
 * │      │                         │                          │            │
 * │      │   1. User A draws       │                          │            │
 * │      │──────────────────►      │                          │            │
 * │      │                         │   2. Server broadcasts   │            │
 * │      │                         │──────────────────────────►            │
 * │      │                         │                          │            │
 * │      │   3. Both have same state (CRDT magic!)            │            │
 * │      │◄────────────────────────────────────────────────────►           │
 * │                                                                         │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * KEY CONCEPTS:
 * 
 * 1. CRDT (Conflict-free Replicated Data Type):
 *    - Yjs uses CRDTs to merge concurrent changes automatically
 *    - No matter the order of operations, all clients converge to same state
 *    - No central authority needed for conflict resolution
 * 
 * 2. State Vector:
 *    - Each client tracks which updates it has seen
 *    - On connect, clients exchange state vectors
 *    - Only missing updates are sent (efficient!)
 * 
 * 3. Binary Protocol:
 *    - Updates are encoded as compact binary (not JSON)
 *    - Reduces bandwidth significantly
 *    - Yjs handles encoding/decoding automatically
 * 
 * 4. Awareness Protocol:
 *    - Separate from document sync
 *    - Handles ephemeral data: cursors, selections, presence
 *    - Data is NOT persisted, expires after 30 seconds
 * 
 * HOW THE CODE FLOWS:
 * 
 * 1. Client connects via WebSocket to ws://server:8080/room-id
 * 2. connection-handler.ts receives the connection
 * 3. Room ID is extracted from URL path
 * 4. Client is added to room via room-manager.ts
 * 5. y-websocket's setupWSConnection handles the Yjs protocol:
 *    a. Client sends SyncStep1 (its state vector)
 *    b. Server responds with SyncStep2 (missing updates)
 *    c. Client applies updates, sends SyncStep2 back
 *    d. Both are now in sync!
 * 6. When client makes changes:
 *    a. Change is encoded as binary update
 *    b. Sent to server via WebSocket
 *    c. Server broadcasts to all other clients in room
 *    d. Other clients apply update to their Y.Doc
 *    e. React re-renders with new state
 * 
 * PERSISTENCE:
 * - y-websocket stores documents in memory by default
 * - For production, implement LevelDB persistence
 * - Documents survive server restarts
 */

import { WebSocketServer, WebSocket } from "ws";
import { createLogger } from "./logger.js";
import { handleConnection, startHeartbeat } from "./connection-handler.js";
import { roomManager } from "./room-manager.js";
import type { LekhaSocket } from "./types.js";

const logger = createLogger("Server");

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Server port - configurable via environment variable
 */
const PORT = parseInt(process.env.WS_PORT || "8080", 10);

/**
 * Heartbeat interval in milliseconds
 * How often to check if connections are still alive
 */
const HEARTBEAT_INTERVAL = 30000;

// ============================================================================
// SERVER INITIALIZATION
// ============================================================================

/**
 * Create the WebSocket server
 * 
 * Configuration options:
 * - port: Listen port
 * - perMessageDeflate: Compression (disabled for binary data)
 * - maxPayload: Maximum message size (10MB for large canvases)
 */
const wss = new WebSocketServer({
  port: PORT,
  // Disable per-message deflate for better performance with binary data
  // Yjs updates are already compact, compression adds overhead
  perMessageDeflate: false,
  // Maximum payload size: 10MB
  // Large canvases with many elements might need this
  maxPayload: 10 * 1024 * 1024,
});

logger.info(`WebSocket server starting on port ${PORT}`);

// ============================================================================
// CONNECTION HANDLING
// ============================================================================

/**
 * Handle new WebSocket connections
 * 
 * EVENT: 'connection'
 * Fired when a client successfully connects
 * 
 * Parameters:
 * - ws: The WebSocket instance for this client
 * - req: The HTTP upgrade request (contains URL, headers)
 */
wss.on("connection", (ws: WebSocket, req) => {
  // Cast to our extended type and delegate to handler
  handleConnection(ws as LekhaSocket, req);
});

// ============================================================================
// HEARTBEAT SETUP
// ============================================================================

/**
 * Start the heartbeat checker
 * 
 * This periodically pings all clients to detect dead connections.
 * Dead connections are terminated to free up resources.
 */
const heartbeatInterval = startHeartbeat(
  () => wss.clients as Set<LekhaSocket>,
  HEARTBEAT_INTERVAL
);

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Handle server-level errors
 */
wss.on("error", (error) => {
  logger.error("Server error", { error: error.message });
});

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

/**
 * Handle graceful shutdown on SIGTERM/SIGINT
 * 
 * This ensures:
 * - All connections are properly closed
 * - Resources are cleaned up
 * - Server exits cleanly
 */
function shutdown(signal: string) {
  logger.info(`Received ${signal}, shutting down...`);

  // Stop heartbeat
  clearInterval(heartbeatInterval);

  // Close all connections gracefully
  for (const client of wss.clients) {
    client.close(1001, "Server shutting down");
  }

  // Shutdown room manager
  roomManager.shutdown();

  // Close the server
  wss.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });

  // Force exit after 5 seconds if graceful shutdown fails
  setTimeout(() => {
    logger.warn("Forcing exit after timeout");
    process.exit(1);
  }, 5000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// ============================================================================
// STARTUP COMPLETE
// ============================================================================

logger.info("Server started successfully", {
  port: PORT,
  heartbeatInterval: HEARTBEAT_INTERVAL,
  nodeVersion: process.version,
});

// Log server stats periodically (every 5 minutes)
setInterval(() => {
  const rooms = roomManager.getAllRooms();
  logger.info("Server stats", {
    activeRooms: rooms.length,
    totalClients: rooms.reduce((sum, r) => sum + r.clientCount, 0),
    memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + "MB",
  });
}, 5 * 60 * 1000);
