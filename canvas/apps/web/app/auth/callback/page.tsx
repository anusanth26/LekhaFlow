"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

/**
 * Auth Callback Page
 *
 * Handles the OAuth redirect. Supabase returns tokens in the URL hash,
 * which must be processed client-side. This page detects the session
 * and redirects to the intended destination.
 */
export default function AuthCallbackPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const handleAuthCallback = async () => {
			// Supabase automatically picks up tokens from the URL hash
			// and creates a session when we call getSession
			const {
				data: { session },
				error: sessionError,
			} = await supabase.auth.getSession();

			if (sessionError) {
				console.error("[AuthCallback] Error:", sessionError.message);
				setError(sessionError.message);
				return;
			}

			if (!session) {
				// No session yet - Supabase may still be processing
				// Wait a bit and check again
				const {
					data: { session: retrySession },
				} = await supabase.auth.getSession();

				if (!retrySession) {
					setError("Failed to authenticate. Please try again.");
					return;
				}
			}

			// Redirect to the intended destination
			const next = searchParams.get("next") ?? "/";
			router.replace(next);
		};

		handleAuthCallback();
	}, [router, searchParams]);

	if (error) {
		return (
			<div
				style={{
					minHeight: "100vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					background: "#fef2f2",
					padding: "20px",
				}}
			>
				<div
					style={{
						textAlign: "center",
						maxWidth: "400px",
					}}
				>
					<p style={{ color: "#dc2626", marginBottom: "16px" }}>{error}</p>
					<button
						type="button"
						onClick={() => router.push("/login")}
						style={{
							padding: "10px 20px",
							background: "#3b82f6",
							color: "white",
							border: "none",
							borderRadius: "8px",
							cursor: "pointer",
						}}
					>
						Back to Login
					</button>
				</div>
			</div>
		);
	}

	return (
		<div
			style={{
				minHeight: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
			}}
		>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: "16px",
				}}
			>
				<div
					style={{
						width: "48px",
						height: "48px",
						border: "4px solid rgba(255,255,255,0.3)",
						borderTopColor: "white",
						borderRadius: "50%",
						animation: "spin 1s linear infinite",
					}}
				/>
				<p style={{ color: "white", fontSize: "16px" }}>
					Completing sign in...
				</p>
			</div>
			<style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
		</div>
	);
}
