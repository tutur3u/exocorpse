"use client";

import { useState } from "react";
import { FaInfoCircle, FaQuestionCircle, FaUser } from "react-icons/fa";
import { IoSparkles } from "react-icons/io5";
import AboutTab from "./about/AboutTab";
import DniTab from "./about/DniTab";
import FaqTab from "./about/FaqTab";
import SocialsTab from "./about/SocialsTab";

type TabType = "about" | "faq" | "dni" | "socials";

interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: TabConfig[] = [
  { id: "about", label: "About", icon: FaUser },
  { id: "faq", label: "FAQ", icon: FaQuestionCircle },
  { id: "dni", label: "DNI", icon: FaInfoCircle },
  { id: "socials", label: "Socials", icon: IoSparkles },
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
      <div className="flex border-b border-gray-300 dark:border-gray-700">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            type="button"
            key={id}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-all ${
              activeTab === id
                ? "border-b-2 border-blue-500 bg-gray-100 text-blue-600 dark:bg-gray-800 dark:text-blue-400"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-100"
            }`}
            onClick={() => setActiveTab(id)}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-6">{renderTabContent()}</div>
    </div>
  );
}
