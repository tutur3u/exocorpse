import HomeClient from "@/components/HomeClient";
import { MAX_DESCRIPTION_LENGTH } from "@/constants";
import {
  getBlogPostBySlug,
  getPublishedBlogPostsPaginated,
  type BlogPost,
} from "@/lib/actions/blog";
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
  loadBlogSearchParams,
  serializeBlogSearchParams,
} from "@/lib/blog-search-params";
import {
  loadWikiSearchParams,
  serializeWikiSearchParams,
} from "@/lib/wiki-search-params";
import type { Metadata } from "next";

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

export type InitialBlogData = {
  posts: BlogPost[];
  total: number;
  page: number;
  pageSize: number;
  selectedPost: BlogPost | null;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  // Check for blog params first
  const blogParams = await loadBlogSearchParams(searchParams);
  const { "blog-post": blogPostSlug } = blogParams;

  // Blog post view
  if (blogPostSlug) {
    const blogPost = await getBlogPostBySlug(blogPostSlug);
    if (blogPost) {
      return {
        title: `${blogPost.title} - EXOCORPSE Blog`,
        description:
          blogPost.excerpt ||
          blogPost.content.substring(0, MAX_DESCRIPTION_LENGTH) ||
          "Blog post from EXOCORPSE",
        alternates: {
          canonical: serializeBlogSearchParams("/", {
            "blog-post": blogPostSlug,
            "blog-page": null,
          }),
        },
      };
    }
  }

  // Check for wiki params
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
  const DEFAULT_PAGE_SIZE = 10;

  // Load both wiki and blog params
  const wikiParams = await loadWikiSearchParams(searchParams);
  const blogParams = await loadBlogSearchParams(searchParams);

  // Fetch initial wiki data based on params
  const initialWikiData: InitialWikiData = {
    params: {
      story: wikiParams.story,
      world: wikiParams.world,
    },
    stories: [],
    worlds: [],
    characters: [],
    factions: [],
  };

  // Always fetch stories for initial data
  initialWikiData.stories = await getPublishedStories();

  // Fetch worlds if story is selected
  if (wikiParams.story) {
    initialWikiData.worlds = await getWorldsByStorySlug(wikiParams.story);

    // Fetch characters and factions if world is selected
    if (wikiParams.world) {
      const [characters, factions] = await Promise.all([
        getCharactersByWorldSlug(wikiParams.story, wikiParams.world),
        getFactionsByWorldSlug(wikiParams.story, wikiParams.world),
      ]);
      initialWikiData.characters = characters;
      initialWikiData.factions = factions;
    }
  }

  // Fetch initial blog data based on params
  const pageSize = blogParams["blog-page-size"] || DEFAULT_PAGE_SIZE;
  const initialBlogData: InitialBlogData = {
    posts: [],
    total: 0,
    page: 1,
    pageSize: pageSize,
    selectedPost: null,
  };

  // If a specific blog post is selected
  if (blogParams["blog-post"]) {
    const post = await getBlogPostBySlug(blogParams["blog-post"]);
    if (post) {
      initialBlogData.selectedPost = post;
    }
  } else {
    // Otherwise, fetch paginated posts for the current page
    const page = blogParams["blog-page"] || 1;
    const paginatedData = await getPublishedBlogPostsPaginated(page, pageSize);
    initialBlogData.posts = paginatedData.data;
    initialBlogData.total = paginatedData.total;
    initialBlogData.page = paginatedData.page;
    initialBlogData.pageSize = paginatedData.pageSize;
  }

  return (
    <HomeClient
      wikiParams={wikiParams}
      blogParams={blogParams}
      initialWikiData={initialWikiData}
      initialBlogData={initialBlogData}
    />
  );
}
