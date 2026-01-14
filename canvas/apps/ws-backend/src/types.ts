/**
 * ============================================================================
 * LEKHAFLOW WS BACKEND - TYPES
 * ============================================================================
 * 
 * Type definitions for the WebSocket sync server.
 */

import type { WebSocket } from "ws";

/**
 * Extended WebSocket with room tracking
 */
export interface LekhaSocket extends WebSocket {
  /** Room ID this socket is connected to */
  roomId?: string;
  /** User ID */
  userId?: string;
  /** User display name */
  userName?: string;
  /** Whether socket is alive (for heartbeat) */
  isAlive?: boolean;
}

/**
 * Room state managed by the server
 */
export interface Room {
  /** Room identifier */
  id: string;
  /** Connected clients */
  clients: Set<LekhaSocket>;
  /** Last activity timestamp */
  lastActivity: number;
  /** Room creation timestamp */
  createdAt: number;
}

/**
 * Server statistics
 */
export interface ServerStats {
  totalConnections: number;
  activeRooms: number;
  totalClients: number;
  uptime: number;
}

/**
 * Logger interface
 */
export interface Logger {
  info: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
  debug: (message: string, meta?: Record<string, unknown>) => void;
}
