import CmsManagementWorkspace from "@/components/admin/cms-management/CmsManagementWorkspace";
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
  const studio = await getExocorpseCmsStudio();
  return (
    <CmsManagementWorkspace
      cmsHref={buildExocorpseCmsUrl({ targetKey: "library" })}
      initialStudio={studio}
      section={ADMIN_CMS_SECTIONS[sectionKey]}
    />
  );
}
