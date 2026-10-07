import LogoutButton from "@/components/admin/LogoutButton";
import AdminNav from "@/components/admin/AdminNav";
import AdminSessionKeeper from "@/components/admin/AdminSessionKeeper";
import AdminUserMenu from "@/components/admin/AdminUserMenu";
import { requireAdminSession } from "@/lib/auth/utils";
import { buildExocorpseTasksUrl } from "@/lib/exocorpse-config";
import Link from "next/link";
import { connection } from "next/server";
import type { ReactNode } from "react";

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await connection();
  const session = await requireAdminSession();
  const tasksHref = buildExocorpseTasksUrl({
    workspaceId: session.workspaceId,
  });
  return (
    <div className="flex h-screen flex-col bg-gray-50 [--radius:0.5rem] dark:bg-gray-900">
      {/* Admin Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center justify-between md:flex-none md:justify-start md:gap-8">
              <Link
                href="/admin"
                className="flex items-center text-2xl font-bold text-gray-900 transition-colors hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
              >
                EXOCORPSE
              </Link>
              <AdminNav tasksHref={tasksHref}>
                <div className="flex flex-col gap-3 px-4">
                  <AdminUserMenu initialUser={session.user} />
                  <LogoutButton />
                  <Link
                    href="/"
                    className="rounded-lg bg-gray-100 px-4 py-2 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Back to Site
                  </Link>
                </div>
              </AdminNav>
            </div>
            <div className="hidden items-center gap-3 lg:flex">
              <AdminUserMenu initialUser={session.user} />
              <LogoutButton />
              <Link
                href="/"
                className="rounded-lg bg-gray-100 px-4 py-2 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Back to Site
              </Link>
            </div>
          </div>
        </div>
      </header>
      {session.refreshToken ? (
        <AdminSessionKeeper
          expiresAt={session.expiresAt}
          refreshEarlySeconds={session.refreshEarlySeconds}
        />
      ) : null}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
