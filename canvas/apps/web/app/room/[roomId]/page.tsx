import dynamic from "next/dynamic";

const Canvas = dynamic(
	() => import("../../../components/Canvas").then((mod) => mod.Canvas),
	{
		ssr: false,
	},
);

export default function RoomPage({ params }: { params: { roomId: string } }) {
	return (
		<main style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
			<Canvas roomId={params.roomId} />
		</main>
	);
}
