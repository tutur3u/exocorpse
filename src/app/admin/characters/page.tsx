import CharactersClient from "@/app/admin/characters/CharactersClient";
import { getPublishedStories } from "@/lib/actions/wiki";

export default async function CharactersAdminPage() {
  const stories = await getPublishedStories();

  return <CharactersClient initialStories={stories} />;
}
