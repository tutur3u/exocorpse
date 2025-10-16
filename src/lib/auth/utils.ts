import { getSupabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Get the current authenticated user
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const supabase = await getSupabaseServer();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Verify that the user is authenticated
 * Throws an error if not authenticated
 */
export async function verifyAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error(
      "Unauthorized: You must be logged in to perform this action",
    );
  }

  return user;
}

/**
 * Require authentication for a page
 * Redirects to login if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

/**
 * Check if user is authenticated (for client-side checks)
 */
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}
