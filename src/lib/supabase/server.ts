import { createClient } from "@tuturuuu/supabase/next/server";
import type { Database } from "../../../supabase/types";

export async function getSupabaseServer() {
  return await createClient<Database>();
}
