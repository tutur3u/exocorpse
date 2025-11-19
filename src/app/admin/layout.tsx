import AdminNav from "@/components/admin/AdminNav";
import LogoutButton from "@/components/admin/LogoutButton";
import { requireAuth } from "@/lib/auth/utils";
import Link from "next/link";
import type { ReactNode } from "react";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Verify authentication at the server component level
  const user = await requireAuth();
  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* Admin Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center justify-between lg:flex-none lg:justify-start lg:gap-8">
              <Link
                href="/admin"
                className="flex items-center text-2xl font-bold text-gray-900 transition-colors hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
              >
                EXOCORPSE
              </Link>
              <AdminNav>
                <div className="mb-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                  {user.email}
                </div>
                <div className="flex flex-col gap-2 px-4">
                  <Link
                    href="/"
                    className="flex items-center justify-center rounded-lg bg-gray-100 px-4 py-2 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Back to Site
                  </Link>
                  <LogoutButton />
                </div>
              </AdminNav>
            </div>
            <div className="hidden items-center gap-3 lg:flex">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user.email}
              </span>
              <LogoutButton />
              <Link
                href="/"
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Back to Site
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
