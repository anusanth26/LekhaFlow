"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.client";
import { useCanvasStore } from "../store/canvas-store";
import { Canvas } from "./Canvas";

const USER_COLORS = [
	"#FF5733",
	"#33FF57",
	"#3357FF",
	"#F033FF",
	"#33FFF5",
	"#FF33A1",
	"#A133FF",
	"#33FFA1",
];

function getUserColor(userId: string): string {
	let hash = 0;
	for (let i = 0; i < userId.length; i++) {
		hash = userId.charCodeAt(i) + ((hash << 5) - hash);
	}
	return USER_COLORS[Math.abs(hash) % USER_COLORS.length] || "#FF5733";
}

export function CanvasAuthWrapper({ roomId }: { roomId: string }) {
	const [token, setToken] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();
	const setMyIdentity = useCanvasStore((s) => s.setMyIdentity);

	useEffect(() => {
		const fetchSession = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				router.replace(
					`/login?next=${encodeURIComponent(`/canvas/${roomId}`)}`,
				);
				return;
			}

			setToken(session.access_token);

			// Set real user identity in canvas store
			const user = session.user;
			const name =
				user.user_metadata?.name ||
				user.user_metadata?.full_name ||
				user.email?.split("@")[0] ||
				"User";
			const color = getUserColor(user.id);
			setMyIdentity(name, color);

			setLoading(false);
		};
		fetchSession();

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			if (session) {
				setToken(session.access_token);
				const user = session.user;
				const name =
					user.user_metadata?.name ||
					user.user_metadata?.full_name ||
					user.email?.split("@")[0] ||
					"User";
				const color = getUserColor(user.id);
				setMyIdentity(name, color);
			} else {
				router.replace(
					`/login?next=${encodeURIComponent(`/canvas/${roomId}`)}`,
				);
			}
		});

		return () => subscription.unsubscribe();
	}, [roomId, router, setMyIdentity]);

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen bg-gray-50">
				<div className="flex flex-col items-center gap-4">
					<div className="animate-spin rounded-full h-10 w-10 border-[3px] border-violet-200 border-t-violet-600" />
					<p className="text-gray-400 text-sm">Loading canvas...</p>
				</div>
			</div>
		);
	}

	return <Canvas roomId={roomId} token={token} />;
}
