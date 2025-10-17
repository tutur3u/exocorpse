import HomeClient from "@/components/HomeClient";
import { MAX_DESCRIPTION_LENGTH } from "@/constants";
import {
  getCharacterBySlug,
  getCharactersByWorldSlug,
  getFactionBySlug,
  getFactionsByWorldSlug,
  getPublishedStories,
  getStoryBySlug,
  getWorldBySlug,
  getWorldsByStorySlug,
  type Character,
  type Faction,
  type Story,
  type World,
} from "@/lib/actions/wiki";
import {
  loadWikiSearchParams,
  serializeWikiSearchParams,
} from "@/lib/wiki-search-params";
import type { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
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
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const params = await loadWikiSearchParams(searchParams);
  const { story, world, character, faction } = params;

  // No wiki params, return default metadata
  if (!story) {
    return {
      title: "EXOCORPSE",
      description: "Explore the EXOCORPSE universe, characters, and stories",
    };
  }

  // Get story data
  const storyData = await getStoryBySlug(story);
  if (!storyData) {
    return {
      title: "Story Not Found - EXOCORPSE",
      description: "The requested story could not be found",
    };
  }

  // Character view
  if (world && character) {
    const characterData = await getCharacterBySlug(story, world, character);
    if (characterData) {
      return {
        title: `${characterData.name} - ${storyData.title} - EXOCORPSE`,
        description:
          characterData.personality_summary ||
          characterData.backstory?.substring(0, MAX_DESCRIPTION_LENGTH) ||
          `Character profile for ${characterData.name}`,
        alternates: {
          canonical: serializeWikiSearchParams("/", {
            story,
            world,
            character,
            faction: null,
          }),
        },
      };
    }
  }

  // Faction view
  if (world && faction) {
    const factionData = await getFactionBySlug(story, world, faction);
    if (factionData) {
      return {
        title: `${factionData.name} - ${storyData.title} - EXOCORPSE`,
        description:
          factionData.description?.substring(0, MAX_DESCRIPTION_LENGTH) ||
          `Faction information for ${factionData.name}`,
        alternates: {
          canonical: serializeWikiSearchParams("/", {
            story,
            world,
            character: null,
            faction,
          }),
        },
      };
    }
  }

  // World view
  if (world) {
    const worldData = await getWorldBySlug(story, world);
    if (worldData) {
      return {
        title: `${worldData.name} - ${storyData.title} - EXOCORPSE`,
        description:
          worldData.description?.substring(0, MAX_DESCRIPTION_LENGTH) ||
          `World information for ${worldData.name}`,
        alternates: {
          canonical: serializeWikiSearchParams("/", {
            story,
            world,
            character: null,
            faction: null,
          }),
        },
      };
    }
  }

  // Story view
  return {
    title: `${storyData.title} - EXOCORPSE`,
    description:
      storyData.description?.substring(0, MAX_DESCRIPTION_LENGTH) ||
      storyData.summary ||
      `Explore the ${storyData.title} story`,
    alternates: {
      canonical: serializeWikiSearchParams("/", {
        story,
        world: null,
        character: null,
        faction: null,
      }),
    },
  };
}

export default async function Home({ searchParams }: Props) {
  const params = await loadWikiSearchParams(searchParams);

  // Fetch initial data based on params
  const initialData: InitialWikiData = {
    params: {
      story: params.story,
      world: params.world,
    },
    stories: [],
    worlds: [],
    characters: [],
    factions: [],
  };

  // Always fetch stories for initial data
  initialData.stories = await getPublishedStories();

  // Fetch worlds if story is selected
  if (params.story) {
    initialData.worlds = await getWorldsByStorySlug(params.story);

    // Fetch characters and factions if world is selected
    if (params.world) {
      const [characters, factions] = await Promise.all([
        getCharactersByWorldSlug(params.story, params.world),
        getFactionsByWorldSlug(params.story, params.world),
      ]);
      initialData.characters = characters;
      initialData.factions = factions;
    }
  }

  return (
    <NuqsAdapter>
      <HomeClient wikiParams={params} initialData={initialData} />
    </NuqsAdapter>
  );
}
