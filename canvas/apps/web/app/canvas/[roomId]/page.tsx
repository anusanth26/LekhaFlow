import { Canvas } from "../../../components/Canvas";

export default async function CanvasPage({
    params,
}: {
    params: Promise<{ roomId: string }>;
}) {
    const roomId = (await params).roomId;

    return <Canvas roomId={roomId} />;
}
