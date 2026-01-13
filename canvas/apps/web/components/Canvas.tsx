"use client";

import { useEffect, useState, useMemo } from "react";
import { Stage, Layer, Rect, Circle, Text, Group, Path } from "react-konva";
import { Pointer, Square } from "lucide-react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { v4 as uuidv4 } from "uuid";

// Simple random name generator
const NAMES = ["Unicorn", "Tiger", "Eagle", "Panda", "Fox", "Koala", "Badger", "Lion"];
const COLORS = ["#FF5733", "#33FF57", "#3357FF", "#F033FF", "#33FFF5", "#FFFF33"];

const getRandomName = () => NAMES[Math.floor(Math.random() * NAMES.length)];
const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)] || "#FF0000";

interface Shape {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
}

interface UserAwareness {
    id: number;
    point: [number, number];
    color: string;
    name: string;
}

export function Canvas({ roomId }: { roomId: string }) {
    const [shapes, setShapes] = useState<Record<string, Shape>>({});
    const [cursors, setCursors] = useState<UserAwareness[]>([]);

    // Memoize the doc so it doesn't recreate on every render
    const doc = useMemo(() => new Y.Doc(), []);
    const [provider, setProvider] = useState<WebsocketProvider | null>(null);

    // Generate my identity constant for this session
    const myIdentity = useMemo(() => ({
        name: getRandomName(),
        color: getRandomColor()
    }), []);

    useEffect(() => {
        const wsProvider = new WebsocketProvider(
            "ws://localhost:8080",
            roomId,
            doc
        );
        setProvider(wsProvider);

        // --- PART 1: SHARED SHAPES ---
        const yShapes: Y.Map<Shape> = doc.getMap("shapes");
        yShapes.observe(() => {
            setShapes(yShapes.toJSON() as Record<string, Shape>);
        });
        setShapes(yShapes.toJSON() as Record<string, Shape>);

        // --- PART 2: AWARENESS ---
        const awareness = wsProvider.awareness;

        // Set my initial state immediately (optimistic)
        awareness.setLocalState({
            point: [0, 0],
            color: myIdentity.color,
            name: myIdentity.name
        });

        // "States" update handler
        const handleAwarenessChange = () => {
            const states = awareness.getStates();
            const activeCursors: UserAwareness[] = [];

            states.forEach((state: any, clientId: number) => {
                if (clientId !== doc.clientID && state.point) {
                    activeCursors.push({
                        id: clientId,
                        point: state.point,
                        color: state.color || 'gray',
                        name: state.name || `User ${clientId}`
                    });
                }
            });
            setCursors(activeCursors);
        };

        awareness.on('change', handleAwarenessChange);

        // Re-broadcast identity when we (re)connect
        wsProvider.on('status', (event: any) => {
            if (event.status === 'connected') {
                awareness.setLocalState({
                    point: [0, 0],
                    color: myIdentity.color,
                    name: myIdentity.name
                });
            }
        });

        // CLEANUP
        return () => {
            awareness.off('change', handleAwarenessChange);
            wsProvider.disconnect();
            wsProvider.destroy();
        };
    }, [roomId, doc, myIdentity]);

    // ... (rest of file)

    // Handle Window Unload (Tab Close) to ensure we disappear immediately
    useEffect(() => {
        const handleBeforeUnload = () => {
            provider?.disconnect();
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [provider]);


    const addRectangle = () => {
        const id = uuidv4();
        const newShape: Shape = {
            id,
            x: Math.random() * 400,
            y: Math.random() * 400,
            width: 100,
            height: 100,
            fill: myIdentity.color
        };
        const yShapes = doc.getMap<Shape>("shapes");
        yShapes.set(id, newShape);
    };

    const handleMouseMove = (e: any) => {
        if (!provider) return;
        const stage = e.target.getStage();
        const pointerPosition = stage?.getPointerPosition();

        if (pointerPosition) {
            // console.log("Sending position:", pointerPosition.x, pointerPosition.y); 
            provider.awareness.setLocalStateField('point', [
                pointerPosition.x,
                pointerPosition.y
            ]);
        }
    };

    // Tool State
    const [selectedTool, setSelectedTool] = useState<'select' | 'rectangle'>('select');

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            alert("Room link copied to clipboard!");
        });
    };

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-[#ffffff]">
            {/* --- Dot Grid Background (CSS Pattern) --- */}
            <div className="absolute inset-0 pointer-events-none opacity-40"
                style={{
                    backgroundImage: 'radial-gradient(#ddd 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
            />

            {/* --- TOP HEADER (Menu & Name) --- */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
                <div className="bg-[#ececf4] hover:bg-[#e0e0e0] p-2 rounded-lg cursor-pointer transition-colors shadow-sm border border-gray-200">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path></svg>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 hover:text-gray-900 cursor-pointer transition-colors">Untitled-2024-01-13</span>
                </div>
            </div>

            {/* --- TOP CENTER TOOLBAR --- */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-white p-1.5 rounded-xl shadow-lg border border-gray-200 flex gap-1 items-center">
                <button
                    onClick={() => setSelectedTool('select')}
                    className={`p-2.5 rounded-lg transition-all ${selectedTool === 'select' ? 'bg-[#e0dfff] text-[#5b53ff]' : 'hover:bg-[#f1f1f1] text-gray-700'}`}
                    title="Selection — V"
                >
                    <Pointer className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-gray-200 mx-1"></div>
                <button
                    onClick={() => {
                        setSelectedTool('rectangle');
                        addRectangle();
                    }}
                    className={`p-2.5 rounded-lg transition-all ${selectedTool === 'rectangle' ? 'bg-[#e0dfff] text-[#5b53ff]' : 'hover:bg-[#f1f1f1] text-gray-700'}`}
                    title="Rectangle — R"
                >
                    <Square className="w-5 h-5" />
                </button>
                {/* Placeholder for other tools */}
                <button className="p-2.5 rounded-lg hover:bg-[#f1f1f1] text-gray-700" title="Circle">
                    <div className="w-4 h-4 rounded-full border-2 border-currentColor"></div>
                </button>
                <button className="p-2.5 rounded-lg hover:bg-[#f1f1f1] text-gray-700" title="Arrow">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 10H15M15 10L10 5M15 10L10 15" /></svg>
                </button>
            </div>

            {/* --- TOP RIGHT (Collaboration) --- */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
                {/* Avatars */}
                <div className="flex -space-x-2 mr-2">
                    <div
                        className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-sm"
                        style={{ backgroundColor: myIdentity.color }}
                        title={`You (${myIdentity.name})`}
                    >
                        {myIdentity.name[0]}
                    </div>
                    {cursors.map(c => (
                        <div
                            key={c.id}
                            className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-sm"
                            style={{ backgroundColor: c.color }}
                            title={c.name}
                        >
                            {c.name[0]}
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleShare}
                    className="bg-[#6965db] hover:bg-[#5b53ff] text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-colors flex items-center gap-2"
                >
                    Share
                </button>
            </div>

            {/* --- CANVAS --- */}
            <Stage
                width={window.innerWidth}
                height={window.innerHeight}
                onMouseMove={handleMouseMove}
                className="cursor-crosshair"
            >
                <Layer>
                    {/* Shapes */}
                    {Object.values(shapes).map((shape) => (
                        <Rect
                            key={shape.id}
                            x={shape.x}
                            y={shape.y}
                            width={shape.width}
                            height={shape.height}
                            fill={shape.fill}
                            stroke="black"
                            strokeWidth={2}
                            cornerRadius={2} // Slight rounded for hand-drawn feel approximation
                            draggable={selectedTool === 'select'}
                            onDragEnd={(e) => {
                                const yShapes = doc.getMap<Shape>("shapes");
                                yShapes.set(shape.id, {
                                    ...shape,
                                    x: e.target.x(),
                                    y: e.target.y(),
                                });
                            }}
                        />
                    ))}

                    {/* Cursors */}
                    {cursors.map((cursor) => (
                        <Group key={cursor.id}>
                            {/* Cursor Arrow */}
                            <Path
                                x={cursor.point[0]}
                                y={cursor.point[1]}
                                fill={cursor.color}
                                data="M0 0 L10 24 L14 14 L24 10 Z"
                                rotation={-10}
                                scaleX={0.8}
                                scaleY={0.8}
                            />
                            {/* Label */}
                            <Group x={cursor.point[0] + 16} y={cursor.point[1] + 16}>
                                <Rect
                                    fill={cursor.color}
                                    width={cursor.name.length * 9 + 16}
                                    height={24}
                                    cornerRadius={4}
                                />
                                <Text
                                    x={6}
                                    y={6}
                                    text={cursor.name}
                                    fill="white"
                                    fontSize={12}
                                    fontStyle="bold"
                                />
                            </Group>
                        </Group>
                    ))}
                </Layer>
            </Stage>
        </div>
    );
}
