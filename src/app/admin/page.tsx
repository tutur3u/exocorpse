import Link from "next/link";
import { connection } from "next/server";

const destinations = [
  {
    description:
      "Edit every retained Exocorpse collection, block, relation, publication state, and managed asset.",
    href: "/admin/cms",
    label: "Open Tuturuuu CMS Editor",
  },
  {
    description:
      "Manage public commission blacklist records with the branded pagination and moderation workflow.",
    href: "/admin/blacklist",
    label: "Manage Commission Blacklist",
  },
];

export default async function AdminDashboard() {
  await connection();
  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-gray-200 bg-linear-to-r from-blue-50 to-purple-50 p-8 dark:border-gray-800 dark:from-blue-950/30 dark:to-purple-950/30">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
          EXOCORPSE CMS
        </h2>
        <p className="mt-3 text-lg text-gray-700 dark:text-gray-300">
          Tuturuuu CMS is the only database and content store for this site.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {destinations.map((destination) => (
          <Link
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg dark:border-gray-800 dark:bg-gray-950"
            href={destination.href}
            key={destination.href}
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {destination.label}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {destination.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
