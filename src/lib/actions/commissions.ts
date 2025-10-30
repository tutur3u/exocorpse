"use server";

import { verifyAuth } from "@/lib/auth/utils";
import { getSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "../../../supabase/types";

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
  pictures?: Picture[];
  service_addons?: (ServiceAddon & { addons?: Addon })[];
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
 * Get all services with full details (pictures, styles, addons)
 * This is useful for displaying service listings with images
 * Note: Service-level pictures (not tied to styles) can be fetched separately using getPicturesForService()
 */
export async function getAllServicesWithDetails() {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("services")
    .select(
      `
      *,
      service_addons (
        service_id,
        addon_id,
        addon_is_exclusive,
        addons (*)
      ),
      styles (
        *,
        pictures (*)
      )
    `,
    )
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching services with details:", error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Fetch all service-level pictures in a single batched query
  const serviceIds = data.map((service) => service.service_id);
  const picturesByService = await getPicturesForServices(serviceIds);

  // Merge pictures into each service
  const servicesWithPictures = data.map((service) => ({
    ...service,
    pictures: picturesByService[service.service_id] || [],
  }));

  return servicesWithPictures;
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
        service_id,
        addon_id,
        addon_is_exclusive,
        addons (*)
      ),
      styles (
        *,
        pictures (*)
      )
    `,
    )
    .eq("service_id", serviceId)
    .single();

  if (error) {
    console.error("Error fetching service:", error);
    return null;
  }

  // Fetch service-level pictures separately (where style_id IS NULL)
  const servicePictures = await getPicturesForService(serviceId);

  return {
    ...data,
    pictures: servicePictures,
  };
}

/**
 * Get a service by slug
 */
export async function getServiceBySlug(
  slug: string,
): Promise<ServiceWithDetails | null> {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("services")
    .select(
      `
      *,
      service_addons (
        service_id,
        addon_id,
        addon_is_exclusive,
        addons (*)
      ),
      styles (
        *,
        pictures (*)
      )
    `,
    )
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching service by slug:", error);
    return null;
  }

  // Fetch service-level pictures separately (where style_id IS NULL)
  const servicePictures = await getPicturesForService(data.service_id);

  return {
    ...data,
    pictures: servicePictures,
  } as ServiceWithDetails;
}

/**
 * Get active services (for public display)
 */
export async function getActiveServices(): Promise<ServiceWithDetails[]> {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("services")
    .select(
      `
      *,
      service_addons (
        service_id,
        addon_id,
        addon_is_exclusive,
        addons (*)
      ),
      styles (
        *,
        pictures (*)
      )
    `,
    )
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching active services:", error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Fetch all service-level pictures in a single batched query
  const serviceIds = data.map((service) => service.service_id);
  const picturesByService = await getPicturesForServices(serviceIds);

  // Merge pictures into each service
  const servicesWithPictures = data.map((service) => ({
    ...service,
    pictures: picturesByService[service.service_id] || [],
  }));

  return servicesWithPictures as ServiceWithDetails[];
}

// ============================================================================
// SERVICES - WRITE OPERATIONS
// ============================================================================

/**
 * Create a new service
 */
export async function createService(
  service: Pick<
    TablesInsert<"services">,
    "name" | "slug" | "description" | "base_price" | "is_active" | "comm_link"
  >,
) {
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
  updates: Omit<TablesUpdate<"services">, "service_id" | "created_at">,
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

  // First, get all pictures associated with this service (including style pictures)
  // This includes both service-level pictures and style-level pictures
  const { data: pictures } = await supabase
    .from("pictures")
    .select("image_url")
    .eq("service_id", serviceId);

  // Delete the service (this will cascade delete all styles, pictures, and service_addons)
  const { error } = await supabase
    .from("services")
    .delete()
    .eq("service_id", serviceId);

  if (error) {
    console.error("Error deleting service:", error);
    throw error;
  }

  // Clean up storage images asynchronously (fire and forget)
  if (pictures && pictures.length > 0) {
    (async () => {
      try {
        const { deleteFile } = await import("./storage");
        for (const picture of pictures) {
          const imageUrl = picture.image_url;
          // Only delete if it's a storage path (not an external URL)
          if (imageUrl && !imageUrl.startsWith("http")) {
            await deleteFile(imageUrl);
          }
        }
      } catch (imgError) {
        console.error("Error deleting service pictures:", imgError);
        // Fire and forget - errors are logged but don't affect the response
      }
    })();
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
export async function createAddon(
  addon: Pick<
    TablesInsert<"addons">,
    "name" | "description" | "price_impact" | "is_exclusive" | "percentage"
  >,
) {
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
  updates: Omit<TablesUpdate<"addons">, "addon_id">,
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

  // Call the atomic RPC function to replace service addons
  const { data, error } = await supabase.rpc("replace_service_addons", {
    p_service: serviceId,
    p_addons: addonIds,
  });

  if (error) {
    console.error("Error calling replace_service_addons RPC:", error);
    throw error;
  }

  // Check the result from the RPC function
  const result = data as {
    success: boolean;
    message?: string;
    error?: string;
    deleted_count?: number;
    inserted_count?: number;
  };
  if (result && !result.success) {
    console.error("Error replacing service addons:", result);
    throw new Error(result.message || "Failed to replace service addons");
  }

  revalidatePath("/admin/services");
  return result;
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
export async function createStyle(
  style: Pick<
    TablesInsert<"styles">,
    "service_id" | "name" | "slug" | "description"
  >,
) {
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
  updates: Omit<TablesUpdate<"styles">, "style_id" | "service_id">,
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

  // First, get all pictures associated with this style to delete their storage files
  const { data: pictures } = await supabase
    .from("pictures")
    .select("image_url")
    .eq("style_id", styleId);

  // Delete the style (this will cascade delete all associated pictures)
  const { error } = await supabase
    .from("styles")
    .delete()
    .eq("style_id", styleId);

  if (error) {
    console.error("Error deleting style:", error);
    throw error;
  }

  // Clean up storage images asynchronously (fire and forget)
  if (pictures && pictures.length > 0) {
    (async () => {
      try {
        const { deleteFile } = await import("./storage");
        for (const picture of pictures) {
          const imageUrl = picture.image_url;
          // Only delete if it's a storage path (not an external URL)
          if (imageUrl && !imageUrl.startsWith("http")) {
            await deleteFile(imageUrl);
          }
        }
      } catch (imgError) {
        console.error("Error deleting style pictures:", imgError);
        // Fire and forget - errors are logged but don't affect the response
      }
    })();
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
 * Get all service-level pictures for multiple services in a single query
 * Returns a map of service_id -> Picture[]
 */
export async function getPicturesForServices(serviceIds: string[]) {
  if (serviceIds.length === 0) {
    return {};
  }

  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("pictures")
    .select("*")
    .in("service_id", serviceIds)
    .is("style_id", null)
    .order("uploaded_at", { ascending: false });

  if (error) {
    console.error("Error fetching service pictures:", error);
    return {};
  }

  // Group pictures by service_id
  const picturesByService: Record<string, Picture[]> = {};
  (data || []).forEach((picture) => {
    if (!picturesByService[picture.service_id]) {
      picturesByService[picture.service_id] = [];
    }
    picturesByService[picture.service_id].push(picture);
  });

  return picturesByService;
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
export async function createPicture(
  picture: Pick<
    TablesInsert<"pictures">,
    "service_id" | "style_id" | "image_url" | "caption" | "is_primary_example"
  >,
) {
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
  updates: Pick<
    TablesUpdate<"pictures">,
    "image_url" | "caption" | "is_primary_example"
  >,
) {
  const { supabase } = await verifyAuth();

  // If image_url is being updated, get the old URL first to delete it from storage
  let oldImageUrl: string | null = null;
  if (updates.image_url) {
    const { data: oldPicture } = await supabase
      .from("pictures")
      .select("image_url")
      .eq("picture_id", pictureId)
      .single();

    oldImageUrl = oldPicture?.image_url || null;
  }

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

  // Clean up old storage image asynchronously (fire and forget)
  if (oldImageUrl && updates.image_url && oldImageUrl !== updates.image_url) {
    (async () => {
      try {
        const { deleteFile } = await import("./storage");
        // Only delete if it's a storage path (not an external URL)
        if (!oldImageUrl.startsWith("http")) {
          await deleteFile(oldImageUrl);
        }
      } catch (imgError) {
        console.error("Error deleting old picture image:", imgError);
        // Fire and forget - errors are logged but don't affect the response
      }
    })();
  }

  revalidatePath("/admin/services");
  return data;
}

/**
 * Delete a picture
 */
export async function deletePicture(pictureId: string) {
  const { supabase } = await verifyAuth();

  // First, get the picture to find its image
  const { data: picture } = await supabase
    .from("pictures")
    .select("image_url")
    .eq("picture_id", pictureId)
    .single();

  // Delete the database row
  const { error } = await supabase
    .from("pictures")
    .delete()
    .eq("picture_id", pictureId);

  if (error) {
    console.error("Error deleting picture:", error);
    throw error;
  }

  // Clean up storage image asynchronously (fire and forget)
  if (picture?.image_url) {
    (async () => {
      try {
        const { deleteFile } = await import("./storage");
        const imageUrl = picture.image_url;
        // Only delete if it's a storage path (not an external URL)
        if (imageUrl && !imageUrl.startsWith("http")) {
          await deleteFile(imageUrl);
        }
      } catch (imgError) {
        console.error("Error deleting picture image:", imgError);
        // Fire and forget - errors are logged but don't affect the response
      }
    })();
  }

  revalidatePath("/admin/services");
}

/**
 * Set primary example picture for a style
 */
export async function setPrimaryPicture(styleId: string, pictureId: string) {
  const { supabase } = await verifyAuth();

  // Call the atomic RPC function to set the primary picture
  const { data, error } = await supabase.rpc("set_primary_picture", {
    p_style_id: styleId,
    p_picture_id: pictureId,
  });

  if (error) {
    console.error("Error calling set_primary_picture RPC:", error);
    throw error;
  }

  // Check the result from the RPC function
  const result = data as {
    success: boolean;
    message?: string;
    error_code?: string;
    picture_id?: string;
    style_id?: string;
  };
  if (result && !result.success) {
    console.error("Error setting primary picture:", result);
    throw new Error(result.message || "Failed to set primary picture");
  }

  revalidatePath("/admin/services");
  return result;
}

/**
 * Get a map of addon IDs to service IDs they are linked to
 * Used to display which services each addon is linked to
 */
export async function getLinkedServicesMap() {
  const supabase = await getSupabaseServer();

  const linkedMap: Record<string, Set<string>> = {};

  // Get all service-addon relationships
  const { data: serviceAddonsData, error: serviceAddonsError } = await supabase
    .from("service_addons")
    .select("service_id, addon_id");

  if (serviceAddonsError) {
    console.error("Error fetching service addons:", serviceAddonsError);
    return {};
  }

  // Build the map
  (serviceAddonsData || []).forEach((serviceAddon) => {
    if (!linkedMap[serviceAddon.addon_id]) {
      linkedMap[serviceAddon.addon_id] = new Set();
    }
    linkedMap[serviceAddon.addon_id].add(serviceAddon.service_id);
  });

  // Convert Sets to arrays for serialization
  const serializedMap: Record<string, string[]> = {};
  Object.entries(linkedMap).forEach(([addonId, serviceIds]) => {
    serializedMap[addonId] = Array.from(serviceIds);
  });

  return serializedMap;
}
