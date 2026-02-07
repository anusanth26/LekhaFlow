"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.client";
import { Canvas } from "./Canvas";

export function CanvasAuthWrapper({ roomId }: { roomId: string }) {
	const [token, setToken] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchSession = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			setToken(session?.access_token ?? null);
			setLoading(false);
		};
		fetchSession();
	}, []);

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
