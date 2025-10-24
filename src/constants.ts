/**
 * Application constants
 */

export const TASKBAR_HEIGHT = 48;

/**
 * Mobile breakpoint - screens at or below this width are considered mobile
 */
export const MOBILE_BREAKPOINT = 640;

/**
 * Maximum length for meta description tags
 */
export const MAX_DESCRIPTION_LENGTH = 160;

/**
 * Revalidation time for cached data (in seconds)
 * Used for ISR and data fetching caches
 * Measured in seconds
 */
export const REVALIDATE_TIME = 86400; // 1 day

/**
 * Storage and URL caching constants
 */

/**
 * Maximum expiration time allowed by the tuturuuu SDK (in seconds)
 * The SDK has a hard limit of 7 days for signed URL expiration
 * Ref: tuturuuu SDK documentation
 */
export const MAX_SIGNED_URL_EXPIRATION = 604800; // 7 days

/**
 * Default expiration time for individually requested signed URLs (in seconds)
 * Used when fetching a single URL via getSignedUrl or getCachedSignedUrl
 */
export const DEFAULT_SIGNED_URL_EXPIRATION = 3600; // 1 hour

/**
 * Maximum number of paths that can be batch-processed at once
 * The tuturuuu SDK supports up to 100 paths in a single batch request
 */
export const MAX_BATCH_SIZE = 100;

/**
 * React Query cache stale time for storage URLs (in milliseconds)
 * URLs are marked as stale 6 days after being cached (1 day before MAX_SIGNED_URL_EXPIRATION)
 * This ensures we refresh URLs before they expire on the SDK side (7 day limit)
 */
export const STORAGE_URL_STALE_TIME = 6 * 24 * 60 * 60 * 1000;

/**
 * React Query garbage collection time for storage URLs (in milliseconds)
 * URLs are completely removed from cache after 7 days, matching MAX_SIGNED_URL_EXPIRATION
 * After this time, the signed URL will have expired and must be refreshed
 */
export const STORAGE_URL_GC_TIME = 7 * 24 * 60 * 60 * 1000;
