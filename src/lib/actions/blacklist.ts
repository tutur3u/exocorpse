"use server";

import { verifyAuth } from "@/lib/auth/utils";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { Tables } from "../../../supabase/types";

export type BlacklistedUser = Tables<"blacklisted_users">;

/**
 * Fetch blacklisted users with pagination
 */
export async function getBlacklistedUsersPaginated(
  page: number = 1,
  pageSize: number = 10,
) {
  const supabase = await getSupabaseServer();

  // Validate and clamp inputs
  const validatedPage = Math.max(1, Math.floor(Number(page) || 1));
  const validatedPageSize = Math.max(
    1,
    Math.min(100, Math.floor(Number(pageSize) || 10)),
  );

  // Get total count
  const { count, error: countError } = await supabase
    .from("blacklisted_users")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("Error counting blacklisted users:", countError);
    return {
      data: [],
      total: 0,
      page: validatedPage,
      pageSize: validatedPageSize,
    };
  }

  // Calculate start position with clamping
  let start = (validatedPage - 1) * validatedPageSize;
  start = Math.max(0, start);

  // Get paginated data with deterministic ordering (latest first)
  const { data, error } = await supabase
    .from("blacklisted_users")
    .select("*")
    .order("timestamp", { ascending: false })
    .order("id", { ascending: false })
    .range(start, start + validatedPageSize - 1);

  if (error) {
    console.error("Error fetching blacklisted users:", error);
    return {
      data: [],
      total: 0,
      page: validatedPage,
      pageSize: validatedPageSize,
    };
  }

  return {
    data: data || [],
    total: count ?? 0,
    page: validatedPage,
    pageSize: validatedPageSize,
  };
}

/**
 * Create a new blacklist entry
 */
export async function addBlacklistedUser(data: {
  username: string;
  reasoning?: string;
}) {
  // Verify authentication
  await verifyAuth();

  const supabase = await getSupabaseServer();

  const { data: result, error } = await supabase
    .from("blacklisted_users")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("Error adding blacklisted user:", error);
    throw error;
  }

  return result;
}

/**
 * Update an existing blacklist entry
 */
export async function updateBlacklistedUser(
  id: string,
  updates: Partial<Pick<BlacklistedUser, "username" | "reasoning">>,
) {
  // Verify authentication
  await verifyAuth();

  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("blacklisted_users")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating blacklisted user:", error);
    throw error;
  }

  return data;
}

/**
 * Delete a blacklist entry
 */
export async function removeBlacklistedUser(id: string) {
  // Verify authentication
  await verifyAuth();

  const supabase = await getSupabaseServer();

  const { error } = await supabase
    .from("blacklisted_users")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error removing blacklisted user:", error);
    throw error;
  }

  return { success: true };
}
