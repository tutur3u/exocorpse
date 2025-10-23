import CharacterDetail from "@/components/apps/CharacterDetail";
import { type Character } from "@/lib/actions/wiki";

type CharacterViewProps = {
  character: Character;
  onWorldClick?: (worldSlug: string) => void;
};

export default function CharacterView({
  character,
  onWorldClick,
}: CharacterViewProps) {
  return (
    <div className="flex-1 overflow-hidden">
      <CharacterDetail character={character} onWorldClick={onWorldClick} />
    </div>
  );
}
