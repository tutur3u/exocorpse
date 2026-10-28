"use server";

import { getExocorpseAdminLoginPath } from "@/lib/exocorpse-config";
import { cookies } from "next/headers";
import { EXOCORPSE_SESSION_COOKIE } from "@/lib/exocorpse-session";
import { redirect } from "next/navigation";

/**
 * Login with email and password
 */
export async function login(email: string, password: string) {
  void email;
  void password;
  return {
    error: "Local Exocorpse password login has been replaced by Tuturuuu Auth.",
  };
}

/**
 * Logout the current user
 */
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.set(EXOCORPSE_SESSION_COOKIE, "", {
    expires: new Date(0),
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  redirect(getExocorpseAdminLoginPath("dashboard"));
}
