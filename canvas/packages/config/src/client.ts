function assertClientEnv<T extends Record<string, string | undefined>>(
	env: T,
): asserts env is { [K in keyof T]: NonNullable<T[K]> } {
	// Skip validation during build/SSR (server-side rendering)
	// Only validate in the browser at runtime
	if (typeof window === "undefined") {
		return;
	}

	for (const [key, value] of Object.entries(env)) {
		if (!value) {
			throw new Error(`Client environment variable ${key} is not set`);
		}
	}
}

const _clientEnv = {
	NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
	NEXT_PUBLIC_SUPABASE_ANON_KEY:
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
	NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || "",
	NEXT_PUBLIC_HTTP_URL: process.env.NEXT_PUBLIC_HTTP_URL || "",
};

assertClientEnv(_clientEnv);

export const clientEnv: {
	NEXT_PUBLIC_SUPABASE_URL: string;
	NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
	NEXT_PUBLIC_WS_URL: string;
	NEXT_PUBLIC_HTTP_URL: string;
} = _clientEnv;
