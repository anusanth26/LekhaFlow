import { createClient } from '@supabase/supabase-js';
import { env } from '@repo/config'; // Your config package

// Export a function to create a client (best for SSR/Context separation)
export const createSupabaseClient = () => {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
};

// Export a singleton for simple backend scripts if needed
export const supabase = createSupabaseClient();