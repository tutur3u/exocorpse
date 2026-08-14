import { getExocorpseAdminLoginPath } from "@/lib/exocorpse-config";
import { getExocorpseSessionFromCookies } from "@/lib/exocorpse-session";
import { redirect } from "next/navigation";

/**
 * Get the current authenticated user
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getExocorpseSessionFromCookies();
  return session?.user ?? null;
}

/**
 * Verify that the user is authenticated through Tuturuuu CMS.
 * Throws an error if not authenticated
 */
export async function verifyAuth() {
  const session = await getExocorpseSessionFromCookies();

  if (!session) {
    throw new Error(
      "Unauthorized: You must connect through Tuturuuu Auth to perform this action",
    );
  }

  return { session, user: session.user };
}

/**
 * Require authentication for a page
 * Redirects to login if not authenticated
 */
export async function requireAuth() {
  const session = await getExocorpseSessionFromCookies();

  if (!session) {
    redirect(getExocorpseAdminLoginPath("dashboard"));
  }

  return session.user;
}

export async function requireAdminSession() {
  const session = await getExocorpseSessionFromCookies();
  if (!session) redirect(getExocorpseAdminLoginPath("dashboard"));
  return session;
}
