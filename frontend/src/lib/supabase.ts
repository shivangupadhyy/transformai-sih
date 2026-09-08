import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string) || "https://placeholder-project.supabase.co";
const supabasePublishableKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) || "placeholder-publishable-key";

export const supabase = createClient(supabaseUrl, supabasePublishableKey);

