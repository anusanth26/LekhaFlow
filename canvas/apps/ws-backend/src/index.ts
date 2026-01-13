import { WebSocketServer } from "ws";
// @ts-ignore
import { setupWSConnection } from "y-websocket/bin/utils";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws, req) => {
	setupWSConnection(ws, req);
});
