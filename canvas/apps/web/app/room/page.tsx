import { Canvas } from "../../components/Canvas";

export default function RoomPage() {
    return (
        <main style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
            <Canvas roomId="room-1" />
        </main>
    );
}
