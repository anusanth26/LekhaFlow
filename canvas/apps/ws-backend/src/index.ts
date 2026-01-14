const { WebSocketServer } = require("ws");
// @ts-expect-error
const { setupWSConnection } = require("y-websocket/bin/utils");

const wss = new WebSocketServer({ port: 8080 });

// @ts-expect-error
wss.on("connection", (ws, req) => {
	setupWSConnection(ws, req);
});
