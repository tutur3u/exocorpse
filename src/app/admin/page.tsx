import {
  ADMIN_CMS_SECTIONS,
  type AdminCmsSectionKey,
} from "@/lib/admin-cms-sections";
import { getExocorpseCmsStudio } from "@/lib/tuturuuu-cms-repository";
import {
  BookOpenText,
  Boxes,
  Brush,
  CircleUserRound,
  Database,
  FileText,
  Globe2,
  MapPinned,
  PackagePlus,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import type { ComponentType } from "react";

const groups: Array<{
  label: string;
  sections: AdminCmsSectionKey[];
}> = [
  {
    label: "Worldbuilding archive",
    sections: ["stories", "worlds", "characters", "factions", "locations"],
  },
  {
    label: "Published surfaces",
    sections: ["about", "portfolio", "blog-posts", "services", "addons"],
  },
];

const icons: Record<
  AdminCmsSectionKey,
  ComponentType<{ className?: string }>
> = {
  about: CircleUserRound,
  addons: PackagePlus,
  "blog-posts": FileText,
  characters: UsersRound,
  cms: Database,
  factions: ShieldCheck,
  locations: MapPinned,
  portfolio: Brush,
  services: Sparkles,
  stories: BookOpenText,
  worlds: Globe2,
};

export default async function AdminDashboard() {
  await connection();
  const studio = await getExocorpseCmsStudio();
  const collectionBySlug = new Map(
    studio.collections.map((collection) => [collection.slug, collection]),
  );
  const totalPublished = studio.entries.filter(
    (entry) => entry.status === "published",
  ).length;

  return (
    <div className="@container space-y-8">
      <header className="relative overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-950 px-6 py-8 text-white shadow-[0_28px_90px_rgba(9,9,11,0.22)] @3xl:px-10 @3xl:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_12%,rgba(34,211,238,0.2),transparent_30%),radial-gradient(circle_at_10%_110%,rgba(244,63,94,0.13),transparent_38%)]" />
        <div className="relative grid gap-8 @4xl:grid-cols-[1fr_auto] @4xl:items-end">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.34em] text-cyan-300 uppercase">
              Exocorpse control room
            </p>
            <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight font-semibold tracking-tight text-balance @3xl:text-5xl">
              Familiar management, now powered entirely by Tuturuuu CMS.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300">
              Each desk keeps its original purpose while sharing typed fields,
              transactional relations, managed media, and one publishing model.
            </p>
          </div>
          <Link
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-300"
            href="/admin/cms"
          >
            <Database className="h-4 w-4" />
            Complete library
          </Link>
        </div>
      </header>

      <section className="grid gap-3 @2xl:grid-cols-2 @4xl:grid-cols-4">
        {[
          ["Collections", studio.collections.length],
          ["Records", studio.entries.length],
          ["Published", totalPublished],
          [
            "Managed media",
            studio.assets.filter((asset) => asset.storage_path).length,
          ],
        ].map(([label, value]) => (
          <div
            className="rounded-2xl border border-zinc-200/80 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
            key={label}
          >
            <p className="text-[10px] font-semibold tracking-[0.2em] text-zinc-500 uppercase dark:text-zinc-400">
              {label}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              {value}
            </p>
          </div>
        ))}
      </section>

      {groups.map((group) => (
        <section className="space-y-4" key={group.label}>
          <div className="flex items-center gap-3">
            <span className="h-px w-9 bg-cyan-500" />
            <h2 className="text-xs font-semibold tracking-[0.22em] text-zinc-600 uppercase dark:text-zinc-300">
              {group.label}
            </h2>
          </div>
          <div className="grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
            {group.sections.map((sectionKey) => {
              const section = ADMIN_CMS_SECTIONS[sectionKey];
              const Icon = icons[sectionKey];
              const collectionIds = new Set(
                section.collectionSlugs
                  .map((slug) => collectionBySlug.get(slug)?.id)
                  .filter((id): id is string => Boolean(id)),
              );
              const count = studio.entries.filter((entry) =>
                collectionIds.has(entry.collection_id),
              ).length;
              return (
                <Link
                  className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-cyan-700"
                  href={`/admin/${sectionKey}`}
                  key={sectionKey}
                >
                  <div className="absolute -top-14 -right-14 h-32 w-32 rounded-full bg-cyan-400/8 transition group-hover:bg-cyan-400/14" />
                  <div className="relative flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-700 transition group-hover:border-cyan-300 group-hover:bg-cyan-50 group-hover:text-cyan-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:group-hover:border-cyan-800 dark:group-hover:bg-cyan-950 dark:group-hover:text-cyan-300">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-zinc-950 dark:text-zinc-50">
                          {section.title}
                        </span>
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                          {count}
                        </span>
                      </span>
                      <span className="mt-2 line-clamp-2 block text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                        {section.description}
                      </span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}

      <section className="grid gap-4 @3xl:grid-cols-2">
        <Link
          className="flex items-center gap-4 rounded-2xl border border-zinc-200/80 bg-white p-5 transition hover:border-cyan-400 dark:border-zinc-800 dark:bg-zinc-950"
          href="/admin/blacklist"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-semibold text-zinc-950 dark:text-zinc-50">
              Commission Blacklist
            </span>
            <span className="mt-1 block text-sm text-zinc-600 dark:text-zinc-400">
              Branded moderation and public pagination workflow.
            </span>
          </span>
        </Link>
        <Link
          className="flex items-center gap-4 rounded-2xl border border-zinc-200/80 bg-white p-5 transition hover:border-cyan-400 dark:border-zinc-800 dark:bg-zinc-950"
          href="/admin/cms"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
            <Boxes className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-semibold text-zinc-950 dark:text-zinc-50">
              Complete CMS Library
            </span>
            <span className="mt-1 block text-sm text-zinc-600 dark:text-zinc-400">
              Access every retained and system collection in one place.
            </span>
          </span>
        </Link>
      </section>
    </div>
  );
}
