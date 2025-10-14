import FactionsClient from "@/app/admin/factions/FactionsClient";
import { getPublishedStories } from "@/lib/actions/wiki";

export default async function FactionsAdminPage() {
  const stories = await getPublishedStories();

  return <FactionsClient initialStories={stories} />;
}
