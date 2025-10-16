"use server";

import { getSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Login with email and password
 */
export async function login(email: string, password: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Login failed" };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Logout the current user
 */
export async function logout() {
  const supabase = await getSupabaseServer();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error logging out:", error);
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/login");
}
