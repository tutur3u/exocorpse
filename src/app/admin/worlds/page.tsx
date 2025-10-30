import WorldsClient from "@/app/admin/worlds/WorldsClient";
import StorageAnalytics from "@/components/admin/StorageAnalytics";
import { getAllWorlds, getPublishedStories } from "@/lib/actions/wiki";

export default async function WorldsAdminPage() {
  const [stories, worlds] = await Promise.all([
    getPublishedStories(),
    getAllWorlds(),
  ]);

  return (
    <div className="space-y-4">
      <StorageAnalytics />
      <WorldsClient initialStories={stories} initialWorlds={worlds} />
    </div>
  );
}
