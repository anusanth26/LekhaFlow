"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase.client";

export default function LoginPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleGoogleSignIn = async () => {
		setIsLoading(true);
		setError(null);

		// Get 'next' param to redirect after auth
		const urlParams = new URLSearchParams(window.location.search);
		const next = urlParams.get("next") ?? "/";

		const { error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
			},
		});

		if (error) {
			setError(error.message);
			setIsLoading(false);
		}
	};

	return (
		<div
			style={{
				minHeight: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
				padding: "20px",
			}}
		>
			<div
				style={{
					background: "rgba(255, 255, 255, 0.95)",
					backdropFilter: "blur(10px)",
					borderRadius: "24px",
					padding: "48px",
					maxWidth: "420px",
					width: "100%",
					boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
					textAlign: "center",
				}}
			>
				{/* Logo/Brand */}
				<div
					style={{
						width: "72px",
						height: "72px",
						background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
						borderRadius: "16px",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						margin: "0 auto 24px",
						boxShadow: "0 10px 40px -10px rgba(102, 126, 234, 0.5)",
					}}
				>
					<svg
						width="36"
						height="36"
						viewBox="0 0 24 24"
						fill="none"
						stroke="white"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
						<line x1="3" y1="9" x2="21" y2="9" />
						<line x1="9" y1="21" x2="9" y2="9" />
					</svg>
				</div>

				<h1
					style={{
						fontSize: "28px",
						fontWeight: 700,
						color: "#1a1a2e",
						marginBottom: "8px",
						letterSpacing: "-0.5px",
					}}
				>
					Digital Canvas
				</h1>

				<p
					style={{
						fontSize: "15px",
						color: "#64748b",
						marginBottom: "32px",
						lineHeight: 1.6,
					}}
				>
					Collaborate in real-time with your team
				</p>

				{/* Error Message */}
				{error && (
					<div
						style={{
							background: "#fef2f2",
							border: "1px solid #fecaca",
							borderRadius: "12px",
							padding: "12px 16px",
							marginBottom: "24px",
							color: "#dc2626",
							fontSize: "14px",
						}}
					>
						{error}
					</div>
				)}

				{/* Google Sign In Button */}
				<button
					type="button"
					onClick={handleGoogleSignIn}
					disabled={isLoading}
					style={{
						width: "100%",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						gap: "12px",
						padding: "14px 24px",
						fontSize: "16px",
						fontWeight: 500,
						color: "#1f2937",
						backgroundColor: "#ffffff",
						border: "2px solid #e5e7eb",
						borderRadius: "12px",
						cursor: isLoading ? "not-allowed" : "pointer",
						opacity: isLoading ? 0.7 : 1,
						transition: "all 0.2s ease",
						boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
					}}
					onMouseOver={(e) => {
						if (!isLoading) {
							e.currentTarget.style.borderColor = "#667eea";
							e.currentTarget.style.boxShadow =
								"0 4px 12px rgba(102, 126, 234, 0.15)";
						}
					}}
					onMouseOut={(e) => {
						e.currentTarget.style.borderColor = "#e5e7eb";
						e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
					}}
					onFocus={(e) => {
						if (!isLoading) {
							e.currentTarget.style.borderColor = "#667eea";
							e.currentTarget.style.boxShadow =
								"0 4px 12px rgba(102, 126, 234, 0.15)";
						}
					}}
					onBlur={(e) => {
						e.currentTarget.style.borderColor = "#e5e7eb";
						e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
					}}
				>
					{isLoading ? (
						<div
							style={{
								width: "20px",
								height: "20px",
								border: "2px solid #e5e7eb",
								borderTopColor: "#667eea",
								borderRadius: "50%",
								animation: "spin 1s linear infinite",
							}}
						/>
					) : (
						<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
							<path
								fill="#4285F4"
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							/>
							<path
								fill="#34A853"
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							/>
							<path
								fill="#FBBC05"
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
							/>
							<path
								fill="#EA4335"
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							/>
						</svg>
					)}
					{isLoading ? "Signing in..." : "Continue with Google"}
				</button>

				<p
					style={{
						marginTop: "24px",
						fontSize: "13px",
						color: "#94a3b8",
					}}
				>
					By continuing, you agree to our Terms of Service
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
