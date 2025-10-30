import FactionsClient from "@/app/admin/factions/FactionsClient";
import StorageAnalytics from "@/components/admin/StorageAnalytics";
import { getPublishedStories } from "@/lib/actions/wiki";

export default async function FactionsAdminPage() {
  const stories = await getPublishedStories();

  return (
    <div className="space-y-4">
      <StorageAnalytics />
      <FactionsClient initialStories={stories} />
    </div>
  );
}
