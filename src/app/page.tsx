import HomeClient from "@/components/HomeClient";
import { getAboutPageData } from "@/lib/actions/about";
import type { InitialAboutData } from "@/lib/about";
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
  getCharacterGallery,
  getCharactersByWorldSlug,
  getFactionBySlug,
  getFactionBySlugInStory,
  getFactionsByWorldSlug,
  getLocationGallery,
  getLocationBySlug,
  getLocationsByWorldSlug,
  getPublicStories,
  getStoryBySlug,
  getWorldBySlug,
  getWorldsByStorySlug,
} from "@/lib/actions/wiki";
import {
  loadBlogSearchParams,
  serializeBlogSearchParams,
} from "@/lib/blog-search-params";
import { loadCommissionSearchParams } from "@/lib/commission-search-params";
import {
  loadGameSearchParams,
  serializeGameSearchParams,
} from "@/lib/game-search-params";
import {
  loadPortfolioSearchParams,
  serializePortfolioSearchParams,
} from "@/lib/portfolio-search-params";
import {
  loadWikiSearchParams,
  serializeWikiSearchParams,
} from "@/lib/wiki-search-params";
import { toAbsoluteUrl } from "@/lib/site-url";
import type { Metadata } from "next";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const SOCIAL_DESCRIPTION_LENGTH = 150;
const OG_COVER_TRANSFORM = {
  width: 1200,
  height: 630,
  resize: "cover" as const,
  quality: 72,
};

function truncateMetaDescription(value: string | null | undefined) {
  const normalized =
    value?.replace(/\s+/g, " ").trim() ||
    "Explore the archive entry on EXOCORPSE.";
  if (normalized.length <= SOCIAL_DESCRIPTION_LENGTH) {
    return normalized;
  }
  return `${normalized.slice(0, SOCIAL_DESCRIPTION_LENGTH - 1).trimEnd()}…`;
}

function buildOgCoverImageUrl(pathOrUrl: string | null | undefined) {
  if (!pathOrUrl) {
    return null;
  }

  const params = new URLSearchParams({
    src: pathOrUrl,
  });

  return toAbsoluteUrl(`/api/og-image?${params.toString()}`);
}

function buildSocialImages(
  title: string,
  pathOrUrl: string | null | undefined,
) {
  const ogImageUrl = buildOgCoverImageUrl(pathOrUrl);

  if (!ogImageUrl) {
    return {
      openGraphImages: undefined,
      twitterImages: undefined,
    };
  }

  return {
    openGraphImages: [
      {
        url: ogImageUrl,
        type: "image/jpeg",
        width: OG_COVER_TRANSFORM.width,
        height: OG_COVER_TRANSFORM.height,
        alt: title,
      },
    ],
    twitterImages: [ogImageUrl],
  };
}

function buildWikiSocialMetadata({
  title,
  description,
  canonicalUrl,
  imagePathOrUrl,
}: {
  title: string;
  description: string;
  canonicalUrl: string;
  imagePathOrUrl?: string | null;
}): Pick<Metadata, "alternates" | "openGraph" | "twitter"> {
  const { openGraphImages, twitterImages } = buildSocialImages(
    title,
    imagePathOrUrl,
  );

  return {
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      url: canonicalUrl,
      title,
      description,
      images: openGraphImages,
    },
    twitter: {
      card: twitterImages ? "summary_large_image" : "summary",
      title,
      description,
      images: twitterImages,
    },
  };
}

async function resolveCharacterOgImage(characterId: string | null | undefined) {
  if (!characterId) {
    return null;
  }

  const gallery = await getCharacterGallery(characterId);
  return gallery.find((item) => Boolean(item.image_url))?.image_url ?? null;
}

async function resolveLocationOgImage(locationId: string | null | undefined) {
  if (!locationId) {
    return null;
  }

  const gallery = await getLocationGallery(locationId);
  return gallery.find((item) => Boolean(item.image_url))?.image_url ?? null;
}

