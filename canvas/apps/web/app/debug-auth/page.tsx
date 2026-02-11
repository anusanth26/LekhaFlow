"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase.client";

export default function DebugAuthPage() {
	const [authInfo, setAuthInfo] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const checkAuth = async () => {
			const {
				data: { session },
				error,
			} = await supabase.auth.getSession();

			setAuthInfo({
				hasSession: !!session,
				hasToken: !!session?.access_token,
				token: session?.access_token
					? session.access_token.substring(0, 50) + "..."
					: null,
				user: session?.user
					? {
							id: session.user.id,
							email: session.user.email,
							metadata: session.user.user_metadata,
					  }
					: null,
				error: error?.message,
			});
			setLoading(false);
		};

		checkAuth();
	}, []);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p>Loading auth info...</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen p-8 bg-gray-50">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold mb-6">Authentication Debug Info</h1>

				<div className="bg-white rounded-lg shadow p-6 space-y-4">
					<div>
						<strong>Has Session:</strong>{" "}
						<span
							className={
								authInfo.hasSession ? "text-green-600" : "text-red-600"
							}
						>
							{authInfo.hasSession ? "✓ Yes" : "✗ No"}
						</span>
					</div>

					<div>
						<strong>Has Token:</strong>{" "}
						<span
							className={authInfo.hasToken ? "text-green-600" : "text-red-600"}
						>
							{authInfo.hasToken ? "✓ Yes" : "✗ No"}
						</span>
					</div>

					{authInfo.token && (
						<div>
							<strong>Token Preview:</strong>
							<pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-x-auto">
								{authInfo.token}
							</pre>
						</div>
					)}

					{authInfo.user && (
						<div>
							<strong>User Info:</strong>
							<pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-x-auto">
								{JSON.stringify(authInfo.user, null, 2)}
							</pre>
						</div>
					)}

					{authInfo.error && (
						<div>
							<strong className="text-red-600">Error:</strong>
							<p className="text-red-600 mt-2">{authInfo.error}</p>
						</div>
					)}

					{!authInfo.hasSession && (
						<div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
							<p className="text-yellow-800">
								You are not logged in. Please go to{" "}
								<a href="/login" className="underline font-semibold">
									/login
								</a>{" "}
								to sign in.
							</p>
						</div>
					)}
				</div>

				<div className="mt-6 flex gap-4">
					<a
						href="/login"
						className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
					>
						Go to Login
					</a>
					<a
						href="/"
						className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
					>
						Go to Home
					</a>
				</div>
			</div>
		</div>
	);
}
