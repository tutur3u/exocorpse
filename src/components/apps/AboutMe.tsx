"use client";

import { AlertCircle, HelpCircle, Sparkles, User } from "lucide-react";
import Image from "next/image";
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
  const [activeTab, setActiveTab] = useState<TabType>("about");

  const renderTabContent = () => {
    switch (activeTab) {
      case "about":
        return <AboutTab />;
      case "faq":
        return <FaqTab />;
      case "dni":
        return <DniTab />;
      case "socials":
        return <SocialsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full flex-col overflow-auto bg-linear-to-br from-gray-900 to-gray-950">
      {/* Header Section - scrolls off first */}
      <div className="mx-auto flex flex-col gap-6 p-6 md:flex-row md:gap-10">
        <div className="flex items-center justify-center">
          <Image
            src="/LykoTwins.webp"
            alt="About Me"
            width={256}
            height={256}
            className="rounded-xl object-cover"
          />
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-center text-2xl font-bold md:text-left">
              Fenrys & Morris
            </h1>
            <p className="text-center text-gray-600 md:ml-4 md:text-left dark:text-gray-400">
              Freelance Illustrator, Writer & Game Developer
            </p>
          </div>
          <div className="max-w-2xl">
            I'm Fenrys & Morris, an illustrator and writer duo in one. I
            specialize in illustrative works, story & dialogue writing, and
            sprite work for game development. I try to be a jack of all trades
            while trying to keep my limits behind creative work as much as
            possible. Fenrys serves as the artist representative, while Morris
            as the writer representative. They represent me as a branding and as
            who I am.
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
                ? "border-b-2 border-blue-500 dark:bg-gray-800 text-blue-400"
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
        {renderTabContent()}
      </div>
    </div>
  );
}
