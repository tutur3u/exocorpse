"use client";

import StorageImage from "@/components/shared/StorageImage";
import { useInitialAboutData } from "@/contexts/InitialAboutDataContext";
import type { AboutPageData } from "@/lib/about";
import { getAboutPageData } from "@/lib/actions/about";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, HelpCircle, Sparkles, User } from "lucide-react";
import { type ComponentType, useState } from "react";
import AboutTab from "./about/AboutTab";
import DniTab from "./about/DniTab";
import FaqTab from "./about/FaqTab";
import SocialsTab from "./about/SocialsTab";

type TabType = "about" | "faq" | "dni" | "socials";

interface TabConfig {
  id: TabType;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const tabs: TabConfig[] = [
  { id: "about", label: "About", icon: User },
  { id: "faq", label: "FAQ", icon: HelpCircle },
  { id: "dni", label: "DNI", icon: AlertCircle },
  { id: "socials", label: "Socials", icon: Sparkles },
];

export default function AboutMe() {
  const initialData = useInitialAboutData();
  const [activeTab, setActiveTab] = useState<TabType>("about");
  const { data = initialData, isLoading } = useQuery<AboutPageData>({
    queryKey: ["about-page"],
    queryFn: getAboutPageData,
    initialData,
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case "about":
        return <AboutTab data={data} />;
      case "faq":
        return <FaqTab data={data} />;
      case "dni":
        return <DniTab data={data} />;
      case "socials":
        return <SocialsTab data={data} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full flex-col overflow-auto bg-linear-to-br from-gray-900 to-gray-950">
      {/* Header Section - scrolls off first */}
      <div className="mx-auto flex flex-col gap-6 p-6 md:flex-row md:gap-10">
        <div className="flex items-center justify-center">
          <StorageImage
            src={data.settings.hero_image_url || "/LykoTwins.webp"}
            alt={data.settings.hero_image_alt || "About Me"}
            width={256}
            height={256}
            className="rounded-xl object-cover"
          />
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-center text-2xl font-bold md:text-left">
              {data.settings.hero_name}
            </h1>
            <p className="text-center text-gray-600 md:ml-4 md:text-left dark:text-gray-400">
              {data.settings.hero_subtitle}
            </p>
          </div>
          <div className="max-w-2xl whitespace-pre-line">
            {data.settings.hero_bio}
          </div>
        </div>
      </div>

      {/* Tab Navigation - sticky */}
      <div
        className="sticky top-0 z-10 grid grid-cols-4 gap-2 border-t border-gray-700 bg-gray-900"
        role="tablist"
      >
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            type="button"
            key={id}
            role="tab"
            id={`${id}-tab`}
            aria-selected={activeTab === id}
            aria-controls={`${id}-panel`}
            tabIndex={activeTab === id ? 0 : -1}
            className={`flex items-center justify-center gap-2 font-medium transition-all md:px-4 md:py-3 ${
              activeTab === id
                ? "border-b-2 border-blue-500 text-blue-400 dark:bg-gray-800"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-100"
            }`}
            onClick={() => setActiveTab(id)}
          >
            <Icon className="h-5 w-5 md:h-4 md:w-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content - scrolls normally */}
      <div
        className="p-6"
        role="tabpanel"
        id={`${activeTab}-panel`}
        aria-labelledby={`${activeTab}-tab`}
      >
        {isLoading ? (
          <div className="flex min-h-48 items-center justify-center">
            <div className="text-sm text-gray-400">Loading about page...</div>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  );
}
