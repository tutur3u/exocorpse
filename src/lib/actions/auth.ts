"use server";

import { getExocorpseAdminLoginPath } from "@/lib/exocorpse-config";
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
  redirect(getExocorpseAdminLoginPath("dashboard"));
}
