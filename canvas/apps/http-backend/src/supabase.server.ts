import { serverEnv } from "@repo/config/server";
import { createClient } from "@supabase/supabase-js";

export const createServiceClient = () => {
	return createClient(serverEnv.SUPABASE_URL, serverEnv.SUPABASE_SERVICE_KEY, {
		auth: { persistSession: false },
	});
};
