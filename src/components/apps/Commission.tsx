"use client";

import CommissionClient from "@/components/apps/CommissionClient";
import { useInitialCommissionData } from "@/contexts/InitialCommissionDataContext";

export default function Commission() {
  const initialData = useInitialCommissionData();

  return <CommissionClient initialData={initialData} />;
}
