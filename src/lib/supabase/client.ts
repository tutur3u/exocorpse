import { createClient } from "@tuturuuu/supabase/next/client";
import type { Database } from "../../../supabase/types";

export function getSupabaseClient() {
  return createClient<Database>();
}
