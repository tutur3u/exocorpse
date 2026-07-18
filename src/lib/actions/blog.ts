"use server";

import {
  getCmsBlogPostBySlug,
  getCmsPublishedBlogPosts,
  getCmsPublishedBlogPostsPaginated,
} from "@/lib/tuturuuu-cms-delivery";
import type { BlogPost } from "@/types/exocorpse-content";

export type { BlogPost };

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  return (await getCmsPublishedBlogPosts()) ?? [];
}

export async function getPublishedBlogPostsPaginated(page = 1, pageSize = 10) {
  return (
    (await getCmsPublishedBlogPostsPaginated(page, pageSize)) ?? {
      data: [],
      page,
      pageSize,
      total: 0,
    }
  );
}

export async function getBlogPostBySlug(slug: string) {
  return getCmsBlogPostBySlug(slug);
}
