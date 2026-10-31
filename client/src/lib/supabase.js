import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be defined in client/.env"
  );
}

if (import.meta.env.DEV) {
  console.log("[supabase client] URL:", supabaseUrl);
  console.log("[supabase client] key first6:", supabaseAnonKey.slice(0, 6), "len:", supabaseAnonKey.length);
  console.log("[supabase client] API_URL:", import.meta.env.VITE_API_URL);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: "myspend-auth",
  },
});
