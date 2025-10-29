import { getAllAddons } from "@/lib/actions/commissions";
import AddonsClient from "./AddonsClient";

export default async function AddonsAdminPage() {
  // Load initial data on the server
  const addons = await getAllAddons();

  return <AddonsClient initialAddons={addons} />;
}
