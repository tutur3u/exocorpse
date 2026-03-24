import { getCofiDatasetFromDb } from "@/lib/cofi-data";
import CofiAdminClient from "./CofiAdminClient";

export default async function AdminCofiPage() {
  const dataset = await getCofiDatasetFromDb();

  return <CofiAdminClient dataset={dataset} />;
}
