/**
 * Server-side and client-side utilities for commission search params
 * Used for shallow routing and SEO metadata generation
 */

import {
  createLoader,
  createSerializer,
  parseAsInteger,
  parseAsStringLiteral,
  type UrlKeys,
} from "nuqs/server";

// Define the search params structure for commission navigation
export const commissionSearchParams = {
  "commission-tab": parseAsStringLiteral([
    "info",
    "pricing",
    "tos",
    "blacklist",
  ] as const),
  "blacklist-page": parseAsInteger,
  "blacklist-page-size": parseAsInteger,
};

// Define URL keys mapping (query param names)
export const commissionUrlKeys: UrlKeys<typeof commissionSearchParams> = {
  "commission-tab": "commission-tab",
  "blacklist-page": "blacklist-page",
  "blacklist-page-size": "blacklist-page-size",
};

// Server-side loader for loading search params
export const loadCommissionSearchParams = createLoader(commissionSearchParams, {
  urlKeys: commissionUrlKeys,
});

// Server-side serializer for creating canonical URLs
export const serializeCommissionSearchParams = createSerializer(
  commissionSearchParams,
  {
    urlKeys: commissionUrlKeys,
  },
);

// Type for the parsed search params
export type CommissionSearchParams = {
  "commission-tab": "info" | "pricing" | "tos" | "blacklist" | null;
  "blacklist-page": number | null;
  "blacklist-page-size": number | null;
};
