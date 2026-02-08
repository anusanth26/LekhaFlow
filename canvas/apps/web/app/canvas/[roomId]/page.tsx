import { CanvasAuthWrapper } from "../../../components/CanvasAuthWrapper";

export default async function CanvasPage({
	params,
}: {
	params: Promise<{ roomId: string }>;
}) {
	const roomId = (await params).roomId;

	return <CanvasAuthWrapper roomId={roomId} />;
}
