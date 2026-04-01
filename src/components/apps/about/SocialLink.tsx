import Image from "next/image";
import type {
  AboutContentItem,
  AboutSocialColorKey,
  AboutSocialIconKey,
} from "@/lib/about";
import type { ComponentType } from "react";
import {
  FaDiscord,
  FaExternalLinkAlt,
  FaTumblr,
  FaTwitch,
  FaTwitter,
} from "react-icons/fa";
import { SiBluesky } from "react-icons/si";

const iconMap: Record<
  AboutSocialIconKey,
  ComponentType<{ className?: string }> | null
> = {
  tumblr: FaTumblr,
  twitch: FaTwitch,
  vgen: null, // Custom "V" letter
  bluesky: SiBluesky,
  discord: FaDiscord,
  twitter: FaTwitter,
};

const colorMap: Record<
  AboutSocialColorKey,
  {
    border: string;
    bg: string;
    iconBg: string;
    iconColor: string;
    externalLink: string;
  }
> = {
  blue: {
    border: "hover:border-blue-400",
    bg: "from-blue-950/60",
    iconBg: "bg-blue-950/75 group-hover:bg-blue-900",
    iconColor: "text-blue-300",
    externalLink: "group-hover:text-blue-300",
  },
  purple: {
    border: "hover:border-purple-400",
    bg: "from-purple-950/60",
    iconBg: "bg-purple-950/75 group-hover:bg-purple-900",
    iconColor: "text-purple-300",
    externalLink: "group-hover:text-purple-300",
  },
  pink: {
    border: "hover:border-pink-400",
    bg: "from-pink-950/60",
    iconBg: "bg-pink-950/75 group-hover:bg-pink-900",
    iconColor: "text-pink-300",
    externalLink: "group-hover:text-pink-300",
  },
  sky: {
    border: "hover:border-sky-400",
    bg: "from-sky-950/60",
    iconBg: "bg-sky-950/75 group-hover:bg-sky-900",
    iconColor: "text-sky-300",
    externalLink: "group-hover:text-sky-300",
  },
  indigo: {
    border: "hover:border-indigo-400",
    bg: "from-indigo-950/60",
    iconBg: "bg-indigo-950/75 group-hover:bg-indigo-900",
    iconColor: "text-indigo-300",
    externalLink: "group-hover:text-indigo-300",
  },
  vgen: {
    border: "hover:border-lime-400",
    bg: "from-lime-950/60",
    iconBg: "bg-lime-950/75 group-hover:bg-lime-900",
    iconColor: "text-lime-300",
    externalLink: "group-hover:text-lime-300",
  },
};

interface Props {
  link: AboutContentItem;
}

export default function SocialLink({ link }: Props) {
  const Icon = iconMap[(link.icon_key as AboutSocialIconKey) || "tumblr"];
  const colors = colorMap[(link.color_key as AboutSocialColorKey) || "blue"];

  return (
    <a
      href={link.url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900/80 p-5 shadow-sm transition-all hover:shadow-lg ${colors.border} ${link.is_full_width ? "md:col-span-2" : ""}`}
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
          <h3 className="font-semibold text-slate-100">{link.title}</h3>
          <p className="text-sm text-slate-300">{link.subtitle}</p>
        </div>
        <FaExternalLinkAlt
          className={`h-4 w-4 text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${colors.externalLink}`}
          aria-hidden="true"
        />
      </div>
    </a>
  );
}
