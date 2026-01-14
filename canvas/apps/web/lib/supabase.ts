/**
 * Supabase Browser Client
 *
 * Lightweight client for frontend auth - no server dependencies.
 */

import { createClient } from "@supabase/supabase-js";

// Use process.env directly for NEXT_PUBLIC_* variables
// (they're automatically exposed to the browser by Next.js)
// Avoid importing @repo/config here as it pulls in server-side deps (winston/fs)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
	console.warn(
		"[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
	);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
