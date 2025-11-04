import CharacterDetail from "@/components/apps/CharacterDetail";
import { type Character } from "@/lib/actions/wiki";

type CharacterViewProps = {
  character: Character;
  onWorldClick?: (worldSlug: string) => void;
  onFactionClick?: (factionSlug: string) => void;
  onCharacterClick?: (characterSlug: string) => void;
};

export default function CharacterView({
  character,
  onWorldClick,
  onFactionClick,
  onCharacterClick,
}: CharacterViewProps) {
  return (
    <CharacterDetail
      character={character}
      onWorldClick={onWorldClick}
      onFactionClick={onFactionClick}
      onCharacterClick={onCharacterClick}
    />
  );
}
