"use server";

import { verifyAuth } from "@/lib/auth/utils";
import { getSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Tables } from "../../../supabase/types";

// ============================================================================
// TYPES
// ============================================================================

export type Service = Tables<"services">;
export type Addon = Tables<"addons">;
export type Style = Tables<"styles">;
export type Picture = Tables<"pictures">;
export type ServiceAddon = Tables<"service_addons">;

// Extended types with relations
export type ServiceWithDetails = Service & {
  addons?: Addon[];
  styles?: (Style & { pictures?: Picture[] })[];
};

export type StyleWithPictures = Style & {
  pictures?: Picture[];
};

// ============================================================================
// SERVICES - READ OPERATIONS
// ============================================================================

/**
 * Get all services
 */
export async function getAllServices() {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching services:", error);
    return [];
  }

  return data || [];
}

/**
 * Get a single service by ID with all related data
 */
export async function getServiceById(serviceId: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("services")
    .select(
      `
      *,
      service_addons (
        addon_id,
        addon_is_exclusive,
        addons (*)
      ),
      styles (
        *,
        pictures (*)
      ),
      pictures (*)
    `,
    )
    .eq("service_id", serviceId)
    .single();

  if (error) {
    console.error("Error fetching service:", error);
    return null;
  }

  return data;
}

/**
 * Get a service by slug
 */
export async function getServiceBySlug(slug: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("services")
    .select(
      `
      *,
      service_addons (
        addon_id,
        addon_is_exclusive,
        addons (*)
      ),
      styles (
        *,
        pictures (*)
      ),
      pictures (*)
    `,
    )
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching service by slug:", error);
    return null;
  }

  return data;
}

/**
 * Get active services (for public display)
 */
export async function getActiveServices() {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("services")
    .select(
      `
      *,
      styles (
        *,
        pictures (*)
      ),
      pictures (*)
    `,
    )
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching active services:", error);
    return [];
  }

  return data || [];
}

// ============================================================================
// SERVICES - WRITE OPERATIONS
// ============================================================================

/**
 * Create a new service
 */
export async function createService(service: {
  name: string;
  slug: string;
  description?: string;
  base_price: number;
  is_active?: boolean;
  comm_link?: string;
}) {
  const { supabase } = await verifyAuth();

  const { data, error } = await supabase
    .from("services")
    .insert(service)
    .select()
    .single();

  if (error) {
    console.error("Error creating service:", error);
    throw error;
  }

  revalidatePath("/admin/services");
  return data;
}

/**
 * Update an existing service
 */
export async function updateService(
  serviceId: string,
  updates: Partial<Omit<Service, "service_id" | "created_at">>,
) {
  const { supabase } = await verifyAuth();

  const { data, error } = await supabase
    .from("services")
    .update(updates)
    .eq("service_id", serviceId)
    .select()
    .single();

  if (error) {
    console.error("Error updating service:", error);
    throw error;
  }

  revalidatePath("/admin/services");
  return data;
}

/**
 * Delete a service
 */
export async function deleteService(serviceId: string) {
  const { supabase } = await verifyAuth();

  const { error } = await supabase
    .from("services")
    .delete()
    .eq("service_id", serviceId);

  if (error) {
    console.error("Error deleting service:", error);
    throw error;
  }

  revalidatePath("/admin/services");
}

// ============================================================================
// ADDONS - READ OPERATIONS
// ============================================================================

/**
 * Get all addons
 */
export async function getAllAddons() {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("addons")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching addons:", error);
    return [];
  }

  return data || [];
}

/**
 * Get addon by ID
 */
export async function getAddonById(addonId: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("addons")
    .select("*")
    .eq("addon_id", addonId)
    .single();

  if (error) {
    console.error("Error fetching addon:", error);
    return null;
  }

  return data;
}

/**
 * Get addons for a specific service
 */
export async function getAddonsForService(serviceId: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("service_addons")
    .select(
      `
      addon_id,
      addon_is_exclusive,
      addons (*)
    `,
    )
    .eq("service_id", serviceId);

  if (error) {
    console.error("Error fetching service addons:", error);
    return [];
  }

  return data || [];
}

/**
 * Get exclusive addons and which services they're linked to
 */
