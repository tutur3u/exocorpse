"use server";

import {
  DEFAULT_SIGNED_URL_EXPIRATION,
  MAX_SIGNED_URL_EXPIRATION,
  REVALIDATE_TIME,
} from "@/constants";
import { verifyAuth } from "@/lib/auth/utils";
import {
  getSupabaseAdminServer,
  getSupabaseServer,
} from "@/lib/supabase/server";
import { TuturuuuClient } from "tuturuuu";

// Initialize the Tuturuuu client with API key from environment
// Make sure to add TUTURUUU_API_KEY to your .env file (NOT .env.local with NEXT_PUBLIC_ prefix!)
function getTuturuuuClient() {
  const apiKey = process.env.TUTURUUU_API_KEY;
  if (!apiKey) {
    throw new Error(
      "TUTURUUU_API_KEY is not set in environment variables. Please add it to your .env file.",
    );
  }
  return new TuturuuuClient(apiKey);
}

/**
 * Upload a file to the tuturuuu storage
 * @param file - The file to upload (as FormData or base64 string)
 * @param path - Destination folder path (e.g., "characters/profile-images")
 * @param filename - The filename to use
 * @returns The full path to the uploaded file
 */
export async function uploadFile(
  fileData: string, // base64 data URL
  path: string,
  filename: string,
) {
  // Verify authentication
  await verifyAuth();

  try {
    const client = getTuturuuuClient();

    // Convert base64 data URL to File object
    const base64Response = await fetch(fileData);
    const blob = await base64Response.blob();
    const file = new File([blob], filename, { type: blob.type });

    // Upload the file with upsert to allow overwriting
    const result = await client.storage.upload(file, {
      path,
      upsert: true, // Allow overwriting if file exists
    });

    return {
      success: true,
      path: result.data.path,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to upload file",
    );
  }
}

/**
 * Delete a file from storage
 * @param path - Path to the file to delete
 */
export async function deleteFile(path: string) {
  // Verify authentication
  await verifyAuth();

  try {
    const client = getTuturuuuClient();

    const result = await client.storage.delete([path]);

    return {
      success: true,
      deleted: result.data.deleted,
    };
  } catch (error) {
    console.error("Error deleting file:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete file",
    );
  }
}

/**
 * Batch generate signed URLs for multiple files using the SDK's batch method
 * This is more efficient than individual calls as it fetches all URLs in one request
 * @param paths - Array of file paths (max 100)
 * @param expiresIn - Expiration time in seconds for all URLs (default: 1 hour)
 */
export async function batchGetSignedUrls(
  paths: string[],
  expiresIn = DEFAULT_SIGNED_URL_EXPIRATION,
) {
  try {
    const client = getTuturuuuClient();

    // Use the SDK's createSignedUrls batch method for optimal performance
    const result = await client.storage.createSignedUrls(
      paths,
      Math.min(expiresIn, MAX_SIGNED_URL_EXPIRATION),
    );

    // Transform the response to match our expected format
    return result.data.map((item) => ({
      path: item.path,
      signedUrl: item.signedUrl || null,
      expiresAt: item.expiresAt || null,
      success: !item.error,
      error: item.error,
    }));
  } catch (error) {
    console.error("Error in batch signed URL generation:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate signed URLs",
    );
  }
}

/**
 * Upload character profile image
 * @param characterId - The character ID
 * @param fileData - Base64 data URL of the image
 * @param filename - Original filename
 */
export async function uploadCharacterProfileImage(
  characterId: string,
  fileData: string,
  filename: string,
) {
  return uploadFile(fileData, `characters/${characterId}/profile`, filename);
}

/**
 * Upload character banner image
 * @param characterId - The character ID
 * @param fileData - Base64 data URL of the image
 * @param filename - Original filename
 */
export async function uploadCharacterBannerImage(
  characterId: string,
  fileData: string,
  filename: string,
) {
  return uploadFile(fileData, `characters/${characterId}/banner`, filename);
}

/**
 * Delete character images when character is deleted
 * @param characterId - The character ID
 */
export async function deleteCharacterImages(characterId: string) {
  // Verify authentication
  await verifyAuth();

  try {
    const client = getTuturuuuClient();

    // Delete all images in the character's folder
    const result = await client.storage.delete([
      `characters/${characterId}/profile`,
      `characters/${characterId}/banner`,
    ]);

    return {
      success: true,
      deleted: result.data.deleted,
    };
  } catch (error) {
    console.error("Error deleting character images:", error);
    // Don't throw here - character deletion should still succeed even if image deletion fails
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete images",
    };
  }
}

/**
 * Upload character gallery image
 * @param characterId - The character ID
 * @param fileData - Base64 data URL of the image
 * @param filename - Original filename
 */
export async function uploadCharacterGalleryImage(
  characterId: string,
  fileData: string,
  filename: string,
) {
  return uploadFile(fileData, `characters/${characterId}/gallery`, filename);
}

/**
 * Delete character gallery image
 * @param path - Full path to the gallery image
 */
export async function deleteCharacterGalleryImage(path: string) {
  return deleteFile(path);
}

/**
 * Upload artwork image for portfolio
 * @param artworkId - The artwork piece ID
 * @param fileData - Base64 data URL of the image
 * @param filename - Original filename
 */
export async function uploadArtworkImage(
  artworkId: string,
  fileData: string,
  filename: string,
) {
  return uploadFile(fileData, `portfolio/art/${artworkId}`, filename);
}

/**
 * Delete artwork image
 * @param path - Full path to the artwork image
 */
export async function deleteArtworkImage(path: string) {
  return deleteFile(path);
}

