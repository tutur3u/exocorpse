import StoriesClient from "@/app/admin/stories/StoriesClient";
import StorageAnalytics from "@/components/admin/StorageAnalytics";
import { getPublishedStories } from "@/lib/actions/wiki";

export default async function StoriesAdminPage() {
  const stories = await getPublishedStories();

  return (
    <div className="space-y-4">
      <StorageAnalytics />
      <StoriesClient initialStories={stories} />
    </div>
  );
}
