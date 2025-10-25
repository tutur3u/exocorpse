"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

type NavItem = {
  href: string;
  label: string;
  exact?: boolean;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    label: "Wiki",
    items: [
      { href: "/admin/stories", label: "Stories" },
      { href: "/admin/worlds", label: "Worlds" },
      { href: "/admin/characters", label: "Characters" },
      { href: "/admin/factions", label: "Factions" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/portfolio", label: "Portfolio" },
      { href: "/admin/blog-posts", label: "Blog Posts" },
      { href: "/admin/blacklist", label: "Blacklist" },
    ],
  },
];

export default function AdminNav() {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const isSectionActive = (items: NavItem[]) => {
    return items.some((item) => isActive(item.href, item.exact));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedOutside = Object.values(dropdownRefs.current).every(
        (ref) => ref && !ref.contains(event.target as Node),
      );

      if (clickedOutside) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="hidden gap-1 lg:flex">
      {/* Dashboard Link */}
      <Link
        href="/admin"
        className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          pathname === "/admin"
            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
        }`}
      >
        Dashboard
      </Link>

      {/* Dropdown Sections */}
      {navSections.map((section) => {
        const active = isSectionActive(section.items);
        const isOpen = openDropdown === section.label;

        return (
          <div
            key={section.label}
            className="relative"
            ref={(el) => {
              dropdownRefs.current[section.label] = el;
            }}
          >
            <button
              type="button"
              onClick={() =>
                setOpenDropdown(isOpen ? null : section.label)
              }
              className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              }`}
              aria-expanded={isOpen}
              aria-haspopup="true"
            >
              {section.label}
              <svg
                className={`h-4 w-4 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 min-w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                {section.items.map((item) => {
                  const itemActive = isActive(item.href, item.exact);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpenDropdown(null)}
                      className={`block px-4 py-2 text-sm transition-colors ${
                        itemActive
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
