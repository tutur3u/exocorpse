/**
 * Server-side and client-side utilities for wiki search params
 * Used for shallow routing and SEO metadata generation
 */

import {
  createLoader,
  createSerializer,
  parseAsString,
  type UrlKeys,
} from "nuqs/server";

// Define the search params structure for wiki navigation
export const wikiSearchParams = {
  story: parseAsString,
  world: parseAsString,
  character: parseAsString,
  faction: parseAsString,
};

// Define URL keys mapping (query param names)
export const wikiUrlKeys: UrlKeys<typeof wikiSearchParams> = {
  story: "story",
  world: "world",
  character: "character",
  faction: "faction",
};

// Server-side loader for loading search params
export const loadWikiSearchParams = createLoader(wikiSearchParams, {
  urlKeys: wikiUrlKeys,
});

// Server-side serializer for creating canonical URLs
export const serializeWikiSearchParams = createSerializer(wikiSearchParams, {
  urlKeys: wikiUrlKeys,
});

// Type for the parsed search params
export type WikiSearchParams = {
  story: string | null;
  world: string | null;
  character: string | null;
  faction: string | null;
};
