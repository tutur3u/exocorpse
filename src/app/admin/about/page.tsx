import CmsLegacyAboutWorkspace from "@/components/admin/about/CmsLegacyAboutWorkspace";
import { ADMIN_CMS_SECTIONS } from "@/lib/admin-cms-sections";
import { getExocorpseCmsStudio } from "@/lib/tuturuuu-cms-repository";
import { connection } from "next/server";

export default async function AboutAdminPage() {
  await connection();
  const studio = await getExocorpseCmsStudio(ADMIN_CMS_SECTIONS.about);
  return <CmsLegacyAboutWorkspace initialStudio={studio} />;
}
