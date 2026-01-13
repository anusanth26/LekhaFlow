"use client";

import { useEffect, useState } from "react";
import { Stage, Layer, Rect } from "react-konva";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { v4 as uuidv4 } from "uuid";

/**
 * Sync Engine Learning Explanation:
 * 
 * 1. Y.Doc (y-document):
 *    This is the "shared database" that lives in the browser. 
 *    Every client has their own copy. Yjs magic ensures they all eventually match (Consistency).
 * 
 * 2. WebsocketProvider:
 *    This acts as the "network cable". It connects your local Y.Doc to the server.
 *    The server (apps/ws-backend) just relays messages. it doesn't need to know the business logic.
 * 
 * 3. Shared Types (Y.Map, Y.Array):
 *    These are special data structures. When you modify them, the changes are 
 *    automatically sent to everyone else.
 */

// Define what a Shape looks like
interface Shape {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
}

export function Canvas({ roomId }: { roomId: string }) {
    // Local React State - This is what "renders" the UI
    const [shapes, setShapes] = useState<Record<string, Shape>>({});

    // Yjs State references (kept in refs or outside state to avoid re-creations)
    // We strictly need ONE Y.Doc instance per session.
    const [doc] = useState(() => new Y.Doc());
    const [provider, setProvider] = useState<WebsocketProvider | null>(null);

    useEffect(() => {
        // --- STEP 1: CONNECT TO THE SYNC SERVER ---
        // We connect to our local ws-backend.
        // "roomId" differentiates different whiteboards.
        const wsProvider = new WebsocketProvider(
            "ws://localhost:8080",
            roomId,
            doc
        );

        setProvider(wsProvider);

        // --- STEP 2: DEFINE SHARED DATA ---
        // We create a "Shared Map" called 'shapes'.
        // Think of this like a resilient `new Map()` that syncs over the internet.
        const yShapes: Y.Map<Shape> = doc.getMap("shapes");

        // --- STEP 3: LISTEN FOR UPDATES ---
        // "observe" triggers whenever ANYONE (including us) changes this map.
        yShapes.observe((event) => {
            // Log the update to understand what's happening (Learning purpose)
            console.log("Sync Event received!", event.changes.keys);

            // Sync: Copy data from Yjs -> React State to trigger a re-render
            setShapes(yShapes.toJSON() as Record<string, Shape>);
        });

        // Initial sync: In case there's already data when we join
        setShapes(yShapes.toJSON() as Record<string, Shape>);

        return () => {
            wsProvider.destroy();
        };
    }, [roomId, doc]);

    const addRectangle = () => {
        const id = uuidv4();
        const newShape: Shape = {
            id,
            x: Math.random() * 400,
            y: Math.random() * 400,
            width: 100,
            height: 100,
            fill: '#' + Math.floor(Math.random() * 16777215).toString(16)
        };

        // --- STEP 4: MAKE A CHANGE ---
        // To update everyone, we ONLY update the Yjs Map.
        // We do NOT call setShapes() manually here.
        // The .observe() listener above will handle the UI update for us.
        // This ensures "Source of Truth" is always Yjs.
        const yShapes = doc.getMap<Shape>("shapes");

        // This single line propagates the new rectangle to every other user instanty.
        yShapes.set(id, newShape);
    };

    return (
        <div>
            <div style={{ position: "absolute", top: 10, left: 10, zIndex: 10, background: "white", padding: 10 }}>
                <p><strong>Room:</strong> {roomId}</p>
                <p><strong>Status:</strong> {provider?.wsconnected ? "🟢 Connected" : "🔴 Disconnected"}</p>
                <button onClick={addRectangle} className="px-4 py-2 bg-blue-500 text-white rounded">
                    Add Rectangle
                </button>
            </div>

            {/* React-Konva Stage */}
            <Stage width={window.innerWidth} height={window.innerHeight}>
                <Layer>
                    {/* Render all shapes from our synced state */}
                    {Object.values(shapes).map((shape) => (
                        <Rect
                            key={shape.id}
                            x={shape.x}
                            y={shape.y}
                            width={shape.width}
                            height={shape.height}
                            fill={shape.fill}
                            draggable
                            // --- STEP 5: HANDLING DRAG (UPDATES) ---
                            onDragEnd={(e) => {
                                // When dragging ends, we update the shared state
                                const yShapes = doc.getMap<Shape>("shapes");
                                yShapes.set(shape.id, {
                                    ...shape,
                                    x: e.target.x(),
                                    y: e.target.y(),
                                });
                            }}
                        />
                    ))}
                </Layer>
            </Stage>
        </div>
    );
}
