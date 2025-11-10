import Image from "next/image";
import type { ComponentType } from "react";
import {
  FaDiscord,
  FaExternalLinkAlt,
  FaTumblr,
  FaTwitch,
  FaTwitter,
} from "react-icons/fa";
import { SiBluesky } from "react-icons/si";
import type { SocialMediaLink } from "./data";

const iconMap = {
  tumblr: FaTumblr,
  twitch: FaTwitch,
  vgen: null, // Custom "V" letter
  bluesky: SiBluesky,
  discord: FaDiscord,
  twitter: FaTwitter,
};

const colorMap = {
  blue: {
    border: "hover:border-blue-400 dark:hover:border-blue-500",
    bg: "from-blue-50 dark:from-blue-950",
    iconBg:
      "bg-blue-100 group-hover:bg-blue-200 dark:bg-blue-900 dark:group-hover:bg-blue-800",
    iconColor: "text-blue-600 dark:text-blue-400",
    externalLink: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
  },
  purple: {
    border: "hover:border-purple-400 dark:hover:border-purple-500",
    bg: "from-purple-50 dark:from-purple-950",
    iconBg:
      "bg-purple-100 group-hover:bg-purple-200 dark:bg-purple-900 dark:group-hover:bg-purple-800",
    iconColor: "text-purple-600 dark:text-purple-400",
    externalLink:
      "group-hover:text-purple-600 dark:group-hover:text-purple-400",
  },
  pink: {
    border: "hover:border-pink-400 dark:hover:border-pink-500",
    bg: "from-pink-50 dark:from-pink-950",
    iconBg:
      "bg-pink-100 group-hover:bg-pink-200 dark:bg-pink-900 dark:group-hover:bg-pink-800",
    iconColor: "text-pink-600 dark:text-pink-400",
    externalLink: "group-hover:text-pink-600 dark:group-hover:text-pink-400",
  },
  sky: {
    border: "hover:border-sky-400 dark:hover:border-sky-500",
    bg: "from-sky-50 dark:from-sky-950",
    iconBg:
      "bg-sky-100 group-hover:bg-sky-200 dark:bg-sky-900 dark:group-hover:bg-sky-800",
    iconColor: "text-sky-600 dark:text-sky-400",
    externalLink: "group-hover:text-sky-600 dark:group-hover:text-sky-400",
  },
  indigo: {
    border: "hover:border-indigo-400 dark:hover:border-indigo-500",
    bg: "from-indigo-50 dark:from-indigo-950",
    iconBg:
      "bg-indigo-100 group-hover:bg-indigo-200 dark:bg-indigo-900 dark:group-hover:bg-indigo-800",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    externalLink:
      "group-hover:text-indigo-600 dark:group-hover:text-indigo-400",
  },
  vgen: {
    border: "hover:border-lime-400 dark:hover:border-lime-500",
    bg: "from-lime-50 dark:from-lime-950",
    iconBg:
      "bg-lime-100 group-hover:bg-lime-200 dark:bg-lime-900 dark:group-hover:bg-lime-800",
    iconColor: "text-lime-600 dark:text-lime-400",
    externalLink: "group-hover:text-lime-600 dark:group-hover:text-lime-400",
  },
};

interface Props {
  link: SocialMediaLink;
}

export default function SocialLink({ link }: Props) {
  const Icon = iconMap[link.icon] as ComponentType<{
    className?: string;
  }> | null;
  const colors = colorMap[link.color];

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 ${colors.border} ${link.fullWidth ? "md:col-span-2" : ""}`}
    >
      <div
        className={`absolute inset-0 bg-linear-to-br ${colors.bg} to-transparent opacity-0 transition-opacity group-hover:opacity-100`}
      />
      <div className="relative flex items-center gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${colors.iconBg}`}
        >
          {Icon ? (
            <Icon
              className={`h-6 w-6 ${colors.iconColor}`}
              aria-hidden="true"
            />
          ) : (
            <Image
              src="https://help.vgen.co/hc/article_attachments/13004232167575"
              alt="V"
              width={24}
              height={24}
            />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {link.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {link.username}
          </p>
        </div>
        <FaExternalLinkAlt
          className={`h-4 w-4 text-gray-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${colors.externalLink}`}
          aria-hidden="true"
        />
      </div>
    </a>
  );
}
