import AdminTeamManager from "@/components/admin/AdminTeamManager";
import { getExocorpseTeam } from "@/lib/tuturuuu-admin-integrations";
import { connection } from "next/server";

export default async function AdminMembersPage() {
  await connection();
  return <AdminTeamManager initialData={await getExocorpseTeam()} />;
}