function getFactionWorldSlug(
  faction:
    | (Awaited<ReturnType<typeof getFactionBySlugInStory>> & {
        worlds?:
          | {
              slug: string | null;
            }
          | Array<{
              slug: string | null;
            }>
          | null;
      })
    | null,
) {
  if (!faction) {
    return null;
  }

  const worlds = faction.worlds;
  if (Array.isArray(worlds)) {
    return worlds[0]?.slug ?? null;
  }

  return worlds?.slug ?? null;
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const gameParams = await loadGameSearchParams(searchParams);

  if (gameParams.game === "heaven-space") {
    return {
      title: "HEAVEN SPACE - EXOCORPSE",
      description: "Remember, Regret, Reincarnate.",
      alternates: {
        canonical: serializeGameSearchParams("/", {
          game: "heaven-space",
        }),
      },
    };
  }

  // Check for blog params first
  const blogParams = await loadBlogSearchParams(searchParams);
  const { "blog-post": blogPostSlug } = blogParams;
  // Blog post view
  if (blogPostSlug) {
    const blogPost = await getBlogPostBySlug(blogPostSlug);
    if (blogPost) {
      const metaDescription = truncateMetaDescription(
        blogPost.excerpt || blogPost.content,
      );
      const canonicalUrl = serializeBlogSearchParams("/", {
        "blog-post": blogPostSlug,
        "blog-page": null,
      });
      const ogImageUrl = buildOgCoverImageUrl(blogPost.cover_url);

      return {
        title: `${blogPost.title} - EXOCORPSE Blog`,
        description: metaDescription,
        alternates: {
          canonical: canonicalUrl,
        },
        openGraph: {
          type: "article",
          url: canonicalUrl,
          title: `${blogPost.title} - EXOCORPSE Blog`,
          description: metaDescription,
          images: ogImageUrl
            ? [
                {
                  url: ogImageUrl,
                  type: "image/jpeg",
                  width: OG_COVER_TRANSFORM.width,
                  height: OG_COVER_TRANSFORM.height,
                  alt: blogPost.title,
                },
              ]
            : undefined,
        },
        twitter: {
          card: "summary_large_image",
          title: `${blogPost.title} - EXOCORPSE Blog`,
          description: metaDescription,
          images: ogImageUrl ? [ogImageUrl] : undefined,
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
    const canonicalUrl = serializeBlogSearchParams("/", {
      "blog-post": null,
      "blog-page": blogParams["blog-page"] ?? 1,
      "blog-page-size": blogParams["blog-page-size"] ?? undefined,
    });
    return {
      title: `EXOCORPSE Blog${page}`,
      description: "Latest posts and updates from EXOCORPSE",
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        url: canonicalUrl,
      },
    };
  }

  const portfolioParams = await loadPortfolioSearchParams(searchParams);
  const portfolioPieceSlug = portfolioParams["portfolio-piece"];

  if (portfolioPieceSlug) {
    let writingPiece =
      portfolioParams["portfolio-tab"] === "writing"
        ? await getWritingPieceBySlug(portfolioPieceSlug)
        : null;

    if (!writingPiece && !portfolioParams["portfolio-tab"]) {
      writingPiece = await getWritingPieceBySlug(portfolioPieceSlug);
    }

    if (writingPiece) {
      const metaDescription = truncateMetaDescription(
        writingPiece.excerpt || writingPiece.content,
      );
      const canonicalUrl = serializePortfolioSearchParams("/", {
        "portfolio-tab": "writing",
        "portfolio-piece": portfolioPieceSlug,
      });
      const ogImageUrl = buildOgCoverImageUrl(writingPiece.cover_image);

      return {
        title: `${writingPiece.title} - EXOCORPSE Portfolio`,
        description: metaDescription,
        alternates: {
          canonical: canonicalUrl,
        },
        openGraph: {
          type: "article",
          url: canonicalUrl,
          title: `${writingPiece.title} - EXOCORPSE Portfolio`,
          description: metaDescription,
          images: ogImageUrl
            ? [
                {
                  url: ogImageUrl,
                  type: "image/jpeg",
                  width: OG_COVER_TRANSFORM.width,
                  height: OG_COVER_TRANSFORM.height,
                  alt: writingPiece.title,
                },
              ]
            : undefined,
        },
        twitter: {
          card: "summary_large_image",
          title: `${writingPiece.title} - EXOCORPSE Portfolio`,
          description: metaDescription,
          images: ogImageUrl ? [ogImageUrl] : undefined,
        },
      };
    }
  }

  // Check for wiki params
  const params = await loadWikiSearchParams(searchParams);
  const { story, world, character, faction, location } = params;

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
      const metaTitle = `${characterData.name} - ${storyData.title} - EXOCORPSE`;
      const metaDescription = truncateMetaDescription(
        characterData.personality_summary ||
          characterData.backstory ||
          `Character profile for ${characterData.name}`,
      );
      const canonicalUrl = serializeWikiSearchParams("/", {
        story,
        world,
        character,
        faction: null,
      });
      const imagePath =
        characterData.featured_image ||
        characterData.banner_image ||
        characterData.profile_image ||
        (await resolveCharacterOgImage(characterData.id));

      return {
        title: metaTitle,
        description: metaDescription,
        ...buildWikiSocialMetadata({
          title: metaTitle,
          description: metaDescription,
          canonicalUrl,
          imagePathOrUrl: imagePath,
        }),
      };
    }
  }

  // Character view (without world - find character across all worlds in story)
  if (character && !world) {
    const characterData = await getCharacterBySlugInStory(story, character);
    if (characterData) {
      const metaTitle = `${characterData.name} - ${storyData.title} - EXOCORPSE`;
      const metaDescription = truncateMetaDescription(
        characterData.personality_summary ||
          characterData.backstory ||
          `Character profile for ${characterData.name}`,
      );
      const canonicalUrl = serializeWikiSearchParams("/", {
        story,
        world: null,
        character,
        faction: null,
      });
      const imagePath =
        characterData.featured_image ||
        characterData.banner_image ||
        characterData.profile_image ||
        (await resolveCharacterOgImage(characterData.id));

      return {
        title: metaTitle,
        description: metaDescription,
        ...buildWikiSocialMetadata({
          title: metaTitle,
          description: metaDescription,
          canonicalUrl,
          imagePathOrUrl: imagePath,
        }),
      };
    }
  }

  // Faction view without world - resolve canonical metadata before client redirect
  if (faction && !world) {
    const factionData = await getFactionBySlugInStory(story, faction);
    if (factionData) {
      const worldSlug = getFactionWorldSlug(factionData);
      const metaTitle = `${factionData.name} - ${storyData.title} - EXOCORPSE`;
      const metaDescription = truncateMetaDescription(
        factionData.description ||
          factionData.summary ||
          `Faction information for ${factionData.name}`,
      );
      const canonicalUrl = serializeWikiSearchParams("/", {
        story,
        world: worldSlug,
        character: null,
        faction,
      });

      return {
        title: metaTitle,
        description: metaDescription,
        ...buildWikiSocialMetadata({
          title: metaTitle,
          description: metaDescription,
          canonicalUrl,
          imagePathOrUrl: factionData.banner_image || factionData.logo_url,
        }),
      };
    }
  }

  // Faction view
  if (world && faction) {
    const factionData = await getFactionBySlug(story, world, faction);
    if (factionData) {
      const metaTitle = `${factionData.name} - ${storyData.title} - EXOCORPSE`;
      const metaDescription = truncateMetaDescription(
        factionData.description ||
          factionData.summary ||
          `Faction information for ${factionData.name}`,
      );
      const canonicalUrl = serializeWikiSearchParams("/", {
        story,
        world,
        character: null,
        faction,
      });

      return {
        title: metaTitle,
        description: metaDescription,
        ...buildWikiSocialMetadata({
          title: metaTitle,
          description: metaDescription,
          canonicalUrl,
          imagePathOrUrl: factionData.banner_image || factionData.logo_url,
        }),
      };
    }
  }

  // Location view
  if (world && location) {
    const locationData = await getLocationBySlug(story, world, location);
    if (locationData) {
      const metaTitle = `${locationData.name} - ${storyData.title} - EXOCORPSE`;
      const metaDescription = truncateMetaDescription(
        locationData.description ||
          locationData.summary ||
          `Location information for ${locationData.name}`,
      );
      const canonicalUrl = serializeWikiSearchParams("/", {
        story,
        world,
        character: null,
        location,
      });
      const imagePath =
        locationData.banner_image ||
        locationData.image_url ||
        (await resolveLocationOgImage(locationData.id));

      return {
        title: metaTitle,
        description: metaDescription,
        ...buildWikiSocialMetadata({
          title: metaTitle,
          description: metaDescription,
          canonicalUrl,
          imagePathOrUrl: imagePath,
        }),
      };
    }
  }

  // World view
  if (world) {
    const worldData = await getWorldBySlug(story, world);
    if (worldData) {
      const metaTitle = `${worldData.name} - ${storyData.title} - EXOCORPSE`;
      const metaDescription = truncateMetaDescription(
        worldData.description ||
          worldData.summary ||
          `World information for ${worldData.name}`,
      );
      const canonicalUrl = serializeWikiSearchParams("/", {
        story,
        world,
        character: null,
        faction: null,
      });

      return {
        title: metaTitle,
        description: metaDescription,
        ...buildWikiSocialMetadata({
          title: metaTitle,
          description: metaDescription,
          canonicalUrl,
          imagePathOrUrl: worldData.theme_background_image,
        }),
      };
    }
  }

  // Story view
  const metaTitle = `${storyData.title} - EXOCORPSE`;
  const metaDescription = truncateMetaDescription(
    storyData.description ||
      storyData.summary ||
      `Explore the ${storyData.title} story`,
  );
  const canonicalUrl = serializeWikiSearchParams("/", {
    story,
    world: null,
    character: null,
    faction: null,
  });

  return {
    title: metaTitle,
    description: metaDescription,
    ...buildWikiSocialMetadata({
      title: metaTitle,
      description: metaDescription,
      canonicalUrl,
      imagePathOrUrl: storyData.theme_background_image,
    }),
  };
}

