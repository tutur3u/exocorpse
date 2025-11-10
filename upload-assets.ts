#!/usr/bin/env bun

import { readdir, readFile, stat } from "fs/promises";
import { dirname, join, relative } from "path";
import { TuturuuuClient } from "tuturuuu";
import { fileURLToPath } from "url";

// Configuration
const API_KEY = process.env.TUTURUUU_API_KEY;
const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, "public");
const STORAGE_PREFIX = "public";
const BATCH_SIZE = 50; // Upload in batches to avoid overwhelming the API

if (!API_KEY) {
  console.error(
    "❌ TUTURUUU_API_KEY is not set in environment variables. Please add it to your .env file.",
  );
  process.exit(1);
}

const client = new TuturuuuClient(API_KEY);

interface FileInfo {
  path: string;
  fullPath: string;
  size: number;
}

/**
 * Recursively get all files in a directory
 */
async function getAllFiles(dir: string): Promise<FileInfo[]> {
  const files: FileInfo[] = [];

  async function traverse(currentDir: string) {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);
      const relativePath = relative(PUBLIC_DIR, fullPath);

      if (entry.isDirectory()) {
        await traverse(fullPath);
      } else {
        const stats = await stat(fullPath);
        files.push({
          path: `${STORAGE_PREFIX}/${relativePath}`.replace(/\\/g, "/"),
          fullPath,
          size: stats.size,
        });
      }
    }
  }

  await traverse(dir);
  return files;
}

/**
 * Format bytes to human-readable size
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Get MIME type based on file extension
 */
function getMimeType(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase();
  const mimeTypeMap: { [key: string]: string } = {
    webp: "image/webp",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    mp4: "video/mp4",
    cur: "image/x-win-bitmap",
    ani: "application/x-navi-animation",
    js: "application/javascript",
    json: "application/json",
  };
  return mimeTypeMap[ext || ""] || "application/octet-stream";
}

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Upload a single file with retry logic
 */
async function uploadFileWithRetry(
  file: FileInfo,
  maxRetries: number = 3,
): Promise<{ success: boolean; path?: string; error?: string }> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const fileContent = await readFile(file.fullPath);
      const fileSize = formatBytes(file.size);

      // Read file content and create a File object with the correct name
      const fileName = file.fullPath.split(/[\\\/]/).pop()!;
      const fileObject = new File([fileContent], fileName, {
        type: getMimeType(file.fullPath),
      });

      // Get the destination folder path (without filename)
      const relativePath = relative(PUBLIC_DIR, file.fullPath).replace(
        /\\/g,
        "/",
      );
      const folderPath = relativePath.substring(
        0,
        relativePath.lastIndexOf("/"),
      );
      const destinationPath =
        folderPath.length > 0 ? `${STORAGE_PREFIX}/${folderPath}` : STORAGE_PREFIX;

      // Upload directly using the SDK
      const result = await client.storage.upload(fileObject, {
        path: destinationPath,
        upsert: true,
      });

      if (!result?.data?.path) {
        return { success: false, error: "Upload returned no path" };
      }

      console.log(`✅ ${file.path} (${fileSize})`);
      return { success: true, path: result.data.path };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";

      // Check for rate limit
      if (errorMsg.includes("Rate limit")) {
        const waitTime = attempt < maxRetries ? 65000 : 0; // 65 seconds for rate limit
        if (attempt < maxRetries) {
          console.log(
            `⏳ ${file.path} - Rate limited. Retrying in 65s (attempt ${attempt}/${maxRetries})...`,
          );
          await sleep(waitTime);
          continue;
        }
      }

      // For other errors or last attempt
      if (attempt === maxRetries) {
        console.log(`❌ ${file.path} - ${errorMsg}`);
        return { success: false, error: errorMsg };
      }

      // Exponential backoff for other errors
      const backoffTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      console.log(
        `⏳ ${file.path} - Retrying in ${Math.round(backoffTime / 1000)}s (attempt ${attempt}/${maxRetries})...`,
      );
      await sleep(backoffTime);
    }
  }

  return { success: false, error: "Max retries exceeded" };
}

/**
 * Upload files in batches
 */
async function uploadBatch(files: FileInfo[]): Promise<void> {
  let successCount = 0;
  let failureCount = 0;
  let totalSize = 0;
  const failed: string[] = [];

  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, Math.min(i + BATCH_SIZE, files.length));
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(files.length / BATCH_SIZE);

    console.log(
      `\n📦 Batch ${batchNumber}/${totalBatches} (${batch.length} files)`,
    );
    console.log("━".repeat(60));

    // Upload files sequentially to avoid rate limiting
    for (const file of batch) {
      const result = await uploadFileWithRetry(file);

      if (result.success) {
        successCount++;
        totalSize += file.size;
      } else {
        failureCount++;
        failed.push(`${file.path} - ${result.error}`);
      }
    }
  }

  // Print summary
  console.log("\n" + "═".repeat(60));
  console.log("📊 UPLOAD SUMMARY");
  console.log("═".repeat(60));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log(`📦 Total Size: ${formatBytes(totalSize)}`);
  console.log(`📁 Total Files: ${successCount + failureCount}`);
  console.log("═".repeat(60));

  if (failed.length > 0) {
    console.log("\n❌ Failed files:");
    failed.forEach((f) => console.log(`  - ${f}`));
  }

  if (failureCount > 0) {
    process.exit(1);
  }
}

/**
 * Main function
 */
async function main() {
  console.log("🚀 Starting asset upload to TTR SDK");
  console.log(`📂 Source: ${PUBLIC_DIR}`);
  console.log(`🗂️  Destination: ${STORAGE_PREFIX}/*`);
  console.log("═".repeat(60));

  try {
    console.log("📋 Scanning files...");
    const files = await getAllFiles(PUBLIC_DIR);

    if (files.length === 0) {
      console.log("⚠️  No files found to upload");
      process.exit(0);
    }

    console.log(`📋 Found ${files.length} files`);
    console.log(
      `📦 Total size: ${formatBytes(files.reduce((sum, f) => sum + f.size, 0))}\n`,
    );

    // Ask for confirmation
    console.log(
      "Preparing to upload all files. This may take a few minutes...\n",
    );

    await uploadBatch(files);

    console.log("\n✨ Upload complete!");
  } catch (error) {
    console.error("❌ Error during upload:", error);
    process.exit(1);
  }
}

main();
