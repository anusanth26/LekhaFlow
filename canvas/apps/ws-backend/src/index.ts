const { WebSocketServer } = require("ws");
// @ts-ignore
const { setupWSConnection } = require("y-websocket/bin/utils");

const wss = new WebSocketServer({ port: 8080 });

// @ts-ignore
wss.on("connection", (ws, req) => {
	setupWSConnection(ws, req);
});
