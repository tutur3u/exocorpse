import StorageAnalytics from "@/components/admin/StorageAnalytics";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Storage Analytics Section */}
      <StorageAnalytics />

      {/* Header Section */}
      <div className="rounded-xl border border-gray-200 bg-linear-to-r from-blue-50 to-purple-50 p-8 dark:border-gray-800 dark:from-blue-950/30 dark:to-purple-950/30">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
          Welcome to EXOCORPSE
        </h2>
        <p className="mt-3 text-lg text-gray-700 dark:text-gray-300">
          Central hub for managing your creative universe
        </p>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Manage stories, worlds, characters, portfolio, blog posts, and more
        </p>
      </div>

      {/* Wiki Management Section */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="h-1 w-12 rounded-full bg-linear-to-r from-blue-500 to-purple-500"></div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Wiki Management
          </h3>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Stories Card */}
          <Link
            href="/admin/stories"
            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl dark:border-gray-800 dark:bg-gray-950 dark:hover:border-blue-700"
          >
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-linear-to-br from-blue-500/10 to-purple-500/10"></div>
            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-purple-500 shadow-lg transition-transform group-hover:scale-110">
                <svg
                  className="h-7 w-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  role="img"
                  aria-labelledby="stories-icon-title"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                  <title id="stories-icon-title">Stories Icon</title>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Stories
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Create and manage story universes
              </p>
            </div>
          </Link>

          {/* Worlds Card */}
          <Link
            href="/admin/worlds"
            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl dark:border-gray-800 dark:bg-gray-950 dark:hover:border-indigo-700"
          >
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-linear-to-br from-indigo-500/10 to-cyan-500/10"></div>
            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-cyan-500 shadow-lg transition-transform group-hover:scale-110">
                <svg
                  className="h-7 w-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  role="img"
                  aria-labelledby="worlds-icon-title"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                  <title id="worlds-icon-title">Worlds Icon</title>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Worlds
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Build immersive world settings
              </p>
            </div>
          </Link>

          {/* Characters Card */}
          <Link
            href="/admin/characters"
            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-green-300 hover:shadow-xl dark:border-gray-800 dark:bg-gray-950 dark:hover:border-green-700"
          >
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-linear-to-br from-green-500/10 to-emerald-500/10"></div>
            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-green-500 to-emerald-500 shadow-lg transition-transform group-hover:scale-110">
                <svg
                  className="h-7 w-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  role="img"
                  aria-labelledby="characters-icon-title"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                  <title id="characters-icon-title">Characters Icon</title>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Characters
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Create detailed character profiles
              </p>
            </div>
          </Link>

          {/* Factions Card */}
          <Link
            href="/admin/factions"
            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-purple-300 hover:shadow-xl dark:border-gray-800 dark:bg-gray-950 dark:hover:border-purple-700"
          >
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-linear-to-br from-purple-500/10 to-pink-500/10"></div>
            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-purple-500 to-pink-500 shadow-lg transition-transform group-hover:scale-110">
                <svg
                  className="h-7 w-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  role="img"
                  aria-labelledby="factions-icon-title"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                  <title id="factions-icon-title">Factions Icon</title>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Factions
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Manage groups and organizations
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Content Management Section */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="h-1 w-12 rounded-full bg-linear-to-r from-amber-500 to-teal-500"></div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Content Management
          </h3>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Portfolio Card */}
          <Link
            href="/admin/portfolio"
            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl dark:border-gray-800 dark:bg-gray-950 dark:hover:border-amber-700"
          >
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-linear-to-br from-amber-500/10 to-yellow-500/10"></div>
            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-amber-500 to-yellow-500 shadow-lg transition-transform group-hover:scale-110">
                <svg
                  className="h-7 w-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  role="img"
                  aria-labelledby="portfolio-icon-title"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                  <title id="portfolio-icon-title">Portfolio Icon</title>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Portfolio
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Showcase art, writing, and game works
              </p>
            </div>
          </Link>

          {/* Blog Posts Card */}
          <Link
            href="/admin/blog-posts"
            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-teal-300 hover:shadow-xl dark:border-gray-800 dark:bg-gray-950 dark:hover:border-teal-700"
          >
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-linear-to-br from-teal-500/10 to-cyan-500/10"></div>
            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-teal-500 to-cyan-500 shadow-lg transition-transform group-hover:scale-110">
                <svg
                  className="h-7 w-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  role="img"
                  aria-labelledby="blog-posts-icon-title"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                  <title id="blog-posts-icon-title">Blog Posts Icon</title>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Blog Posts
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Write and publish blog content
              </p>
            </div>
          </Link>

          {/* Commission Services Card */}
          <Link
            href="/admin/services"
            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl dark:border-gray-800 dark:bg-gray-950 dark:hover:border-orange-700"
          >
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-linear-to-br from-orange-500/10 to-yellow-500/10"></div>
            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-orange-500 to-yellow-500 shadow-lg transition-transform group-hover:scale-110">
                <svg
                  className="h-7 w-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  role="img"
                  aria-labelledby="services-icon-title"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                  <title id="services-icon-title">Services Icon</title>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Commission Services
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Manage commission services and pricing
              </p>
            </div>
          </Link>

          {/* Add-ons Card */}
          <Link
            href="/admin/addons"
            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-pink-300 hover:shadow-xl dark:border-gray-800 dark:bg-gray-950 dark:hover:border-pink-700"
          >
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-linear-to-br from-pink-500/10 to-rose-500/10"></div>
            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-pink-500 to-rose-500 shadow-lg transition-transform group-hover:scale-110">
                <svg
                  className="h-7 w-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  role="img"
                  aria-labelledby="addons-icon-title"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                  <title id="addons-icon-title">Addons Icon</title>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Add-ons
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Configure service add-ons and extras
              </p>
            </div>
          </Link>

          {/* Blacklist Card */}
          <Link
            href="/admin/blacklist"
            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-red-300 hover:shadow-xl dark:border-gray-800 dark:bg-gray-950 dark:hover:border-red-700"
          >
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-linear-to-br from-red-500/10 to-orange-500/10"></div>
            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-red-500 to-orange-500 shadow-lg transition-transform group-hover:scale-110">
                <svg
                  className="h-7 w-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  role="img"
                  aria-labelledby="blacklist-icon-title"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                  <title id="blacklist-icon-title">Blacklist Icon</title>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Blacklist
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Manage restricted content
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
