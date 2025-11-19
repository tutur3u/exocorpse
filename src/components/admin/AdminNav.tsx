"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
      { href: "/admin/locations", label: "Locations" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/portfolio", label: "Portfolio" },
      { href: "/admin/blog-posts", label: "Blog Posts" },
      { href: "/admin/services", label: "Commission Services" },
      { href: "/admin/addons", label: "Add-ons" },
      { href: "/admin/blacklist", label: "Blacklist" },
    ],
  },
];

export default function AdminNav({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileSections, setExpandedMobileSections] = useState<
    string[]
  >([]);
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

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const toggleMobileSection = (label: string) => {
    setExpandedMobileSections((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label],
    );
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        type="button"
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 lg:hidden dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={() => setMobileMenuOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Desktop Nav */}
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
                onClick={() => setOpenDropdown(isOpen ? null : section.label)}
                className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                }`}
                aria-expanded={isOpen}
                aria-haspopup="true"
              >
                {section.label}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="absolute top-full left-0 z-50 mt-1 min-w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
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

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-white lg:hidden dark:bg-gray-950">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-gray-800">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              Menu
            </span>
            <button
              type="button"
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 pb-24">
            <div className="flex flex-col gap-2">
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                  pathname === "/admin"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                }`}
              >
                Dashboard
              </Link>

              {navSections.map((section) => {
                const isExpanded = expandedMobileSections.includes(
                  section.label,
                );
                const active = isSectionActive(section.items);

                return (
                  <div key={section.label} className="flex flex-col">
                    <button
                      onClick={() => toggleMobileSection(section.label)}
                      className={`flex items-center justify-between rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                        active
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                      }`}
                    >
                      {section.label}
                      <ChevronDown
                        className={`h-5 w-5 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="mt-1 ml-4 flex flex-col gap-1 border-l-2 border-gray-100 pl-4 dark:border-gray-800">
                        {section.items.map((item) => {
                          const itemActive = isActive(item.href, item.exact);
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                itemActive
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
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
            </div>
            {children && (
              <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-800">
                {children}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
