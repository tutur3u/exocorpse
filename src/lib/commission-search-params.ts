/**
 * Server-side and client-side utilities for commission search params
 * Used for shallow routing and SEO metadata generation
 */

import {
  createLoader,
  createSerializer,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  type UrlKeys,
} from "nuqs/server";

// Define the search params structure for commission navigation
export const commissionSearchParams = {
  "commission-tab": parseAsStringLiteral([
    "info",
    "services",
    "tos",
    "blacklist",
  ] as const),
  "blacklist-page": parseAsInteger,
  "blacklist-page-size": parseAsInteger,
  service: parseAsString, // slug of the selected service
  style: parseAsString, // slug of the selected style within a service
};

// Define URL keys mapping (query param names)
export const commissionUrlKeys: UrlKeys<typeof commissionSearchParams> = {
  "commission-tab": "commission-tab",
  "blacklist-page": "blacklist-page",
  "blacklist-page-size": "blacklist-page-size",
  service: "service",
  style: "style",
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
  "commission-tab": "info" | "services" | "tos" | "blacklist" | null;
  "blacklist-page": number | null;
  "blacklist-page-size": number | null;
  service: string | null;
  style: string | null;
};
