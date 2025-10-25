import CharacterDetail from "@/components/apps/CharacterDetail";
import { type Character } from "@/lib/actions/wiki";

type CharacterViewProps = {
  character: Character;
  onWorldClick?: (worldSlug: string) => void;
  onFactionClick?: (factionSlug: string) => void;
};

export default function CharacterView({
  character,
  onWorldClick,
  onFactionClick,
}: CharacterViewProps) {
  return (
    <CharacterDetail
      character={character}
      onWorldClick={onWorldClick}
      onFactionClick={onFactionClick}
    />
  );
}
