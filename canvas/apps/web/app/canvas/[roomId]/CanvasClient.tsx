"use client";

import { useEffect, useState } from "react";

export function CanvasClient({ roomId }: { roomId: string }) {
    const [canvasData, setCanvasData] = useState<string>("");
    const [status, setStatus] = useState<"saved" | "saving" | "unsaved">("saved");

    // Debounce logic
    useEffect(() => {
        const timer = setTimeout(() => {
            if (canvasData) {
                saveCanvas(canvasData);
            }
        }, 1000); // 1 second debounce

        return () => clearTimeout(timer);
    }, [canvasData]);

    const saveCanvas = async (data: string) => {
        setStatus("saving");
        try {
            const response = await fetch(`http://localhost:8000/api/v1/canvas/${roomId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    // Add auth token if needed
                },
                body: JSON.stringify({ data }),
            });

            if (!response.ok) {
                throw new Error("Failed to save");
            }
            setStatus("saved");
        } catch (error) {
            console.error(error);
            setStatus("unsaved");
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h1>Canvas Room: {roomId}</h1>
            <p>Status: {status}</p>
            <textarea
                value={canvasData}
                onChange={(e) => setCanvasData(e.target.value)}
                placeholder="Type here to simulate drawing..."
                style={{ width: "100%", height: "400px", padding: 10 }}
            />
        </div>
    );
}
