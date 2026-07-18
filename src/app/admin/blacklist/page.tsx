import { getAdminBlacklistedUsersPaginated } from "@/lib/actions/blacklist";
import { connection } from "next/server";
import BlacklistClient from "./BlacklistClient";

export default async function BlacklistAdminPage() {
  await connection();
  // Load initial data on the server
  const initialData = await getAdminBlacklistedUsersPaginated(1, 10);

  return (
    <BlacklistClient
      initialUsers={initialData.data}
      initialTotal={initialData.total}
    />
  );
}
