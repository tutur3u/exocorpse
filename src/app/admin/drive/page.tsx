import AdminDriveManager from "@/components/admin/AdminDriveManager";
import { getExocorpseDrive } from "@/lib/tuturuuu-admin-integrations";
import { connection } from "next/server";

export default async function AdminDrivePage({
  searchParams,
}: {
  searchParams: Promise<{ path?: string }>;
}) {
  await connection();
  const { path = "" } = await searchParams;
  const query = new URLSearchParams({
    limit: "100",
    path,
    sortBy: "name",
    sortOrder: "asc",
  });
  return <AdminDriveManager initialData={await getExocorpseDrive(query)} />;
}
