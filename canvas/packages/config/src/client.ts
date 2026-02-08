function assertClientEnv<T extends Record<string, string | undefined>>(
	env: T,
): asserts env is { [K in keyof T]: NonNullable<T[K]> } {
	for (const [key, value] of Object.entries(env)) {
		if (!value) {
			throw new Error(`Client environment variable ${key} is not set`);
		}
	}
}

export const clientEnv = {
	NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
	NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
	NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
	NEXT_PUBLIC_HTTP_URL: process.env.NEXT_PUBLIC_HTTP_URL,
};

assertClientEnv(clientEnv);
