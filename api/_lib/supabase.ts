import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;

if (!url) throw new Error("VITE_SUPABASE_URL is not set");
if (!key) throw new Error("SUPABASE_SERVICE_KEY is not set");

/** Service-role Supabase client — server-side only, never exposed to browser */
export const supabaseAdmin = createClient(url, key, {
  auth: { persistSession: false },
});
