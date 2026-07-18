import HomeClient from "@/components/HomeClient";
import { getBlogPostBySlug } from "@/lib/actions/blog";
import { getWritingPieceBySlug } from "@/lib/actions/portfolio";
import {
  getCharacterBySlug,
  getCharacterBySlugInStory,
  getCharacterGallery,
  getFactionBySlug,
  getFactionBySlugInStory,
  getLocationGallery,
  getLocationBySlug,
  getStoryBySlug,
  getWorldBySlug,
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
import { loadHomeInitialData } from "@/lib/home-initial-data";
import { EXOCORPSE_CMS_CACHE_TAG } from "@/lib/tuturuuu-cms-delivery";
import { toAbsoluteUrl } from "@/lib/site-url";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { Suspense } from "react";

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
  const [gameParams, blogParams, portfolioParams, params] = await Promise.all([
    loadGameSearchParams(searchParams),
    loadBlogSearchParams(searchParams),
    loadPortfolioSearchParams(searchParams),
    loadWikiSearchParams(searchParams),
  ]);

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
  const { story, world, character, faction, location } = params;

  // No wiki params, return default metadata
  if (!story) {
    return {
      title: "EXOCORPSE",
      description:
        "FENRYS & MORRIS - the duo of artist and writer in one vessel.",
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
  "use cache";

  cacheLife({
    stale: 300,
    revalidate: 60,
    expire: 86400,
  });
  cacheTag(EXOCORPSE_CMS_CACHE_TAG);

  const {
    wikiParams,
    blogParams,
    commissionParams,
    portfolioParams,
    gameParams,
    initialWikiData,
    initialBlogData,
    initialCommissionData,
    initialPortfolioData,
    initialAboutData,
  } = await loadHomeInitialData({
    wikiParamsData,
    blogParamsData,
    commissionParamsData,
    portfolioParamsData,
    gameParamsData,
  });

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
  return (
    <Suspense
      fallback={
        <main
          aria-busy="true"
          aria-label="Loading EXOCORPSE"
          className="min-h-dvh bg-[#020817]"
        />
      }
    >
      <HomeContentWrapper searchParams={searchParams} />
    </Suspense>
  );
}

async function HomeContentWrapper({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Await searchParams inside Suspense boundary
  const [
    wikiParamsData,
    blogParamsData,
    commissionParamsData,
    portfolioParamsData,
    gameParamsData,
  ] = await Promise.all([
    loadWikiSearchParams(searchParams),
    loadBlogSearchParams(searchParams),
    loadCommissionSearchParams(searchParams),
    loadPortfolioSearchParams(searchParams),
    loadGameSearchParams(searchParams),
  ]);

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
