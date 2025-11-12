"use client";

import type {
  Character,
  Faction,
  Location,
  Story,
  World,
} from "@/lib/actions/wiki";
import { createContext, useContext, type ReactNode } from "react";

export type CharacterDetailData = {
  characterId: string;
  gallery: Awaited<
    ReturnType<typeof import("@/lib/actions/wiki").getCharacterGallery>
  >;
  outfits: Awaited<
    ReturnType<typeof import("@/lib/actions/wiki").getCharacterOutfits>
  >;
  factions: Awaited<
    ReturnType<typeof import("@/lib/actions/wiki").getCharacterFactions>
  >;
  worlds: Awaited<
    ReturnType<typeof import("@/lib/actions/wiki").getCharacterWorlds>
  >;
  relationships: Awaited<
    ReturnType<typeof import("@/lib/actions/wiki").getCharacterRelationships>
  >;
};

export type InitialWikiData = {
  params: {
    story: string | null;
    world: string | null;
  };
  stories: Story[];
  worlds: World[];
  characters: Character[];
  factions: Faction[];
  locations: Location[];
  characterDetail: CharacterDetailData | null;
};

const InitialWikiDataContext = createContext<InitialWikiData | undefined>(
  undefined,
);

export function InitialWikiDataProvider({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: InitialWikiData;
}) {
  return (
    <InitialWikiDataContext.Provider value={initialData}>
      {children}
    </InitialWikiDataContext.Provider>
  );
}

export function useInitialWikiData() {
  const context = useContext(InitialWikiDataContext);
  if (context === undefined) {
    throw new Error(
      "useInitialWikiData must be used within InitialWikiDataProvider",
    );
  }
  return context;
}
