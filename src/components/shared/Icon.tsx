"use client";

import Image from "next/image";
import { useState } from "react";

interface IconProps {
  /** The name of the icon (e.g., "Blog", "Portfolio", "Play", "Speaker_0") */
  name: string;
  /** Size in pixels (for both width and height) */
  size?: 32 | 256;
  /** Additional CSS classes */
  className?: string;
  /** Alt text for the image */
  alt?: string;
  /** External hover state - if provided, this controls the hover state instead of internal state */
  isHovered?: boolean;
}

/**
 * Icon component that displays a PNG by default and switches to GIF on hover
 * if a GIF version exists. Only works for icons that have both PNG and GIF versions.
 */
export default function Icon({
  name,
  size = 32,
  className = "",
  alt,
  isHovered: externalIsHovered,
}: IconProps) {
  const [internalIsHovered, setInternalIsHovered] = useState(false);

  // Use external hover state if provided, otherwise use internal state
  const isHovered =
    externalIsHovered !== undefined ? externalIsHovered : internalIsHovered;

  // Check if this icon has both PNG and GIF versions
  // Icons with both versions: Blog, Butterflies, Commission, Portfolio, World_Wiki
  const hasGifVersion = [
    "Blog",
    "Butterflies",
    "Commission",
    "Portfolio",
    "World_Wiki",
  ].includes(name);

  // Determine which image to show
  const imageType = isHovered && hasGifVersion ? "GIFs" : "PNGs";
  const imagePath = `/icons/${imageType}/${size}/${name}.${isHovered && hasGifVersion ? "gif" : "png"}`;

  return (
    <div
      onMouseEnter={() => setInternalIsHovered(true)}
      onMouseLeave={() => setInternalIsHovered(false)}
      className={className}
    >
      <Image
        src={imagePath}
        alt={alt || name}
        width={size}
        height={size}
        className="h-full w-full"
        unoptimized={isHovered && hasGifVersion} // Don't optimize GIFs
      />
    </div>
  );
}
