import {
  createAdminClient,
  // createAnonClient,
  createClient,
} from "@tuturuuu/supabase/next/server";
import type { Database } from "../../../supabase/types";

export async function getSupabaseServer() {
  return await createClient<Database>();
}

export async function getSupabaseAdminServer() {
  return await createAdminClient<Database>();
}

// export async function getSupabaseAnonServer() {
//   return await createAnonClient<Database>();
// }