export async function getExclusiveAddonServices() {
  const supabase = await getSupabaseServer();

  // Get all exclusive addons and their service links
  const { data, error } = await supabase
    .from("service_addons")
    .select(
      `
      addon_id,
      service_id,
      addons (addon_id, is_exclusive)
    `,
    )
    .eq("addons.is_exclusive", true);

  if (error) {
    console.error("Error fetching exclusive addon services:", error);
    return {};
  }

  // Create a map of addon_id -> service_id for exclusive addons
  const exclusiveMap: Record<string, string> = {};
  data?.forEach((item: any) => {
    if (item.addons?.is_exclusive) {
      exclusiveMap[item.addon_id] = item.service_id;
    }
  });

  return exclusiveMap;
}

// ============================================================================
// ADDONS - WRITE OPERATIONS
// ============================================================================

/**
 * Create a new addon
 */
export async function createAddon(addon: {
  name: string;
  description?: string;
  price_impact: number;
  is_exclusive?: boolean;
}) {
  const { supabase } = await verifyAuth();

  const { data, error } = await supabase
    .from("addons")
    .insert(addon)
    .select()
    .single();

  if (error) {
    console.error("Error creating addon:", error);
    throw error;
  }

  revalidatePath("/admin/addons");
  return data;
}

/**
 * Update an existing addon
 */
export async function updateAddon(
  addonId: string,
  updates: Partial<Omit<Addon, "addon_id">>,
) {
  const { supabase } = await verifyAuth();

  const { data, error } = await supabase
    .from("addons")
    .update(updates)
    .eq("addon_id", addonId)
    .select()
    .single();

  if (error) {
    console.error("Error updating addon:", error);
    throw error;
  }

  revalidatePath("/admin/addons");
  return data;
}

/**
 * Delete an addon
 */
export async function deleteAddon(addonId: string) {
  const { supabase } = await verifyAuth();

  const { error } = await supabase
    .from("addons")
    .delete()
    .eq("addon_id", addonId);

  if (error) {
    console.error("Error deleting addon:", error);
    throw error;
  }

  revalidatePath("/admin/addons");
}

// ============================================================================
// SERVICE_ADDONS - JUNCTION TABLE OPERATIONS
// ============================================================================

/**
 * Link an addon to a service
 */
export async function linkAddonToService(serviceId: string, addonId: string) {
  const { supabase } = await verifyAuth();

  // The trigger will automatically set addon_is_exclusive
  const { data, error } = await supabase
    .from("service_addons")
    .insert({
      service_id: serviceId,
      addon_id: addonId,
      addon_is_exclusive: false, // This will be overwritten by trigger
    })
    .select()
    .single();

  if (error) {
    console.error("Error linking addon to service:", error);
    throw error;
  }

  revalidatePath("/admin/services");
  return data;
}

/**
 * Unlink an addon from a service
 */
export async function unlinkAddonFromService(
  serviceId: string,
  addonId: string,
) {
  const { supabase } = await verifyAuth();

  const { error } = await supabase
    .from("service_addons")
    .delete()
    .eq("service_id", serviceId)
    .eq("addon_id", addonId);

  if (error) {
    console.error("Error unlinking addon from service:", error);
    throw error;
  }

  revalidatePath("/admin/services");
}

/**
 * Set addons for a service (replaces all existing links)
 */
export async function setServiceAddons(serviceId: string, addonIds: string[]) {
  const { supabase } = await verifyAuth();

  // First, remove all existing links
  await supabase.from("service_addons").delete().eq("service_id", serviceId);

  // Then, add new links
  if (addonIds.length > 0) {
    const { error } = await supabase.from("service_addons").insert(
      addonIds.map((addonId) => ({
        service_id: serviceId,
        addon_id: addonId,
        addon_is_exclusive: false, // Will be set by trigger
      })),
    );

    if (error) {
      console.error("Error setting service addons:", error);
      throw error;
    }
  }

  revalidatePath("/admin/services");
}

// ============================================================================
// STYLES - READ OPERATIONS
// ============================================================================

/**
 * Get all styles for a service
 */
export async function getStylesForService(serviceId: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("styles")
    .select(
      `
      *,
      pictures (*)
    `,
    )
    .eq("service_id", serviceId)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching styles:", error);
    return [];
  }

  return data || [];
}

/**
 * Get a single style by ID
 */
export async function getStyleById(styleId: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("styles")
    .select(
      `
      *,
      pictures (*)
    `,
    )
    .eq("style_id", styleId)
    .single();

  if (error) {
    console.error("Error fetching style:", error);
    return null;
  }

  return data;
}

