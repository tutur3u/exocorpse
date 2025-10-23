"use client";

import BlacklistTab from "@/components/apps/commission/BlacklistTab";
import InfoTab from "@/components/apps/commission/InfoTab";
import PricingTab from "@/components/apps/commission/PricingTab";
import TermsOfServiceTab from "@/components/apps/commission/TermsOfServiceTab";
import type { InitialCommissionData } from "@/contexts/InitialCommissionDataContext";
import { parseAsStringLiteral, useQueryStates } from "nuqs";

type CommissionClientProps = {
  initialData: InitialCommissionData;
};

export default function CommissionClient({
  initialData,
}: CommissionClientProps) {
  const [params, setParams] = useQueryStates(
    {
      "commission-tab": parseAsStringLiteral([
        "info",
        "pricing",
        "tos",
        "blacklist",
      ] as const),
    },
    {
      shallow: true,
      history: "push",
    },
  );

  const activeTabParam = params["commission-tab"];
  const activeTab = activeTabParam ?? "info";

  const handleTabChange = (tab: "info" | "pricing" | "tos" | "blacklist") => {
    setParams({
      "commission-tab": tab,
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex border-b border-gray-300 dark:border-gray-700">
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "info"
              ? "border-b-2 border-blue-500 bg-gray-100 dark:bg-gray-800"
              : "hover:bg-gray-50 dark:hover:bg-gray-900"
          }`}
          onClick={() => handleTabChange("info")}
        >
          Info
        </button>
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "pricing"
              ? "border-b-2 border-blue-500 bg-gray-100 dark:bg-gray-800"
              : "hover:bg-gray-50 dark:hover:bg-gray-900"
          }`}
          onClick={() => handleTabChange("pricing")}
        >
          Pricing
        </button>
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "tos"
              ? "border-b-2 border-blue-500 bg-gray-100 dark:bg-gray-800"
              : "hover:bg-gray-50 dark:hover:bg-gray-900"
          }`}
          onClick={() => handleTabChange("tos")}
        >
          Terms of Service
        </button>
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "blacklist"
              ? "border-b-2 border-blue-500 bg-gray-100 dark:bg-gray-800"
              : "hover:bg-gray-50 dark:hover:bg-gray-900"
          }`}
          onClick={() => handleTabChange("blacklist")}
        >
          Blacklist
        </button>
      </div>
      <div className="flex-1 overflow-auto p-6">
        {activeTab === "info" && <InfoTab />}
        {activeTab === "pricing" && <PricingTab />}
        {activeTab === "tos" && <TermsOfServiceTab />}
        {activeTab === "blacklist" && (
          <BlacklistTab
            initialBlacklistedUsers={initialData.blacklistedUsers}
            initialTotal={initialData.blacklistTotal}
            initialPage={initialData.blacklistPage}
            initialPageSize={initialData.blacklistPageSize}
          />
        )}
      </div>
    </div>
  );
}
