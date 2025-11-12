"use client";

import {
  type Character,
  type Faction,
  type Location,
  type Story,
  type World,
} from "@/lib/actions/wiki";
import { useRouter } from "next/navigation";

type ViewMode =
  | "stories"
  | "story"
  | "world"
  | "character"
  | "faction"
  | "location";

type BreadcrumbsProps = {
  viewMode: ViewMode;
  selectedStory: Story | null;
  selectedWorld: World | null;
  viewingCharacter: Character | null;
  viewingFaction?: Faction | null;
  viewingLocation?: Location | null;
  onNavigate: (mode: ViewMode) => void;
};

export default function Breadcrumbs({
  viewMode,
  selectedStory,
  selectedWorld,
  viewingCharacter,
  viewingFaction,
  viewingLocation,
  onNavigate,
}: BreadcrumbsProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleForward = () => {
    router.forward();
  };

  const crumbs = [];

  // Add Stories link (except when we're on the stories page)
  if (
    viewMode === "story" ||
    viewMode === "world" ||
    viewMode === "character" ||
    viewMode === "faction" ||
    viewMode === "location"
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
      viewMode === "faction" ||
      viewMode === "location") &&
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
  if (
    (viewMode === "character" ||
      viewMode === "faction" ||
      viewMode === "location") &&
    selectedWorld
  ) {
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

  // Show current location name
  if (viewMode === "location" && viewingLocation) {
    crumbs.push(
      <span key="sep6" className="mx-2 text-gray-400">
        /
      </span>,
    );
    crumbs.push(
      <span key="current" className="text-gray-600 dark:text-gray-400">
        {viewingLocation.name}
      </span>,
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      {/* Back/Forward Navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleBack}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-300 bg-white transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
          title="Go back"
          type="button"
        >
          <svg
            className="h-4 w-4 text-gray-600 dark:text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={handleForward}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-300 bg-white transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
          title="Go forward"
          type="button"
        >
          <svg
            className="h-4 w-4 text-gray-600 dark:text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Separator */}
      {crumbs.length > 0 && (
        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
      )}

      {/* Breadcrumbs */}
      {crumbs.length > 0 && <div className="flex items-center">{crumbs}</div>}
    </div>
  );
}
