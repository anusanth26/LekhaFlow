import { env } from "@repo/config";
import { createClient } from "@supabase/supabase-js";

export const createSupabaseClient = () => {
	return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
};

export const supabase = createSupabaseClient();
export * from "./types"; 
