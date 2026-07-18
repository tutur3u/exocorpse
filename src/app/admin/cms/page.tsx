import { getAdminCmsStudio } from "@/lib/actions/cms";
import { connection } from "next/server";
import CmsAdminClient from "./CmsAdminClient";

export default async function CmsAdminPage() {
  await connection();
  return <CmsAdminClient initialStudio={await getAdminCmsStudio()} />;
}
