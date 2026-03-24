"use server";

import { verifyAuth } from "@/lib/auth/utils";
import { DEFAULT_ABOUT_SETTINGS, type AboutPageData } from "@/lib/about";
import { getSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { TablesInsert, TablesUpdate } from "../../../supabase/types";

async function fetchAboutData(authenticated: boolean): Promise<AboutPageData> {
  const supabase = authenticated
    ? (await verifyAuth()).supabase
    : await getSupabaseServer();

  const [settingsResult, faqsResult, itemsResult] = await Promise.all([
    supabase.from("about_page_settings").select("*").eq("id", 1).maybeSingle(),
    supabase
      .from("about_faqs")
      .select("*")
      .order("display_order", { ascending: true })
      .order("question", { ascending: true }),
    supabase
      .from("about_content_items")
      .select("*")
      .order("section", { ascending: true })
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  if (settingsResult.error) {
    console.error("Error fetching about page settings:", settingsResult.error);
    throw settingsResult.error;
  }

  if (faqsResult.error) {
    console.error("Error fetching about FAQs:", faqsResult.error);
    throw faqsResult.error;
  }

  if (itemsResult.error) {
    console.error("Error fetching about content items:", itemsResult.error);
    throw itemsResult.error;
  }

  return {
    settings: settingsResult.data ?? DEFAULT_ABOUT_SETTINGS,
    faqs: faqsResult.data ?? [],
    items: itemsResult.data ?? [],
  };
}

function revalidateAboutPaths() {
  revalidatePath("/");
  revalidatePath("/admin/about");
}

export async function getAboutPageData(): Promise<AboutPageData> {
  return fetchAboutData(false);
}

export async function getAboutAdminData(): Promise<AboutPageData> {
  return fetchAboutData(true);
}

export async function updateAboutPageSettings(
  updates: Partial<TablesUpdate<"about_page_settings">>,
) {
  const { supabase } = await verifyAuth();

  const payload: TablesInsert<"about_page_settings"> = {
    id: 1,
    ...updates,
  };

  const { data, error } = await supabase
    .from("about_page_settings")
    .upsert(payload, {
      onConflict: "id",
    })
    .select("*")
    .single();

  if (error) {
    console.error("Error updating about page settings:", error);
    throw error;
  }

  revalidateAboutPaths();
  return data;
}

export async function updateAboutFaq(
  id: string,
  updates: Partial<TablesUpdate<"about_faqs">>,
) {
  const { supabase } = await verifyAuth();

  const { data, error } = await supabase
    .from("about_faqs")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Error updating about FAQ:", error);
    throw error;
  }

  revalidateAboutPaths();
  return data;
}

export async function createAboutContentItem(
  item: TablesInsert<"about_content_items">,
) {
  const { supabase } = await verifyAuth();

  const { data, error } = await supabase
    .from("about_content_items")
    .insert(item)
    .select("*")
    .single();

  if (error) {
    console.error("Error creating about content item:", error);
    throw error;
  }

  revalidateAboutPaths();
  return data;
}

export async function updateAboutContentItem(
  id: string,
  updates: Partial<TablesUpdate<"about_content_items">>,
) {
  const { supabase } = await verifyAuth();

  const { data, error } = await supabase
    .from("about_content_items")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Error updating about content item:", error);
    throw error;
  }

  revalidateAboutPaths();
  return data;
}

export async function deleteAboutContentItem(id: string) {
  const { supabase } = await verifyAuth();

  const { error } = await supabase
    .from("about_content_items")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting about content item:", error);
    throw error;
  }

  revalidateAboutPaths();
  return { success: true };
}
