import { getCofiAdminSummary } from "@/lib/cofi-admin";
import { getCofiDatasetFromDb } from "@/lib/cofi-data";
import CofiAdminClient from "./CofiAdminClient";
import { getSupabaseAdminServer } from "@/lib/supabase/server";

export default async function AdminCofiPage() {
  const supabase = await getSupabaseAdminServer();
  const [summary, dataset] = await Promise.all([
    getCofiAdminSummary(supabase),
    getCofiDatasetFromDb(),
  ]);

  return <CofiAdminClient summary={summary} dataset={dataset} />;
}
