import {
  BookOpen,
  Globe,
  Users,
  Flag,
  MapPin,
  UserRound,
  Images,
  NotebookPen,
  BriefcaseBusiness,
  Puzzle,
  ShieldBan,
  Library,
  HardDrive,
  UsersRound,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";

export const adminNavigation = [
  {
    label: "Wiki",
    items: [
      {
        href: "/admin/stories",
        label: "Stories",
        description: "Stories and their characters",
        icon: BookOpen,
      },
      {
        href: "/admin/worlds",
        label: "Worlds",
        description: "Worlds, lore, and settings",
        icon: Globe,
      },
      {
        href: "/admin/characters",
        label: "Characters",
        description: "Profiles, galleries, and relationships",
        icon: Users,
      },
      {
        href: "/admin/factions",
        label: "Factions",
        description: "Groups and their members",
        icon: Flag,
      },
      {
        href: "/admin/locations",
        label: "Locations",
        description: "Places and their galleries",
        icon: MapPin,
      },
    ],
  },
  {
    label: "Content",
    items: [
      {
        href: "/admin/about",
        label: "About Me",
        description: "Profile, FAQs, and personal details",
        icon: UserRound,
      },
      {
        href: "/admin/portfolio",
        label: "Portfolio",
        description: "Artwork, writing, and games",
        icon: Images,
      },
      {
        href: "/admin/blog-posts",
        label: "Blog Posts",
        description: "Posts, covers, and publishing",
        icon: NotebookPen,
      },
      {
        href: "/admin/services",
        label: "Commission Services",
        description: "Prices, styles, and examples",
        icon: BriefcaseBusiness,
      },
      {
        href: "/admin/addons",
        label: "Add-ons",
        description: "Optional commission extras",
        icon: Puzzle,
      },
      {
        href: "/admin/blacklist",
        label: "Blacklist",
        description: "Commission restrictions",
        icon: ShieldBan,
      },
    ],
  },
  {
    label: "Advanced",
    items: [
      {
        href: "/admin/cms",
        label: "Content library",
        description: "All collections and related content",
        icon: Library,
      },
      {
        href: "/admin/drive",
        label: "Tuturuuu Drive",
        description: "Files and folders",
        icon: HardDrive,
      },
      {
        href: "/admin/members",
        label: "Team members",
        description: "Workspace members and roles",
        icon: UsersRound,
      },
    ],
  },
];

export function adminPageIcon(title: string): LucideIcon {
  return (
    adminNavigation
      .flatMap((section) => section.items)
      .find((item) =>
        title
          .toLowerCase()
          .includes(
            item.label.toLowerCase().replace(" me", "").replace(" posts", ""),
          ),
      )?.icon ?? LayoutDashboard
  );
}

export function cmsCollectionIcon(slug: string): LucideIcon {
  if (
    slug.includes("gallery") ||
    slug.includes("picture") ||
    slug.includes("asset") ||
    slug === "portfolio-art"
  )
    return Images;
  if (slug.includes("character")) return Users;
  if (slug.includes("faction")) return Flag;
  if (slug.includes("location")) return MapPin;
  if (slug.includes("world")) return Globe;
  if (slug.includes("stories") || slug.includes("passage")) return BookOpen;
  if (slug.includes("blog") || slug === "portfolio-writing") return NotebookPen;
  if (slug.includes("blacklist")) return ShieldBan;
  if (slug.includes("addon")) return Puzzle;
  if (slug.includes("commission")) return BriefcaseBusiness;
  if (slug.includes("about")) return UserRound;
  return Library;
}
