"use server";

import { verifyAuth } from "@/lib/auth/utils";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { Tables } from "../../../supabase/types";

export type BlogPost = Tables<"blog_posts">;

/**
 * Fetch all published blog posts (posts with published_at in the past or present)
 */
export async function getPublishedBlogPosts() {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .lte("published_at", new Date().toISOString())
    .not("published_at", "is", null)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching published blog posts:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetch published blog posts with pagination
 */
export async function getPublishedBlogPostsPaginated(
  page: number = 1,
  pageSize: number = 10,
) {
  const supabase = await getSupabaseServer();

  // Get total count
  const { count, error: countError } = await supabase
    .from("blog_posts")
    .select("*", { count: "exact", head: true })
    .lte("published_at", new Date().toISOString())
    .not("published_at", "is", null);

  if (countError) {
    console.error("Error counting published blog posts:", countError);
    return { data: [], total: 0, page, pageSize };
  }

  // Get paginated data
  const start = (page - 1) * pageSize;
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .lte("published_at", new Date().toISOString())
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .range(start, start + pageSize - 1);

  if (error) {
    console.error("Error fetching published blog posts:", error);
    return { data: [], total: 0, page, pageSize };
  }

  return {
    data: data || [],
    total: count || 0,
    page,
    pageSize,
  };
}

/**
 * Fetch all blog posts (admin use - includes drafts and scheduled posts)
 */
export async function getAllBlogPosts() {
  // Verify authentication and get supabase client
  const { supabase } = await verifyAuth();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all blog posts:", error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch all blog posts with pagination (admin use - includes drafts and scheduled posts)
 */
export async function getAllBlogPostsPaginated(
  page: number = 1,
  pageSize: number = 9,
) {
  // Verify authentication and get supabase client
  const { supabase } = await verifyAuth();

  // Get total count
  const { count, error: countError } = await supabase
    .from("blog_posts")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("Error counting blog posts:", countError);
    return { data: [], total: 0, page, pageSize };
  }

  // Get paginated data
  const start = (page - 1) * pageSize;
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .range(start, start + pageSize - 1);

  if (error) {
    console.error("Error fetching blog posts:", error);
    throw error;
  }

  return {
    data: data || [],
    total: count || 0,
    page,
    pageSize,
  };
}

/**
 * Fetch a blog post by slug
 */
export async function getBlogPostBySlug(slug: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .lte("published_at", new Date().toISOString())
    .not("published_at", "is", null)
    .single();

  if (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }

  return data;
}

/**
 * Fetch a blog post by ID (admin use - includes drafts)
 */
export async function getBlogPostById(id: string) {
  // Verify authentication and get supabase client
  const { supabase } = await verifyAuth();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }

  return data;
}

/**
 * Create a new blog post
 */
export async function createBlogPost(post: {
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  published_at?: string | null;
}) {
  // Verify authentication and get supabase client
  const { supabase } = await verifyAuth();

  const { data, error } = await supabase
    .from("blog_posts")
    .insert(post)
    .select()
    .single();

  if (error) {
    console.error("Error creating blog post:", error);
    throw error;
  }

  return data;
}

/**
 * Update an existing blog post
 */
export async function updateBlogPost(
  id: string,
  updates: Partial<Omit<BlogPost, "id" | "created_at" | "updated_at">>,
) {
  // Verify authentication and get supabase client
  const { supabase } = await verifyAuth();

  const { data, error } = await supabase
    .from("blog_posts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating blog post:", error);
    throw error;
  }

  return data;
}

/**
 * Delete a blog post
 */
export async function deleteBlogPost(id: string) {
  // Verify authentication and get supabase client
  const { supabase } = await verifyAuth();

  const { error } = await supabase.from("blog_posts").delete().eq("id", id);

  if (error) {
    console.error("Error deleting blog post:", error);
    throw error;
  }
}
