import { WebSocketServer } from "ws";
// @ts-expect-error - y-websocket doesn't have type definitions
import { setupWSConnection } from "y-websocket/bin/utils";

// Load environment variables FIRST (before any imports that access process.env)
import "./env.js";

wss.on("connection", (ws, req) => {
	setupWSConnection(ws, req);
});
