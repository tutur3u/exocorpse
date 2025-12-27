"use client";

import toastWithSound from "@/lib/toast";
import { useState } from "react";

interface CopyLinkButtonProps {
  /** The slug for the entity (story, world, character, etc.) */
  slug: string;
  /** Base path type (e.g., "story", "character") */
  type: "story" | "world" | "character" | "faction" | "location";
  /** Parent story slug (required for world, character, faction, location) */
  storySlug?: string;
  /** Parent world slug (required for character, faction, location) */
  worldSlug?: string;
  /** Additional CSS classes */
  className?: string;
  /** Button variant */
  variant?: "icon" | "text" | "full";
}

/**
 * Reusable button to copy a deep link to an entity in the Wiki
 */
export default function CopyLinkButton({
  slug,
  type,
  storySlug,
  worldSlug,
  className = "",
  variant = "icon",
}: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const buildUrl = () => {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    const params = new URLSearchParams();

    switch (type) {
      case "story":
        params.set("story", slug);
        break;
      case "world":
        if (storySlug) params.set("story", storySlug);
        params.set("world", slug);
        break;
      case "character":
        if (storySlug) params.set("story", storySlug);
        if (worldSlug) params.set("world", worldSlug);
        params.set("character", slug);
        break;
      case "faction":
        if (storySlug) params.set("story", storySlug);
        if (worldSlug) params.set("world", worldSlug);
        params.set("faction", slug);
        break;
      case "location":
        if (storySlug) params.set("story", storySlug);
        if (worldSlug) params.set("world", worldSlug);
        params.set("location", slug);
        break;
    }

    return `${base}/?${params.toString()}`;
  };

  const handleCopy = async () => {
    try {
      const url = buildUrl();
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toastWithSound.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      toastWithSound.error("Failed to copy link");
    }
  };

  const iconContent = (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <title>{copied ? "Link copied" : "Copy link"}</title>
      {copied ? (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      )}
    </svg>
  );

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className={`rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100 ${className}`}
        title="Copy link"
      >
        {iconContent}
      </button>
    );
  }

  if (variant === "text") {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className={`text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 ${className}`}
      >
        {copied ? "Copied!" : "Copy Link"}
      </button>
    );
  }

  // Full variant
  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 ${className}`}
    >
      {iconContent}
      <span>{copied ? "Copied!" : "Copy Link"}</span>
    </button>
  );
}
