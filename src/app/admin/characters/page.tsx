import CharactersClient from "@/app/admin/characters/CharactersClient";
import StorageAnalytics from "@/components/admin/StorageAnalytics";
import { getPublishedStories } from "@/lib/actions/wiki";

export default async function CharactersAdminPage() {
  const stories = await getPublishedStories();

  return (
    <div className="space-y-4">
      <StorageAnalytics />
      <CharactersClient initialStories={stories} />
    </div>
  );
}
