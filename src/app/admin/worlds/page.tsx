import WorldsClient from "@/app/admin/worlds/WorldsClient";
import { getPublishedStories } from "@/lib/actions/wiki";

export default async function WorldsAdminPage() {
  const stories = await getPublishedStories();

  return <WorldsClient initialStories={stories} />;
}