// ============================================================================
// STYLES - WRITE OPERATIONS
// ============================================================================

/**
 * Create a new style
 */
export async function createStyle(style: {
  service_id: string;
  name: string;
  description?: string;
}) {
  const { supabase } = await verifyAuth();

  const { data, error } = await supabase
    .from("styles")
    .insert(style)
    .select()
    .single();

  if (error) {
    console.error("Error creating style:", error);
    throw error;
  }

  revalidatePath("/admin/services");
  return data;
}

/**
 * Update an existing style
 */
export async function updateStyle(
  styleId: string,
  updates: Partial<Omit<Style, "style_id" | "service_id">>,
) {
  const { supabase } = await verifyAuth();

  const { data, error } = await supabase
    .from("styles")
    .update(updates)
    .eq("style_id", styleId)
    .select()
    .single();

  if (error) {
    console.error("Error updating style:", error);
    throw error;
  }

  revalidatePath("/admin/services");
  return data;
}

/**
 * Delete a style
 */
export async function deleteStyle(styleId: string) {
  const { supabase } = await verifyAuth();

  const { error } = await supabase
    .from("styles")
    .delete()
    .eq("style_id", styleId);

  if (error) {
    console.error("Error deleting style:", error);
    throw error;
  }

  revalidatePath("/admin/services");
}

// ============================================================================
// PICTURES - READ OPERATIONS
// ============================================================================

/**
 * Get all pictures for a style
 */
export async function getPicturesForStyle(styleId: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("pictures")
    .select("*")
    .eq("style_id", styleId)
    .order("uploaded_at", { ascending: false });

  if (error) {
    console.error("Error fetching pictures:", error);
    return [];
  }

  return data || [];
}

/**
 * Get all pictures for a service (not tied to a specific style)
 */
export async function getPicturesForService(serviceId: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("pictures")
    .select("*")
    .eq("service_id", serviceId)
    .is("style_id", null)
    .order("uploaded_at", { ascending: false });

  if (error) {
    console.error("Error fetching service pictures:", error);
    return [];
  }

  return data || [];
}

/**
 * Get a single picture by ID
 */
export async function getPictureById(pictureId: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("pictures")
    .select("*")
    .eq("picture_id", pictureId)
    .single();

  if (error) {
    console.error("Error fetching picture:", error);
    return null;
  }

  return data;
}

// ============================================================================
// PICTURES - WRITE OPERATIONS
// ============================================================================

/**
 * Create a new picture
 */
export async function createPicture(picture: {
  service_id: string;
  style_id?: string | null;
  image_url: string;
  caption?: string;
  is_primary_example?: boolean;
}) {
  const { supabase } = await verifyAuth();

  const { data, error } = await supabase
    .from("pictures")
    .insert(picture)
    .select()
    .single();

  if (error) {
    console.error("Error creating picture:", error);
    throw error;
  }

  revalidatePath("/admin/services");
  return data;
}

/**
 * Update an existing picture
 */
export async function updatePicture(
  pictureId: string,
  updates: Partial<
    Omit<Picture, "picture_id" | "service_id" | "style_id" | "uploaded_at">
  >,
) {
  const { supabase } = await verifyAuth();

  const { data, error } = await supabase
    .from("pictures")
    .update(updates)
    .eq("picture_id", pictureId)
    .select()
    .single();

  if (error) {
    console.error("Error updating picture:", error);
    throw error;
  }

  revalidatePath("/admin/services");
  return data;
}

/**
 * Delete a picture
 */
export async function deletePicture(pictureId: string) {
  const { supabase } = await verifyAuth();

  const { error } = await supabase
    .from("pictures")
    .delete()
    .eq("picture_id", pictureId);

  if (error) {
    console.error("Error deleting picture:", error);
    throw error;
  }

  revalidatePath("/admin/services");
}

/**
 * Set primary example picture for a style
 */
export async function setPrimaryPicture(styleId: string, pictureId: string) {
  const { supabase } = await verifyAuth();

  // First, unset all primary flags for this style
  await supabase
    .from("pictures")
    .update({ is_primary_example: false })
    .eq("style_id", styleId);

  // Then set the new primary
  const { data, error } = await supabase
    .from("pictures")
    .update({ is_primary_example: true })
    .eq("picture_id", pictureId)
    .select()
    .single();

  if (error) {
    console.error("Error setting primary picture:", error);
    throw error;
  }

  revalidatePath("/admin/services");
  return data;
}
