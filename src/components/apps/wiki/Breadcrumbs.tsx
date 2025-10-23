import {
  type Character,
  type Faction,
  type Story,
  type World,
} from "@/lib/actions/wiki";

type ViewMode = "stories" | "story" | "world" | "character" | "faction";

type BreadcrumbsProps = {
  viewMode: ViewMode;
  selectedStory: Story | null;
  selectedWorld: World | null;
  viewingCharacter: Character | null;
  viewingFaction?: Faction | null;
  onNavigate: (mode: ViewMode) => void;
};

export default function Breadcrumbs({
  viewMode,
  selectedStory,
  selectedWorld,
  viewingCharacter,
  viewingFaction,
  onNavigate,
}: BreadcrumbsProps) {
  const crumbs = [];

  // Add Stories link (except when we're on the stories page)
  if (
    viewMode === "story" ||
    viewMode === "world" ||
    viewMode === "character" ||
    viewMode === "faction"
  ) {
    crumbs.push(
      <button
        key="stories"
        onClick={() => onNavigate("stories")}
        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      >
        Stories
      </button>,
    );
  }

  // Add Story link
  if (
    (viewMode === "world" ||
      viewMode === "character" ||
      viewMode === "faction") &&
    selectedStory
  ) {
    crumbs.push(
      <span key="sep1" className="mx-2 text-gray-400">
        /
      </span>,
    );
    crumbs.push(
      <button
        key="story"
        onClick={() => onNavigate("story")}
        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      >
        {selectedStory.title}
      </button>,
    );
  }

  // Show current story name (when on story page)
  if (viewMode === "story" && selectedStory) {
    crumbs.push(
      <span key="sep2" className="mx-2 text-gray-400">
        /
      </span>,
    );
    crumbs.push(
      <span key="current" className="text-gray-600 dark:text-gray-400">
        {selectedStory.title}
      </span>,
    );
  }

  // Add World link
  if ((viewMode === "character" || viewMode === "faction") && selectedWorld) {
    crumbs.push(
      <span key="sep3" className="mx-2 text-gray-400">
        /
      </span>,
    );
    crumbs.push(
      <button
        key="world"
        onClick={() => onNavigate("world")}
        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      >
        {selectedWorld.name}
      </button>,
    );
  }

  // Show current world name (when on world page)
  if (viewMode === "world" && selectedWorld) {
    crumbs.push(
      <span key="sep3b" className="mx-2 text-gray-400">
        /
      </span>,
    );
    crumbs.push(
      <span key="current-world" className="text-gray-600 dark:text-gray-400">
        {selectedWorld.name}
      </span>,
    );
  }

  // Show current character name
  if (viewMode === "character" && viewingCharacter) {
    crumbs.push(
      <span key="sep4" className="mx-2 text-gray-400">
        /
      </span>,
    );
    crumbs.push(
      <span key="current" className="text-gray-600 dark:text-gray-400">
        {viewingCharacter.name}
      </span>,
    );
  }

  // Show current faction name
  if (viewMode === "faction" && viewingFaction) {
    crumbs.push(
      <span key="sep5" className="mx-2 text-gray-400">
        /
      </span>,
    );
    crumbs.push(
      <span key="current" className="text-gray-600 dark:text-gray-400">
        {viewingFaction.name}
      </span>,
    );
  }

  return crumbs.length > 0 ? (
    <div className="flex items-center text-sm">{crumbs}</div>
  ) : null;
}
