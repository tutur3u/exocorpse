/**
 * Server-side and client-side utilities for portfolio search params
 * Used for shallow routing and SEO metadata generation
 */

import {
  createLoader,
  createSerializer,
  parseAsString,
  parseAsStringLiteral,
  type UrlKeys,
} from "nuqs/server";

// Define the search params structure for portfolio navigation
export const portfolioSearchParams = {
  "portfolio-tab": parseAsStringLiteral(["art", "writing", "games"] as const),
  "portfolio-piece": parseAsString,
};

// Define URL keys mapping (query param names)
export const portfolioUrlKeys: UrlKeys<typeof portfolioSearchParams> = {
  "portfolio-tab": "portfolio-tab",
  "portfolio-piece": "portfolio-piece",
};

// Server-side loader for loading search params
export const loadPortfolioSearchParams = createLoader(portfolioSearchParams, {
  urlKeys: portfolioUrlKeys,
});

// Server-side serializer for creating canonical URLs
export const serializePortfolioSearchParams = createSerializer(
  portfolioSearchParams,
  {
    urlKeys: portfolioUrlKeys,
  },
);

// Type for the parsed search params
export type PortfolioSearchParams = {
  "portfolio-tab": "art" | "writing" | "games" | null;
  "portfolio-piece": string | null;
};
