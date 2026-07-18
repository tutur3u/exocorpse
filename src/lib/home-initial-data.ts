import "server-only";

import { getAboutPageData } from "@/lib/actions/about";
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
import type { Character } from "@/lib/actions/wiki";
import {
  getCharacterBySlug,
  getCharacterBySlugInStory,
  getCharacterDetailData,
  getCharactersByWorldSlug,
  getFactionsByWorldSlug,
  getLocationBySlug,
  getLocationsByWorldSlug,
  getPublicStories,
  getStoryBySlug,
  getWorldsByStorySlug,
} from "@/lib/actions/wiki";
import type { InitialBlogData } from "@/contexts/InitialBlogDataContext";
import type { InitialCommissionData } from "@/contexts/InitialCommissionDataContext";
import type { InitialPortfolioData } from "@/contexts/InitialPortfolioDataContext";
import type { InitialWikiData } from "@/contexts/InitialWikiDataContext";
import type { BlogSearchParams } from "@/lib/blog-search-params";
import type { CommissionSearchParams } from "@/lib/commission-search-params";
import type { GameSearchParams } from "@/lib/game-search-params";
import type { PortfolioSearchParams } from "@/lib/portfolio-search-params";
import type { WikiSearchParams } from "@/lib/wiki-search-params";

const DEFAULT_PAGE_SIZE = 10;

async function loadInitialBlogData(
  blogParams: BlogSearchParams,
): Promise<InitialBlogData> {
  const rawPageSize = blogParams["blog-page-size"] ?? DEFAULT_PAGE_SIZE;
  const pageSize = Math.max(1, Math.min(rawPageSize, 50));
  const initialData: InitialBlogData = {
    posts: [],
    total: 0,
    page: 1,
    pageSize,
    selectedPost: null,
  };

  const hasBlogParams = !!(
    blogParams["blog-post"] ||
    blogParams["blog-page"] ||
    blogParams["blog-page-size"]
  );
  if (!hasBlogParams) return initialData;

  if (blogParams["blog-post"]) {
    initialData.selectedPost = await getBlogPostBySlug(blogParams["blog-post"]);
    return initialData;
  }

  const page = Math.max(1, blogParams["blog-page"] ?? 1);
  const paginatedData = await getPublishedBlogPostsPaginated(page, pageSize);
  return {
    posts: paginatedData.data,
    total: paginatedData.total,
    page: paginatedData.page,
    pageSize: paginatedData.pageSize,
    selectedPost: null,
  };
}

async function loadInitialCommissionData(
  commissionParams: CommissionSearchParams,
): Promise<InitialCommissionData> {
  const commissionTab = commissionParams["commission-tab"] ?? "info";
  const blacklistPage = commissionParams["blacklist-page"] ?? 1;
  const blacklistPageSize =
    commissionParams["blacklist-page-size"] ?? DEFAULT_PAGE_SIZE;
  const serviceSlug = commissionParams.service;

  const blacklistPromise =
    commissionTab === "blacklist"
      ? getBlacklistedUsersPaginated(blacklistPage, blacklistPageSize)
      : Promise.resolve({
          data: [],
          total: 0,
          page: 1,
          pageSize: DEFAULT_PAGE_SIZE,
        });
  const servicesPromise =
    commissionTab === "services" && !serviceSlug
      ? getActiveServices()
      : Promise.resolve([]);
  const selectedServicePromise = serviceSlug
    ? getServiceBySlug(serviceSlug)
    : Promise.resolve(null);

  const [blacklistData, services, selectedService] = await Promise.all([
    blacklistPromise,
    servicesPromise,
    selectedServicePromise,
  ]);

  return {
    blacklistedUsers: blacklistData.data,
    blacklistTotal: blacklistData.total,
    blacklistPage: blacklistData.page,
    blacklistPageSize: blacklistData.pageSize,
    services,
    selectedService,
    selectedStyleSlug: commissionParams.style,
  };
}

