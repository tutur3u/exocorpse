import {
  BookOpen,
  Brush,
  CircleUserRound,
  FilePenLine,
  Globe2,
  MapPin,
  PackagePlus,
  ShieldBan,
  Sparkles,
  Users,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";

type DashboardCard = {
  description: string;
  gradient: string;
  href: string;
  hoverBorder: string;
  icon: ComponentType<{ className?: string }>;
  title: string;
};

const wikiCards: DashboardCard[] = [
  {
    description: "Create and manage story universes",
    gradient: "from-blue-500 to-purple-500",
    href: "/admin/stories",
    hoverBorder: "hover:border-blue-300 dark:hover:border-blue-700",
    icon: BookOpen,
    title: "Stories",
  },
  {
    description: "Build immersive world settings",
    gradient: "from-indigo-500 to-cyan-500",
    href: "/admin/worlds",
    hoverBorder: "hover:border-indigo-300 dark:hover:border-indigo-700",
    icon: Globe2,
    title: "Worlds",
  },
  {
    description: "Create detailed character profiles",
    gradient: "from-green-500 to-emerald-500",
    href: "/admin/characters",
    hoverBorder: "hover:border-green-300 dark:hover:border-green-700",
    icon: UsersRound,
    title: "Characters",
  },
  {
    description: "Manage groups and organizations",
    gradient: "from-purple-500 to-pink-500",
    href: "/admin/factions",
    hoverBorder: "hover:border-purple-300 dark:hover:border-purple-700",
    icon: Users,
    title: "Factions",
  },
  {
    description: "Define places and environments",
    gradient: "from-amber-500 to-orange-500",
    href: "/admin/locations",
    hoverBorder: "hover:border-amber-300 dark:hover:border-amber-700",
    icon: MapPin,
    title: "Locations",
  },
];

const contentCards: DashboardCard[] = [
  {
    description: "Manage profile copy, FAQ content, DNI rules, and socials",
    gradient: "from-cyan-500 to-blue-500",
    href: "/admin/about",
    hoverBorder: "hover:border-cyan-300 dark:hover:border-cyan-700",
    icon: CircleUserRound,
    title: "About Me",
  },
  {
    description: "Showcase art, writing, and game works",
    gradient: "from-amber-500 to-yellow-500",
    href: "/admin/portfolio",
    hoverBorder: "hover:border-amber-300 dark:hover:border-amber-700",
    icon: Brush,
    title: "Portfolio",
  },
  {
    description: "Write and publish blog content",
    gradient: "from-teal-500 to-cyan-500",
    href: "/admin/blog-posts",
    hoverBorder: "hover:border-teal-300 dark:hover:border-teal-700",
    icon: FilePenLine,
    title: "Blog Posts",
  },
  {
    description: "Manage commission services and pricing",
    gradient: "from-orange-500 to-yellow-500",
    href: "/admin/services",
    hoverBorder: "hover:border-orange-300 dark:hover:border-orange-700",
    icon: Sparkles,
    title: "Commission Services",
  },
  {
    description: "Configure service add-ons and extras",
    gradient: "from-pink-500 to-rose-500",
    href: "/admin/addons",
    hoverBorder: "hover:border-pink-300 dark:hover:border-pink-700",
    icon: PackagePlus,
    title: "Add-ons",
  },
  {
    description: "Manage restricted commission clients",
    gradient: "from-red-500 to-orange-500",
    href: "/admin/blacklist",
    hoverBorder: "hover:border-red-300 dark:hover:border-red-700",
    icon: ShieldBan,
    title: "Blacklist",
  },
];

function AdminCard({ card }: { card: DashboardCard }) {
  const Icon = card.icon;
  return (
    <Link
      className={`group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-950 ${card.hoverBorder}`}
      href={card.href}
    >
      <div
        className={`absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-linear-to-br opacity-10 ${card.gradient}`}
      />
      <div className="relative">
        <div
          className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br shadow-lg transition-transform group-hover:scale-110 ${card.gradient}`}
        >
          <Icon className="h-7 w-7 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {card.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {card.description}
        </p>
      </div>
    </Link>
  );
}

function DashboardSection({
  cards,
  gradient,
  title,
}: {
  cards: DashboardCard[];
  gradient: string;
  title: string;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <div className={`h-1 w-12 rounded-full bg-linear-to-r ${gradient}`} />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>
      <div
        className={
          title === "Wiki"
            ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5"
            : "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        {cards.map((card) => (
          <AdminCard card={card} key={card.href} />
        ))}
      </div>
    </section>
  );
}

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <DashboardSection
        cards={wikiCards}
        gradient="from-blue-500 to-purple-500"
        title="Wiki"
      />
      <DashboardSection
        cards={contentCards}
        gradient="from-amber-500 to-teal-500"
        title="Content"
      />
    </div>
  );
}
