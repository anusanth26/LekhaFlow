"use client";

import dynamic from "next/dynamic";
import { use } from "react";

const Canvas = dynamic(() => import("../../../components/Canvas").then((mod) => mod.Canvas), {
    ssr: false,
});

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
    // In Next.js 16+, params is a Promise and must be unwrapped with React.use()
    const { roomId } = use(params);
    
    return (
        <main style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
            <Canvas roomId={roomId} />
        </main>
    );
}
