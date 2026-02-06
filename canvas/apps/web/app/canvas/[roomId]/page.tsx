import { CanvasPageClient } from "./CanvasPageClient";

export default async function CanvasPage({
	params,
}: {
	params: Promise<{ roomId: string }>;
}) {
	const roomId = (await params).roomId;

	return <CanvasPageClient roomId={roomId} />;
}