async function HomeContent({
  wikiParamsData,
  blogParamsData,
  commissionParamsData,
  portfolioParamsData,
  gameParamsData,
}: {
  wikiParamsData: Awaited<ReturnType<typeof loadWikiSearchParams>>;
  blogParamsData: Awaited<ReturnType<typeof loadBlogSearchParams>>;
  commissionParamsData: Awaited<ReturnType<typeof loadCommissionSearchParams>>;
  portfolioParamsData: Awaited<ReturnType<typeof loadPortfolioSearchParams>>;
  gameParamsData: Awaited<ReturnType<typeof loadGameSearchParams>>;
}) {
  const DEFAULT_PAGE_SIZE = 10;

  const wikiParams = wikiParamsData;
  const blogParams = blogParamsData;
  const commissionParams = commissionParamsData;
  const portfolioParams = portfolioParamsData;
  const gameParams = gameParamsData;
  const initialAboutDataPromise = getAboutPageData();

  // Fetch initial wiki data based on params
  const initialWikiData: InitialWikiData = {
    params: {
      story: wikiParams.story,
      world: wikiParams.world,
    },
    stories: [],
    currentStory: null,
    worlds: [],
    characters: [],
    factions: [],
    locations: [],
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
    // Always fetch only public stories for the stories list
    // Unlisted stories are accessible via URL but won't appear in the list
    const storiesPromise = getPublicStories();

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
    // Fetch the current story being viewed (can be unlisted)
    initialWikiData.currentStory = await getStoryBySlug(wikiParams.story);
    initialWikiData.worlds = await getWorldsByStorySlug(wikiParams.story);

    // Fetch characters, factions, and locations if world is selected
    if (wikiParams.world) {
      const [characters, factions, locations] = await Promise.all([
        getCharactersByWorldSlug(wikiParams.story, wikiParams.world),
        getFactionsByWorldSlug(wikiParams.story, wikiParams.world),
        getLocationsByWorldSlug(wikiParams.story, wikiParams.world),
      ]);
      initialWikiData.characters = characters;
      initialWikiData.factions = factions;
      initialWikiData.locations = locations;

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

      // If a specific location is selected, fetch only that location
      if (wikiParams.location) {
        const selectedLocation = await getLocationBySlug(
          wikiParams.story,
          wikiParams.world,
          wikiParams.location,
        );
        if (selectedLocation) {
          initialWikiData.locations = [selectedLocation];
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

  const initialAboutData: InitialAboutData = await initialAboutDataPromise;

  return (
    <HomeClient
      wikiParams={wikiParams}
      blogParams={blogParams}
      commissionParams={commissionParams}
      portfolioParams={portfolioParams}
      gameParams={gameParams}
      initialWikiData={initialWikiData}
      initialBlogData={initialBlogData}
      initialCommissionData={initialCommissionData}
      initialPortfolioData={initialPortfolioData}
      initialAboutData={initialAboutData}
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
  const gameParamsData = await loadGameSearchParams(searchParams);

  // Pass resolved params to cached component
  return (
    <HomeContent
      wikiParamsData={wikiParamsData}
      blogParamsData={blogParamsData}
      commissionParamsData={commissionParamsData}
      portfolioParamsData={portfolioParamsData}
      gameParamsData={gameParamsData}
    />
  );
}