/**
 * Upload writing cover image for portfolio
 * @param writingId - The writing piece ID
 * @param fileData - Base64 data URL of the image
 * @param filename - Original filename
 */
export async function uploadWritingImage(
  writingId: string,
  fileData: string,
  filename: string,
) {
  return uploadFile(fileData, `portfolio/writing/${writingId}`, filename);
}

/**
 * Delete writing cover image
 * @param path - Full path to the writing cover image
 */
export async function deleteWritingImage(path: string) {
  return deleteFile(path);
}

/**
 * Delete blog post cover image
 * @param path - Full path to the blog cover image
 */
export async function deleteBlogImage(path: string) {
  return deleteFile(path);
}

/**
 * Get a cached signed URL or fetch a new one if expired
 * This implements a database-level cache to reduce load on the tuturuuu SDK
 * @param path - Path to the file in storage
 * @returns The signed URL
 */
export async function getCachedSignedUrl(path: string): Promise<string | null> {
  if (!path) return null;

  try {
    const supabase = await getSupabaseServer();

    // Check if we have a cached URL that hasn't expired yet
    const { data: cachedUrl } = await supabase
      .from("resource_urls")
      .select("url, expired_at")
      .eq("resource_path", path)
      .single();

    const now = new Date();

    // If we have a valid cached URL that hasn't expired, use it
    if (cachedUrl?.expired_at && new Date(cachedUrl.expired_at) > now) {
      return cachedUrl.url;
    }

    // Otherwise, fetch a new signed URL from the SDK
    const client = getTuturuuuClient();
    const expiresIn = REVALIDATE_TIME; // Use the configured revalidation time

    const result = await client.storage.share(path, {
      expiresIn: Math.min(expiresIn, MAX_SIGNED_URL_EXPIRATION),
    });

    if (!result.data.signedUrl) {
      console.error("No signed URL returned from SDK for path:", path);
      return null;
    }

    // Calculate the expiration timestamp
    const expiresAt = new Date(now.getTime() + expiresIn * 1000);

    const sbAdmin = await getSupabaseAdminServer();

    // Upsert the new URL into the cache
    await sbAdmin.from("resource_urls").upsert(
      {
        resource_path: path,
        url: result.data.signedUrl,
        expired_at: expiresAt.toISOString(),
      },
      {
        onConflict: "resource_path",
      },
    );

    return result.data.signedUrl;
  } catch (error) {
    console.error("Error getting cached signed URL:", error);
    return null;
  }
}

/**
 * Batch get cached signed URLs or fetch new ones if expired
 * More efficient than individual calls
 * @param paths - Array of file paths
 * @returns Map of path to signed URL
 */
export async function batchGetCachedSignedUrls(
  paths: string[],
): Promise<Map<string, string>> {
  const urlMap = new Map<string, string>();

  if (!paths.length) return urlMap;

  try {
    const supabase = await getSupabaseServer();
    const now = new Date();

    // Fetch all cached URLs in one query
    const { data: cachedUrls } = await supabase
      .from("resource_urls")
      .select("resource_path, url, expired_at")
      .in("resource_path", paths);

    // Separate cached (valid) and expired/missing paths
    const validCached: { path: string; url: string }[] = [];
    const pathsToFetch: string[] = [];

    const cachedMap = new Map(
      cachedUrls?.map((item) => [item.resource_path, item]) || [],
    );

    for (const path of paths) {
      const cached = cachedMap.get(path);
      if (cached?.expired_at && new Date(cached.expired_at) > now) {
        validCached.push({ path, url: cached.url });
      } else {
        pathsToFetch.push(path);
      }
    }

    // Add valid cached URLs to the result
    for (const { path, url } of validCached) {
      urlMap.set(path, url);
    }

    // If we have paths that need fetching, get them from the SDK
    if (pathsToFetch.length > 0) {
      const client = getTuturuuuClient();
      const expiresIn = REVALIDATE_TIME;

      const result = await client.storage.createSignedUrls(
        pathsToFetch,
        Math.min(expiresIn, MAX_SIGNED_URL_EXPIRATION),
      );

      const expiresAt = new Date(now.getTime() + expiresIn * 1000);
      const upsertData: Array<{
        resource_path: string;
        url: string;
        expired_at: string;
      }> = [];

      // Process the results
      for (const item of result.data) {
        if (item.signedUrl && !item.error) {
          urlMap.set(item.path, item.signedUrl);
          upsertData.push({
            resource_path: item.path,
            url: item.signedUrl,
            expired_at: expiresAt.toISOString(),
          });
        }
      }

      // Batch upsert all new URLs
      if (upsertData.length > 0) {
        await supabase.from("resource_urls").upsert(upsertData, {
          onConflict: "resource_path",
        });
      }
    }

    return urlMap;
  } catch (error) {
    console.error("Error in batch get cached signed URLs:", error);
    return urlMap;
  }
}

/**
 * Clean up expired cache entries from the database
 * This should be called periodically (e.g., via a cron job)
 * @returns Number of deleted entries
 */
export async function cleanupExpiredCacheEntries(): Promise<{
  success: boolean;
  deletedCount: number;
  error?: string;
}> {
  try {
    const supabase = await getSupabaseServer();

    // Delete all entries where expired_at is in the past
    const { error, count } = await supabase
      .from("resource_urls")
      .delete()
      .lt("expired_at", new Date().toISOString());

    if (error) {
      console.error("Error cleaning up expired cache entries:", error);
      return {
        success: false,
        deletedCount: 0,
        error: error.message,
      };
    }

    return {
      success: true,
      deletedCount: count || 0,
    };
  } catch (error) {
    console.error("Error cleaning up expired cache entries:", error);
    return {
      success: false,
      deletedCount: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
