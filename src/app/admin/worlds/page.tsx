import WorldsClient from "@/app/admin/worlds/WorldsClient";
import { getAllWorlds, getPublishedStories } from "@/lib/actions/wiki";

export default async function WorldsAdminPage() {
  const [stories, worlds] = await Promise.all([
    getPublishedStories(),
    getAllWorlds(),
  ]);

  return <WorldsClient initialStories={stories} initialWorlds={worlds} />;
}
