import LocationsClient from "@/app/admin/locations/LocationsClient";
import StorageAnalytics from "@/components/admin/StorageAnalytics";
import { getAllLocations, getAllWorlds } from "@/lib/actions/wiki";

export default async function LocationsAdminPage() {
  const [worlds, locations] = await Promise.all([
    getAllWorlds(),
    getAllLocations(),
  ]);

  return (
    <div className="space-y-4">
      <StorageAnalytics />
      <LocationsClient initialWorlds={worlds} initialLocations={locations} />
    </div>
  );
}
