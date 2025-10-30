import {
  getAllAddons,
  getAllServices,
  getLinkedServicesMap,
} from "@/lib/actions/commissions";
import AddonsClient from "./AddonsClient";

export default async function AddonsAdminPage() {
  // Load initial data on the server
  const [addons, services, linkedServicesMap] = await Promise.all([
    getAllAddons(),
    getAllServices(),
    getLinkedServicesMap(),
  ]);

  return (
    <AddonsClient
      initialAddons={addons}
      initialServices={services}
      initialLinkedServices={linkedServicesMap}
    />
  );
}
