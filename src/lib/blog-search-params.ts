/**
 * Server-side and client-side utilities for blog search params
 * Used for shallow routing and SEO metadata generation
 */

import {
  createLoader,
  createSerializer,
  parseAsInteger,
  parseAsString,
  type UrlKeys,
} from "nuqs/server";

// Define the search params structure for blog navigation
export const blogSearchParams = {
  "blog-post": parseAsString,
  "blog-page": parseAsInteger,
  "blog-page-size": parseAsInteger,
};

// Define URL keys mapping (query param names)
export const blogUrlKeys: UrlKeys<typeof blogSearchParams> = {
  "blog-post": "blog-post",
  "blog-page": "blog-page",
  "blog-page-size": "blog-page-size",
};

// Server-side loader for loading search params
export const loadBlogSearchParams = createLoader(blogSearchParams, {
  urlKeys: blogUrlKeys,
});

// Server-side serializer for creating canonical URLs
export const serializeBlogSearchParams = createSerializer(blogSearchParams, {
  urlKeys: blogUrlKeys,
});

// Type for the parsed search params
export type BlogSearchParams = {
  "blog-post": string | null;
  "blog-page": number | null;
  "blog-page-size": number | null;
};