async function loadInitialPortfolioData(
  portfolioParams: PortfolioSearchParams,
): Promise<InitialPortfolioData> {
  const pieceSlug = portfolioParams["portfolio-piece"];
  if (!pieceSlug) {
    if (!portfolioParams["portfolio-tab"]) {
      return {
        artPieces: [],
        writingPieces: [],
        gamePieces: [],
        selectedArtPiece: null,
        selectedWritingPiece: null,
        selectedGamePiece: null,
        params: portfolioParams,
      };
    }

    const [artPieces, writingPieces, gamePieces] = await Promise.all([
      getArtPieces(),
      getWritingPieces(),
      getGamePieces(),
    ]);
    return {
      artPieces,
      writingPieces,
      gamePieces,
      selectedArtPiece: null,
      selectedWritingPiece: null,
      selectedGamePiece: null,
      params: portfolioParams,
    };
  }

  let selectedArtPiece = null;
  let selectedWritingPiece = null;
  let selectedGamePiece = null;
  const selectedTab = portfolioParams["portfolio-tab"];

  if (selectedTab === "art") {
    selectedArtPiece = await getArtPieceBySlug(pieceSlug);
  } else if (selectedTab === "writing") {
    selectedWritingPiece = await getWritingPieceBySlug(pieceSlug);
  } else if (selectedTab === "games") {
    selectedGamePiece = await getGamePieceBySlug(pieceSlug);
  } else {
    [selectedArtPiece, selectedWritingPiece, selectedGamePiece] =
      await Promise.all([
        getArtPieceBySlug(pieceSlug),
        getWritingPieceBySlug(pieceSlug),
        getGamePieceBySlug(pieceSlug),
      ]);
    portfolioParams["portfolio-tab"] = selectedArtPiece
      ? "art"
      : selectedWritingPiece
        ? "writing"
        : selectedGamePiece
          ? "games"
          : null;
  }

  return {
    artPieces: [],
    writingPieces: [],
    gamePieces: [],
    selectedArtPiece,
    selectedWritingPiece,
    selectedGamePiece,
    params: portfolioParams,
  };
}

async function loadInitialWikiData(
  wikiParams: WikiSearchParams,
): Promise<InitialWikiData> {
  const initialData: InitialWikiData = {
    params: { story: wikiParams.story, world: wikiParams.world },
    stories: [],
    currentStory: null,
    worlds: [],
    characters: [],
    factions: [],
    locations: [],
    characterDetail: null,
  };

  const hasWikiParams = !!(
    wikiParams.story ||
    wikiParams.world ||
    wikiParams.character ||
    wikiParams.faction
  );
  if (!hasWikiParams) return initialData;

  if (!wikiParams.story) {
    initialData.stories = await getPublicStories();
    return initialData;
  }

  [initialData.stories, initialData.currentStory, initialData.worlds] =
    await Promise.all([
      getPublicStories(),
      getStoryBySlug(wikiParams.story),
      getWorldsByStorySlug(wikiParams.story),
    ]);

  if (wikiParams.world) {
    const [
      characters,
      factions,
      locations,
      selectedCharacter,
      selectedLocation,
    ] = await Promise.all([
      getCharactersByWorldSlug(wikiParams.story, wikiParams.world),
      getFactionsByWorldSlug(wikiParams.story, wikiParams.world),
      getLocationsByWorldSlug(wikiParams.story, wikiParams.world),
      wikiParams.character
        ? getCharacterBySlug(
            wikiParams.story,
            wikiParams.world,
            wikiParams.character,
          )
        : Promise.resolve(null),
      wikiParams.location
        ? getLocationBySlug(
            wikiParams.story,
            wikiParams.world,
            wikiParams.location,
          )
        : Promise.resolve(null),
    ]);

    initialData.characters = characters;
    initialData.factions = factions;
    initialData.locations = selectedLocation ? [selectedLocation] : locations;

    if (selectedCharacter?.id) {
      initialData.characterDetail = {
        characterId: selectedCharacter.id,
        ...(await getCharacterDetailData(selectedCharacter.id)),
      };
    }
    return initialData;
  }

  if (wikiParams.character) {
    const selectedCharacter = await getCharacterBySlugInStory(
      wikiParams.story,
      wikiParams.character,
    );
    if (selectedCharacter?.id) {
      initialData.characters = [selectedCharacter as Character];
      initialData.characterDetail = {
        characterId: selectedCharacter.id,
        ...(await getCharacterDetailData(selectedCharacter.id)),
      };
    }
  }

  return initialData;
}

export async function loadHomeInitialData({
  wikiParamsData,
  blogParamsData,
  commissionParamsData,
  portfolioParamsData,
  gameParamsData,
}: {
  wikiParamsData: WikiSearchParams;
  blogParamsData: BlogSearchParams;
  commissionParamsData: CommissionSearchParams;
  portfolioParamsData: PortfolioSearchParams;
  gameParamsData: GameSearchParams;
}) {
  const wikiParams = { ...wikiParamsData };
  const blogParams = { ...blogParamsData };
  const commissionParams = { ...commissionParamsData };
  const portfolioParams = { ...portfolioParamsData };
  const gameParams = { ...gameParamsData };

  const [
    initialAboutData,
    initialBlogData,
    initialCommissionData,
    initialPortfolioData,
    initialWikiData,
  ] = await Promise.all([
    getAboutPageData(),
    loadInitialBlogData(blogParams),
    loadInitialCommissionData(commissionParams),
    loadInitialPortfolioData(portfolioParams),
    loadInitialWikiData(wikiParams),
  ]);

  return {
    wikiParams,
    blogParams,
    commissionParams,
    portfolioParams,
    gameParams,
    initialAboutData,
    initialBlogData,
    initialCommissionData,
    initialPortfolioData,
    initialWikiData,
  };
}
