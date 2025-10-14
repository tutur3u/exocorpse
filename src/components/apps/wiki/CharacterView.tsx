import CharacterDetail from "@/components/apps/CharacterDetail";
import { type Character } from "@/lib/actions/wiki";

type CharacterViewProps = {
  character: Character;
};

export default function CharacterView({ character }: CharacterViewProps) {
  return (
    <div className="flex-1 overflow-hidden">
      <CharacterDetail character={character} />
    </div>
  );
}
