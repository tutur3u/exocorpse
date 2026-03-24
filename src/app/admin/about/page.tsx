import StorageAnalytics from "@/components/admin/StorageAnalytics";
import { getAboutAdminData } from "@/lib/actions/about";
import AboutClient from "./AboutClient";

export default async function AboutAdminPage() {
  const initialData = await getAboutAdminData();

  return (
    <div className="space-y-4">
      <StorageAnalytics />
      <AboutClient initialData={initialData} />
    </div>
  );
}
