import CmsManagementWorkspace from "@/components/admin/cms-management/CmsManagementWorkspace";
import StorageAnalytics from "@/components/admin/StorageAnalytics";
import {
  ADMIN_CMS_SECTIONS,
  type AdminCmsSectionKey,
} from "@/lib/admin-cms-sections";
import { buildExocorpseCmsUrl } from "@/lib/exocorpse-config";
import { getExocorpseCmsStudio } from "@/lib/tuturuuu-cms-repository";
import { connection } from "next/server";

export default async function AdminCmsSectionPage({
  sectionKey,
}: {
  sectionKey: AdminCmsSectionKey;
}) {
  await connection();
  const section = ADMIN_CMS_SECTIONS[sectionKey];
  const studio = await getExocorpseCmsStudio(section);
  return (
    <div
      className={
        sectionKey === "portfolio"
          ? "min-h-screen space-y-4 bg-gray-50 dark:bg-gray-900"
          : "space-y-4"
      }
    >
      {sectionKey !== "cms" ? <StorageAnalytics /> : null}
      <div
        className={
          sectionKey === "portfolio"
            ? "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
            : undefined
        }
      >
        <CmsManagementWorkspace
          cmsHref={buildExocorpseCmsUrl({ targetKey: "library" })}
          initialStudio={studio}
          section={section}
        />
      </div>
    </div>
  );
}
