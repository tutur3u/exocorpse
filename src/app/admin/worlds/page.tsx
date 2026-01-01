import WorldsClient from "@/app/admin/worlds/WorldsClient";
import StorageAnalytics from "@/components/admin/StorageAnalytics";
import { getAllWorlds, getAllStories } from "@/lib/actions/wiki";

export default async function WorldsAdminPage() {
  const [stories, worlds] = await Promise.all([
    getAllStories(),
    getAllWorlds(),
  ]);

  return (
    <div className="space-y-4">
      <StorageAnalytics />
      <WorldsClient initialStories={stories} initialWorlds={worlds} />
    </div>
  );
}
