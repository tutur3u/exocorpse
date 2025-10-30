import StorageAnalytics from "@/components/admin/StorageAnalytics";
import { getAllAddons, getAllServices } from "@/lib/actions/commissions";
import ServicesClient from "./ServicesClient";

export default async function ServicesAdminPage() {
  // Load initial data on the server
  const [services, addons] = await Promise.all([
    getAllServices(),
    getAllAddons(),
  ]);

  return (
    <div className="space-y-4">
      <StorageAnalytics />
      <ServicesClient initialServices={services} initialAddons={addons} />
    </div>
  );
}
