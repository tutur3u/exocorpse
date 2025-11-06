"use client";

import BlacklistTab from "@/components/apps/commission/BlacklistTab";
import ServiceDetail from "@/components/apps/commission/ServiceDetail";
import ServicesTab from "@/components/apps/commission/ServicesTab";
import TermsOfServiceTab from "@/components/apps/commission/TermsOfServiceTab";
import type { InitialCommissionData } from "@/contexts/InitialCommissionDataContext";
import {
  getActiveServices,
  getServiceBySlug,
  type ServiceWithDetails,
} from "@/lib/actions/commissions";
import { useQuery } from "@tanstack/react-query";
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";

type CommissionClientProps = {
  initialData: InitialCommissionData;
};

export default function CommissionClient({
  initialData,
}: CommissionClientProps) {
  const [params, setParams] = useQueryStates(
    {
      "commission-tab": parseAsStringLiteral([
        "services",
        "tos",
        "blacklist",
      ] as const),
      service: parseAsString,
      style: parseAsString,
    },
    {
      shallow: true,
      history: "push",
    },
  );

  const activeTabParam = params["commission-tab"];
  const serviceSlug = params.service;
  const styleSlug = params.style;

  // If a service is selected, show that instead of the tab content
  const activeTab = serviceSlug ? "services" : (activeTabParam ?? "services");

  // Query all services for the services tab (if not already loaded)
  const shouldFetchAllServices = activeTab === "services" && !serviceSlug;

  const { data: allServices } = useQuery<ServiceWithDetails[], Error>({
    queryKey: ["commission-services"],
    queryFn: getActiveServices,
    enabled: shouldFetchAllServices,
    initialData:
      initialData.services.length > 0 ? () => initialData.services : undefined,
  });

  // Query for selected service - fetch when serviceSlug changes
  const { data: selectedService = null } = useQuery<
    ServiceWithDetails | null,
    Error
  >({
    queryKey: ["commission-service", serviceSlug],
    queryFn: async () => {
      if (!serviceSlug) return null;
      return getServiceBySlug(serviceSlug);
    },
    enabled: !!serviceSlug,
  });

  const handleTabChange = (tab: "services" | "tos" | "blacklist") => {
    setParams({
      "commission-tab": tab,
      service: null,
      style: null,
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex border-b border-gray-300 dark:border-gray-700">
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "services"
              ? "border-b-2 border-blue-500 bg-gray-100 dark:bg-gray-800"
              : "hover:bg-gray-50 dark:hover:bg-gray-900"
          }`}
          onClick={() => handleTabChange("services")}
        >
          Services
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
        {activeTab === "services" && (
          <>
            {serviceSlug && selectedService ? (
              <ServiceDetail
                service={selectedService}
                selectedStyleSlug={styleSlug}
              />
            ) : (
              <ServicesTab services={allServices || []} />
            )}
          </>
        )}
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
