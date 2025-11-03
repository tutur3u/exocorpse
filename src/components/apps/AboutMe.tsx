"use client";

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
    <div className="flex h-full flex-col">
      {/* Tab Navigation */}
      <div className="grid grid-cols-4 gap-2" role="tablist">
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
                ? "border-b-2 border-blue-500 bg-gray-100 text-blue-600 dark:bg-gray-800 dark:text-blue-400"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-100"
            }`}
            onClick={() => setActiveTab(id)}
          >
            <Icon className="h-5 w-5 md:h-4 md:w-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div
        className="flex-1 overflow-auto p-6"
        role="tabpanel"
        id={`${activeTab}-panel`}
        aria-labelledby={`${activeTab}-tab`}
      >
        {renderTabContent()}
      </div>
    </div>
  );
}
