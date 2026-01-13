# LekhaFlow Sync Engine: Implementation Guide

## 1. Architecture Overview
We have built a **Client-Server** architecture for real-time collaboration.

-   **Backend (`apps/ws-backend`)**: A lightweight WebSocket server. It doesn't know about "shapes" or "canvas". It blindly accepts binary updates from one client and broadcasts them to everyone else in the same "room".
-   **Frontend (`apps/web`)**: The smart client. It maintains a local database (`Y.Doc`) that syncs with others. It renders the visual representation using `react-konva`.

```mermaid
graph LR
    ClientA[Frontend (User A)] -- WebSocket --> Server[WS Backend]
    ClientB[Frontend (User B)] -- WebSocket --> Server
    
    ClientA -- Sync Update (Binary) --> Server
    Server -- Broadcast Update --> ClientB
```

## 2. The Code: Line-by-Line Explanation

### Backend: `apps/ws-backend/src/index.ts`
This is the "switchboard" of our application.

```typescript
const { WebSocketServer } = require("ws");
// We import 'setupWSConnection' from y-websocket library.
// This function handles the complex Yjs protocol (handshake, syncing, awareness).
const { setupWSConnection } = require("y-websocket/bin/utils");

const wss = new WebSocketServer({ port: 8080 });

// When a new browser connects...
wss.on("connection", (ws, req) => {
    // ...we hand over control of that socket to Yjs.
    // It automatically handles joining the correct "room" based on the URL.
    setupWSConnection(ws, req);
});
```
**Key Takeaway**: The backend is extremely simple because `y-websocket` abstracts 99% of the work. It acts as a generic message broker.

---

### Frontend: `apps/web/components/Canvas.tsx`
This is where the magic happens. We bridge the "Sync World" (Yjs) with the "Visual World" (React).

#### Step 1: Connecting to the "Network Cable"
```typescript
const [doc] = useState(() => new Y.Doc()); // 1. Create a local, empty database.

useEffect(() => {
    // 2. Plug in the cable. Connect local doc to the server.
    const wsProvider = new WebsocketProvider(
        "ws://localhost:8080", // Server URL
        roomId,                // Room Name (e.g., "room-1")
        doc                    // The doc to sync
    );
    // ...
}, [roomId, doc]);
```
*   **Concept**: `Y.Doc` is a collection of shared data types. It's designed to automatically merge changes from multiple users without conflicts (CRDTs).

#### Step 2: Defining Shared Data
```typescript
// We ask the Doc for a specific "Shared Map" named "shapes".
// If it doesn't exist, it's created. If it implies exists (from other users), we get it.
const yShapes: Y.Map<Shape> = doc.getMap("shapes");
```
*   **Concept**: `Y.Map` works exactly like a JavaScript `Map`, but it emits events when *anyone* changes it.

#### Step 3: Listening for Changes
```typescript
yShapes.observe((event) => {
    // This callback runs whenever the map changes (local or remote).
    console.log("Sync Event received!");

    // We take the current state of the Yjs Map and force React to re-render.
    setShapes(yShapes.toJSON() as Record<string, Shape>);
});
```
*   **Critical Pattern**: We **never** update React state (`setShapes`) directly when the user draws. We only update Yjs. Then, Yjs tells us "Hey, I changed", and *then* we update React. This ensures a **Unidirectional Data Flow**.

#### Step 4: Making a Change (Drawing)
```typescript
const addRectangle = () => {
    const id = uuidv4();
    const newShape = { ... };

    // We ONLY touch the Yjs Map.
    // This sends a tiny binary message to the server -> other clients.
    const yShapes = doc.getMap<Shape>("shapes");
    yShapes.set(id, newShape); 
};
```

## 3. What Happens When You Draw?
1.  **User A** clicks "Add Rectangle".
2.  `yShapes.set(...)` is called locally.
3.  **Yjs Core** calculates a "delta" (a tiny description of the change).
4.  **WebsocketProvider** encodes this delta into binary and sends it to `ws://localhost:8080`.
5.  **Server** receives the binary blob and immediately sends it to **User B**.
6.  **User B's WebsocketProvider** decodes the binary and applies it to their local `Y.Doc`.
7.  **User B's `yShapes.observe`** fires.
8.  **User B's React Component** re-renders with the new shape.

All of this happens in milliseconds!
