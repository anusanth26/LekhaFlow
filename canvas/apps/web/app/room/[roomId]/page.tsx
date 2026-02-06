"use client";

import dynamic from "next/dynamic";
import { use, useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

const Canvas = dynamic(
	() => import("../../../components/Canvas").then((mod) => mod.Canvas),
	{
		ssr: false,
		loading: () => (
			<div className="w-screen h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
				<div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
				<p className="text-gray-500 text-sm">Loading canvas...</p>
			</div>
		),
	},
);

export default function RoomPage({
	params,
}: {
	params: Promise<{ roomId: string }>;
}) {
	const { roomId } = use(params);

	const [token, setToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchSession = async () => {
			try {
				const {
					data: { session },
					error: sessionError,
				} = await supabase.auth.getSession();

				if (sessionError) {
					throw sessionError;
				}

				if (!session) {
					const loginUrl = `/login?next=${encodeURIComponent(`/room/${roomId}`)}`;
					window.location.href = loginUrl;
					return;
				}

				setToken(session.access_token);
				setIsLoading(false);
			} catch (err) {
				console.error("[RoomPage] Auth error:", err);
				setError("Failed to authenticate");
				setIsLoading(false);
			}
		};

		fetchSession();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			if (session) {
				setToken(session.access_token);
			} else {
				const loginUrl = `/login?next=${encodeURIComponent(`/room/${roomId}`)}`;
				window.location.href = loginUrl;
			}
		});

		return () => subscription.unsubscribe();
	}, [roomId]);

	if (isLoading) {
		return (
			<div className="w-screen h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
				<div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
				<p className="text-gray-500 text-sm">Authenticating...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="w-screen h-screen flex flex-col items-center justify-center bg-red-50 gap-4">
				<div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
					<svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
					</svg>
				</div>
				<p className="text-red-600 text-base font-medium">{error}</p>
				<button
					type="button"
					onClick={() => window.location.reload()}
					className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl cursor-pointer transition-colors"
				>
					Retry
				</button>
			</div>
		);
	}

	return (
		<main className="w-screen h-screen overflow-hidden">
			<Canvas roomId={roomId} token={token} />
		</main>
	);
}
