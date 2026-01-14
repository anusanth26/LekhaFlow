"use client";

import dynamic from "next/dynamic";
import { use, useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

const Canvas = dynamic(
	() => import("../../../components/Canvas").then((mod) => mod.Canvas),
	{
		ssr: false,
		loading: () => (
			<div
				style={{
					width: "100vw",
					height: "100vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: "#f8fafc",
					flexDirection: "column",
					gap: "16px",
				}}
			>
				<div
					style={{
						width: "48px",
						height: "48px",
						border: "4px solid #e2e8f0",
						borderTopColor: "#3b82f6",
						borderRadius: "50%",
						animation: "spin 1s linear infinite",
					}}
				/>
				<p style={{ color: "#64748b", fontSize: "14px" }}>Loading canvas...</p>
				<style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
			</div>
		),
	},
);

export default function RoomPage({
	params,
}: {
	params: Promise<{ roomId: string }>;
}) {
	// In Next.js 16+, params is a Promise and must be unwrapped with React.use()
	const { roomId } = use(params);

	// Auth state
	const [token, setToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch session on mount
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
					// No session: redirect to login page
					// Pass the current URL as 'next' so user returns here after auth
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

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			if (session) {
				setToken(session.access_token);
			} else {
				// Session lost: redirect to login
				const loginUrl = `/login?next=${encodeURIComponent(`/room/${roomId}`)}`;
				window.location.href = loginUrl;
			}
		});

		return () => subscription.unsubscribe();
	}, [roomId]);

	// Loading state
	if (isLoading) {
		return (
			<div
				style={{
					width: "100vw",
					height: "100vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: "#f8fafc",
					flexDirection: "column",
					gap: "16px",
				}}
			>
				<div
					style={{
						width: "48px",
						height: "48px",
						border: "4px solid #e2e8f0",
						borderTopColor: "#3b82f6",
						borderRadius: "50%",
						animation: "spin 1s linear infinite",
					}}
				/>
				<p style={{ color: "#64748b", fontSize: "14px" }}>Authenticating...</p>
				<style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
			</div>
		);
	}

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
