import HomeClient from "@/components/HomeClient";
import { MAX_DESCRIPTION_LENGTH } from "@/constants";
import type { InitialBlogData } from "@/contexts/InitialBlogDataContext";
import type { InitialCommissionData } from "@/contexts/InitialCommissionDataContext";
import type { InitialPortfolioData } from "@/contexts/InitialPortfolioDataContext";
import type { InitialWikiData } from "@/contexts/InitialWikiDataContext";
import { getBlacklistedUsersPaginated } from "@/lib/actions/blacklist";
import {
  getBlogPostBySlug,
  getPublishedBlogPostsPaginated,
} from "@/lib/actions/blog";
import { getActiveServices, getServiceBySlug } from "@/lib/actions/commissions";
import {
  getArtPieceBySlug,
  getArtPieces,
  getGamePieceBySlug,
  getGamePieces,
  getWritingPieceBySlug,
  getWritingPieces,
} from "@/lib/actions/portfolio";
import type { Character, Story } from "@/lib/actions/wiki";
import {
  getCharacterBySlug,
  getCharacterBySlugInStory,
  getCharacterDetailData,
  getCharactersByWorldSlug,
  getFactionBySlug,
  getFactionsByWorldSlug,
  getPublishedStories,
  getStoryBySlug,
  getWorldBySlug,
  getWorldsByStorySlug,
} from "@/lib/actions/wiki";
import {
  loadBlogSearchParams,
  serializeBlogSearchParams,
} from "@/lib/blog-search-params";
import { loadCommissionSearchParams } from "@/lib/commission-search-params";
import { loadPortfolioSearchParams } from "@/lib/portfolio-search-params";
import {
  loadWikiSearchParams,
  serializeWikiSearchParams,
} from "@/lib/wiki-search-params";
import type { Metadata } from "next";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
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
          blogPost.content?.substring(0, MAX_DESCRIPTION_LENGTH) ||
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
  // Blog landing (pagination only)
  if (blogParams["blog-page"] || blogParams["blog-page-size"]) {
    const page =
      (blogParams["blog-page"] ?? 1) > 1
        ? ` - Page ${blogParams["blog-page"]}`
        : "";
    return {
      title: `EXOCORPSE Blog${page}`,
      description: "Latest posts and updates from EXOCORPSE",
      alternates: {
        canonical: serializeBlogSearchParams("/", {
          "blog-post": null,
          "blog-page": blogParams["blog-page"] ?? 1,
          "blog-page-size": blogParams["blog-page-size"] ?? undefined,
        }),
      },
    };
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

  // Character view (without world - find character across all worlds in story)
  if (character && !world) {
    const characterData = await getCharacterBySlugInStory(story, character);
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
            world: null,
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

async function HomeContent({
  wikiParamsData,
  blogParamsData,
  commissionParamsData,
  portfolioParamsData,
}: {
  wikiParamsData: Awaited<ReturnType<typeof loadWikiSearchParams>>;
  blogParamsData: Awaited<ReturnType<typeof loadBlogSearchParams>>;
  commissionParamsData: Awaited<ReturnType<typeof loadCommissionSearchParams>>;
  portfolioParamsData: Awaited<ReturnType<typeof loadPortfolioSearchParams>>;
}) {
  const DEFAULT_PAGE_SIZE = 10;

  const wikiParams = wikiParamsData;
  const blogParams = blogParamsData;
  const commissionParams = commissionParamsData;
  const portfolioParams = portfolioParamsData;

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
    characterDetail: null,
  };

  // Fetch initial blog data based on params
  const rawPageSize = blogParams["blog-page-size"] ?? DEFAULT_PAGE_SIZE;
  const pageSize = Math.max(1, Math.min(rawPageSize, 50)); // cap at 50
  const initialBlogData: InitialBlogData = {
    posts: [],
    total: 0,
    page: 1,
    pageSize: pageSize,
    selectedPost: null,
  };

  // Fetch initial commission data based on params
  const commissionTab = commissionParams["commission-tab"] ?? "info";
  const blacklistPage = commissionParams["blacklist-page"] ?? 1;
  const blacklistPageSize =
    commissionParams["blacklist-page-size"] ?? DEFAULT_PAGE_SIZE;
  const serviceSlug = commissionParams.service;
  const styleSlug = commissionParams.style;

  // Fetch commission data based on tab and params
  let blacklistData: Awaited<ReturnType<typeof getBlacklistedUsersPaginated>> =
    {
      data: [],
      total: 0,
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
    };
  let commissionServices: Awaited<ReturnType<typeof getActiveServices>> = [];
  let selectedCommissionService: Awaited<ReturnType<typeof getServiceBySlug>> =
    null;

  if (commissionTab === "blacklist") {
    blacklistData = await getBlacklistedUsersPaginated(
      blacklistPage,
      blacklistPageSize,
    );
  }

  // Always fetch services if on services tab or if a service slug is present
  if (commissionTab === "services") {
    if (serviceSlug) {
      // Fetch specific service with all details
      selectedCommissionService = await getServiceBySlug(serviceSlug);
    } else {
      // Fetch all active services for the services list
      commissionServices = await getActiveServices();
    }
  } else if (serviceSlug) {
    // Service slug present but not on services tab - still fetch the service
    selectedCommissionService = await getServiceBySlug(serviceSlug);
  }

  const initialCommissionData: InitialCommissionData = {
    blacklistedUsers: blacklistData.data,
    blacklistTotal: blacklistData.total,
    blacklistPage: blacklistData.page,
    blacklistPageSize: blacklistData.pageSize,
    services: commissionServices,
    selectedService: selectedCommissionService,
    selectedStyleSlug: styleSlug,
  };

  // Fetch initial portfolio data based on params
  let artPieces: Awaited<ReturnType<typeof getArtPieces>> = [];
  let writingPieces: Awaited<ReturnType<typeof getWritingPieces>> = [];
  let gamePieces: Awaited<ReturnType<typeof getGamePieces>> = [];
  let selectedArtPiece: Awaited<ReturnType<typeof getArtPieceBySlug>> = null;
  let selectedWritingPiece: Awaited<ReturnType<typeof getWritingPieceBySlug>> =
    null;
  let selectedGamePiece: Awaited<ReturnType<typeof getGamePieceBySlug>> = null;

  if (portfolioParams["portfolio-piece"]) {
    // If we have a specific piece slug, fetch only that piece and infer tab if needed
    if (portfolioParams["portfolio-tab"] === "art") {
      selectedArtPiece = await getArtPieceBySlug(
        portfolioParams["portfolio-piece"],
      );
    } else if (portfolioParams["portfolio-tab"] === "writing") {
      selectedWritingPiece = await getWritingPieceBySlug(
        portfolioParams["portfolio-piece"],
      );
    } else if (portfolioParams["portfolio-tab"] === "games") {
      selectedGamePiece = await getGamePieceBySlug(
        portfolioParams["portfolio-piece"],
      );
    } else if (!portfolioParams["portfolio-tab"]) {
      // Tab is missing, need to infer - try art first, then writing, then games
      const artPiece = await getArtPieceBySlug(
        portfolioParams["portfolio-piece"],
      );
      if (artPiece) {
        selectedArtPiece = artPiece;
        portfolioParams["portfolio-tab"] = "art";
      } else {
        selectedWritingPiece = await getWritingPieceBySlug(
          portfolioParams["portfolio-piece"],
        );
        if (selectedWritingPiece) {
          portfolioParams["portfolio-tab"] = "writing";
        } else {
          selectedGamePiece = await getGamePieceBySlug(
            portfolioParams["portfolio-piece"],
          );
          if (selectedGamePiece) {
            portfolioParams["portfolio-tab"] = "games";
          }
        }
      }
    }
  } else {
    // No specific piece requested, fetch all pieces for the portfolio list
    [artPieces, writingPieces, gamePieces] = await Promise.all([
      getArtPieces(),
      getWritingPieces(),
      getGamePieces(),
    ]);
  }

  const initialPortfolioData: InitialPortfolioData = {
    artPieces,
    writingPieces,
    gamePieces,
    selectedArtPiece,
    selectedWritingPiece,
    selectedGamePiece,
    params: portfolioParams,
  };
  const hasWikiParams = !!(
    wikiParams.story ||
    wikiParams.world ||
    wikiParams.character ||
    wikiParams.faction
  );
  const hasBlogParams = !!(
    blogParams["blog-post"] ||
    blogParams["blog-page"] ||
    blogParams["blog-page-size"]
  );

  // Only fetch stories if visiting wiki (not blog-only)
  if (hasWikiParams) {
    // Fetch stories + blog data in parallel if blog params also exist
    const storiesPromise = getPublishedStories();

    // Determine which blog fetch to start and await both in parallel
    let stories: Story[];
    let blogPost: typeof initialBlogData.selectedPost = null;
    let paginatedBlogData: Awaited<
      ReturnType<typeof getPublishedBlogPostsPaginated>
    > | null = null;

    if (hasBlogParams && blogParams["blog-post"]) {
      [stories, blogPost] = await Promise.all([
        storiesPromise,
        getBlogPostBySlug(blogParams["blog-post"]),
      ]);
    } else if (hasBlogParams) {
      const page = Math.max(1, blogParams["blog-page"] ?? 1);
      [stories, paginatedBlogData] = await Promise.all([
        storiesPromise,
        getPublishedBlogPostsPaginated(page, pageSize),
      ]);
    } else {
      // Wiki only, no blog params
      stories = await storiesPromise;
    }

    // Assign results after both promises resolve
    initialWikiData.stories = stories;

    // Handle blog data based on which fetch was performed
    if (hasBlogParams) {
      if (blogParams["blog-post"]) {
        if (blogPost) {
          initialBlogData.selectedPost = blogPost;
        }
      } else {
        if (paginatedBlogData) {
          initialBlogData.posts = paginatedBlogData.data;
          initialBlogData.total = paginatedBlogData.total;
          initialBlogData.page = paginatedBlogData.page;
          initialBlogData.pageSize = paginatedBlogData.pageSize;
        }
      }
    }
  } else if (hasBlogParams) {
    // Blog only, no wiki params - fetch blog data without stories
    if (blogParams["blog-post"]) {
      const blogPost = await getBlogPostBySlug(blogParams["blog-post"]);
      if (blogPost) {
        initialBlogData.selectedPost = blogPost;
      }
    } else {
      const page = Math.max(1, blogParams["blog-page"] ?? 1);
      const paginatedData = await getPublishedBlogPostsPaginated(
        page,
        pageSize,
      );
      initialBlogData.posts = paginatedData.data;
      initialBlogData.total = paginatedData.total;
      initialBlogData.page = paginatedData.page;
      initialBlogData.pageSize = paginatedData.pageSize;
    }
  }

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

      // If a specific character is selected, fetch only that character
      if (wikiParams.character) {
        const selectedCharacter = await getCharacterBySlug(
          wikiParams.story,
          wikiParams.world,
          wikiParams.character,
        );
        if (selectedCharacter && selectedCharacter.id) {
          const detailData = await getCharacterDetailData(selectedCharacter.id);
          initialWikiData.characterDetail = {
            characterId: selectedCharacter.id,
            ...detailData,
          };
        }
      }
    } else if (wikiParams.character) {
      // Fetch specific character directly without fetching all characters
      const selectedCharacter = await getCharacterBySlugInStory(
        wikiParams.story,
        wikiParams.character,
      );
      if (selectedCharacter && selectedCharacter.id) {
        initialWikiData.characters = [selectedCharacter as Character];

        const detailData = await getCharacterDetailData(selectedCharacter.id);
        initialWikiData.characterDetail = {
          characterId: selectedCharacter.id,
          ...detailData,
        };
      }
    }
  }

  return (
    <HomeClient
      wikiParams={wikiParams}
      blogParams={blogParams}
      commissionParams={commissionParams}
      portfolioParams={portfolioParams}
      initialWikiData={initialWikiData}
      initialBlogData={initialBlogData}
      initialCommissionData={initialCommissionData}
      initialPortfolioData={initialPortfolioData}
    />
  );
}

export default async function Home({ searchParams }: Props) {
  return <HomeContentWrapper searchParams={searchParams} />;
}

async function HomeContentWrapper({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Await searchParams inside Suspense boundary
  const wikiParamsData = await loadWikiSearchParams(searchParams);
  const blogParamsData = await loadBlogSearchParams(searchParams);
  const commissionParamsData = await loadCommissionSearchParams(searchParams);
  const portfolioParamsData = await loadPortfolioSearchParams(searchParams);

  // Pass resolved params to cached component
  return (
    <HomeContent
      wikiParamsData={wikiParamsData}
      blogParamsData={blogParamsData}
      commissionParamsData={commissionParamsData}
      portfolioParamsData={portfolioParamsData}
    />
  );
}
