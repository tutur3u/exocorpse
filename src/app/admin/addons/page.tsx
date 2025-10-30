import { getAllAddons, getAllServices } from "@/lib/actions/commissions";
import AddonsClient from "./AddonsClient";

export default async function AddonsAdminPage() {
  // Load initial data on the server
  const [addons, services] = await Promise.all([
    getAllAddons(),
    getAllServices(),
  ]);

  return <AddonsClient initialAddons={addons} initialServices={services} />;
}
