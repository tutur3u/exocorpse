"use server";

import { verifyAuth } from "@/lib/auth/utils";
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
 * Generate a signed URL for temporary file access
 * This version uses Next.js fetch with revalidate for ISR support
 * @param path - Path to the file in storage
 * @param expiresIn - Expiration time in seconds (default: 1 hour, max: 7 days)
 * @returns The signed URL and expiration details
 */
export async function getSignedUrl(path: string, expiresIn = 3600) {
  try {
    const client = getTuturuuuClient();

    const result = await client.storage.share(path, {
      expiresIn: Math.min(expiresIn, 604800), // Max 7 days
    });

    return {
      success: true,
      signedUrl: result.data.signedUrl,
      expiresAt: result.data.expiresAt,
      expiresIn: result.data.expiresIn,
    };
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate signed URL",
    );
  }
}

/**
 * Generate a signed URL with Next.js fetch caching
 * Uses ISR-compatible caching for better performance
 * Note: Revalidation is handled by unstable_cache in storage-fetch.ts
 * @param path - Path to the file in storage
 */
export async function getSignedUrlCached(path: string) {
  "use server";

  try {
    const client = getTuturuuuClient();

    // Use a longer expiration (6 hours) since we'll revalidate via ISR
    const result = await client.storage.share(path, {
      expiresIn: 21600, // 6 hours
    });

    return {
      success: true,
      signedUrl: result.data.signedUrl,
      expiresAt: result.data.expiresAt,
      path,
    };
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return {
      success: false,
      signedUrl: null,
      expiresAt: null,
      path,
      error: error instanceof Error ? error.message : "Failed to get URL",
    };
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
 * @param expiresIn - Expiration time in seconds for all URLs
 */
export async function batchGetSignedUrls(paths: string[], expiresIn = 3600) {
  try {
    const client = getTuturuuuClient();

    // Use the SDK's createSignedUrls batch method for optimal performance
    const result = await client.storage.createSignedUrls(
      paths,
      Math.min(expiresIn, 604800),
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
