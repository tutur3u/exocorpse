import { getBlacklistedUsersPaginated } from "@/lib/actions/blacklist";
import BlacklistClient from "./BlacklistClient";

export default async function BlacklistAdminPage() {
  // Load initial data on the server
  const initialData = await getBlacklistedUsersPaginated(1, 10);

  return <BlacklistClient initialUsers={initialData.data} initialTotal={initialData.total} />;
}
