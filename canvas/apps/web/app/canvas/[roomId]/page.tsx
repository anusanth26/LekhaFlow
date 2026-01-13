import { CanvasClient } from "./CanvasClient";

export default async function CanvasPage({
    params,
}: {
    params: Promise<{ roomId: string }>;
}) {
    const roomId = (await params).roomId;

    return <CanvasClient roomId={roomId} />;
}
