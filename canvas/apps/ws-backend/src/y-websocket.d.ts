/**
 * Type declarations for y-websocket/bin/utils
 * 
 * The y-websocket package doesn't include TypeScript types,
 * so we declare the minimum types we need.
 */
declare module "y-websocket/bin/utils" {
  import type { WebSocket } from "ws";
  import type { IncomingMessage } from "http";

  export interface SetupWSConnectionOptions {
    /** Enable garbage collection of Y.Doc */
    gc?: boolean;
    /** Ping timeout in milliseconds */
    pingTimeout?: number;
    /** Document name (extracted from req.url if not provided) */
    docName?: string;
  }

  /**
   * Set up a WebSocket connection for Yjs sync
   * 
   * This function handles the Yjs sync protocol:
   * - State vector exchange
   * - Document updates
   * - Awareness protocol
   */
  export function setupWSConnection(
    ws: WebSocket,
    req: IncomingMessage,
    options?: SetupWSConnectionOptions
  ): void;
}
