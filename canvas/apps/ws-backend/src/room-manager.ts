/**
 * ============================================================================
 * LEKHAFLOW WS BACKEND - ROOM MANAGER
 * ============================================================================
 * 
 * Manages WebSocket rooms (collaborative sessions).
 * 
 * LINE-BY-LINE EXPLANATION:
 * 
 * ROOM CONCEPT:
 * - A "room" is a collaborative session identified by roomId
 * - Multiple users can join the same room to collaborate
 * - Each room has its own Yjs document for sync
 * 
 * LIFECYCLE:
 * 1. First user joins → Room is created
 * 2. Users collaborate → Messages broadcast within room
 * 3. Last user leaves → Room is cleaned up after timeout
 */

import type { LekhaSocket, Room } from "./types.js";
import { createLogger } from "./logger.js";

const logger = createLogger("RoomManager");

/**
 * Room cleanup timeout (milliseconds)
 * Rooms are removed after this period of inactivity
 */
const ROOM_CLEANUP_TIMEOUT = 5 * 60 * 1000; // 5 minutes

/**
 * RoomManager Class
 * 
 * Handles:
 * - Room creation/deletion
 * - Client join/leave
 * - Broadcasting messages within rooms
 * - Cleanup of inactive rooms
 */
export class RoomManager {
  /** Map of roomId -> Room */
  private rooms: Map<string, Room> = new Map();
  
  /** Cleanup interval reference */
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start periodic cleanup of inactive rooms
    this.startCleanupInterval();
    logger.info("RoomManager initialized");
  }

  /**
   * Get or create a room
   * 
   * @param roomId - Unique room identifier
   * @returns The Room object
   * 
   * FLOW:
   * 1. Check if room exists
   * 2. If not, create new room with empty client set
   * 3. Return room reference
   */
  getOrCreateRoom(roomId: string): Room {
    let room = this.rooms.get(roomId);
    
    if (!room) {
      // Create new room
      room = {
        id: roomId,
        clients: new Set(),
        lastActivity: Date.now(),
        createdAt: Date.now(),
      };
      this.rooms.set(roomId, room);
      logger.info("Room created", { roomId });
    }
    
    return room;
  }

  /**
   * Add a client to a room
   * 
   * @param roomId - Room to join
   * @param socket - Client WebSocket
   * 
   * FLOW:
   * 1. Get or create the room
   * 2. Add socket to room's client set
   * 3. Store roomId on socket for cleanup
   * 4. Update last activity timestamp
   */
  joinRoom(roomId: string, socket: LekhaSocket): void {
    const room = this.getOrCreateRoom(roomId);
    
    // Add client to room
    room.clients.add(socket);
    socket.roomId = roomId;
    room.lastActivity = Date.now();
    
    logger.info("Client joined room", {
      roomId,
      userId: socket.userId,
      clientCount: room.clients.size,
    });
  }

  /**
   * Remove a client from their room
   * 
   * @param socket - Client WebSocket to remove
   * 
   * FLOW:
   * 1. Get room from socket.roomId
   * 2. Remove socket from client set
   * 3. If room is empty, mark for cleanup (don't delete immediately)
   */
  leaveRoom(socket: LekhaSocket): void {
    const roomId = socket.roomId;
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    // Remove client from room
    room.clients.delete(socket);
    room.lastActivity = Date.now();

    logger.info("Client left room", {
      roomId,
      userId: socket.userId,
      remainingClients: room.clients.size,
    });

    // Note: Room cleanup is handled by the cleanup interval
    // This allows for reconnection without losing state
  }

  /**
   * Broadcast a message to all clients in a room
   * 
   * @param roomId - Target room
   * @param data - Data to broadcast (will be sent as-is)
   * @param excludeSocket - Optional socket to exclude (sender)
   * 
   * WHY EXCLUDE SENDER?
   * - The sender already has the update locally
   * - Sending it back would cause duplicate processing
   * - This is a key pattern in CRDT-based sync
   */
  broadcast(roomId: string, data: Buffer | Uint8Array, excludeSocket?: LekhaSocket): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    // Update activity timestamp
    room.lastActivity = Date.now();

    let sentCount = 0;
    
    // Iterate through all clients in the room
    for (const client of room.clients) {
      // Skip the sender
      if (client === excludeSocket) continue;
      
      // Only send to open connections
      if (client.readyState === 1) { // WebSocket.OPEN = 1
        client.send(data);
        sentCount++;
      }
    }

    logger.debug("Broadcast message", {
      roomId,
      recipients: sentCount,
      bytesSent: data.length,
    });
  }

  /**
   * Get statistics for a specific room
   */
  getRoomStats(roomId: string): { clientCount: number; lastActivity: number } | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    return {
      clientCount: room.clients.size,
      lastActivity: room.lastActivity,
    };
  }

  /**
   * Get all active rooms
   */
  getAllRooms(): Array<{ id: string; clientCount: number; lastActivity: number }> {
    const result: Array<{ id: string; clientCount: number; lastActivity: number }> = [];
    
    for (const [id, room] of this.rooms) {
      result.push({
        id,
        clientCount: room.clients.size,
        lastActivity: room.lastActivity,
      });
    }
    
    return result;
  }

  /**
   * Start periodic cleanup of inactive rooms
   * 
   * WHY PERIODIC CLEANUP?
   * - Prevents memory leaks from abandoned rooms
   * - Allows grace period for reconnection
   * - More efficient than checking on every leave
   */
  private startCleanupInterval(): void {
    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveRooms();
    }, 60 * 1000);
  }

  /**
   * Remove rooms that have been inactive too long
   * 
   * CLEANUP CRITERIA:
   * - Room has no clients
   * - Last activity was more than ROOM_CLEANUP_TIMEOUT ago
   */
  private cleanupInactiveRooms(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [roomId, room] of this.rooms) {
      // Only clean up empty rooms
      if (room.clients.size > 0) continue;

      // Check if room has been inactive long enough
      const inactiveTime = now - room.lastActivity;
      if (inactiveTime > ROOM_CLEANUP_TIMEOUT) {
        this.rooms.delete(roomId);
        cleanedCount++;
        logger.info("Room cleaned up", { roomId, inactiveTime });
      }
    }

    if (cleanedCount > 0) {
      logger.info("Cleanup completed", {
        roomsCleaned: cleanedCount,
        activeRooms: this.rooms.size,
      });
    }
  }

  /**
   * Shutdown the room manager
   * Cleans up intervals and connections
   */
  shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // Close all client connections
    for (const room of this.rooms.values()) {
      for (const client of room.clients) {
        client.close(1001, "Server shutting down");
      }
    }

    this.rooms.clear();
    logger.info("RoomManager shutdown complete");
  }
}

// Singleton instance
export const roomManager = new RoomManager();
