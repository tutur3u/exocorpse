import StoriesClient from "@/app/admin/stories/StoriesClient";
import { getPublishedStories } from "@/lib/actions/wiki";

export default async function StoriesAdminPage() {
  const stories = await getPublishedStories();

  return <StoriesClient initialStories={stories} />;
}
