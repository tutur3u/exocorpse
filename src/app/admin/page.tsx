import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { adminNavigation } from "@/components/admin/admin-navigation";
import StorageAnalytics from "@/components/admin/StorageAnalytics";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="@container space-y-6">
      <AdminPageHeader
        title="Dashboard"
        description="Manage your site content and creative universe."
      />
      {adminNavigation.map((section) => (
        <section
          key={section.label}
          aria-labelledby={`dashboard-${section.label}`}
        >
          <h2
            id={`dashboard-${section.label}`}
            className="mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400"
          >
            {section.label}
          </h2>
          <div className="grid gap-2 @sm:grid-cols-2 @3xl:grid-cols-3">
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-blue-400 hover:bg-blue-50/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-blue-600 dark:hover:bg-blue-950/20"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                  <item.icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {item.label}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
                <ArrowUpRight
                  className="mt-1 size-4 shrink-0 text-gray-400 group-hover:text-blue-600"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </section>
      ))}
      <StorageAnalytics />
    </div>
  );
}
