import { getCofiDatasetFromDb } from "@/lib/cofi-data";
import CofiSamplesShell from "./CofiSamplesShell";

export const metadata = {
  title: "COFI Samples - EXOCORPSE",
  description:
    "A smoother way to browse COFI April 2026 samples, powered by EXOCORPSE.",
};

export default async function CofiSamplesPage() {
  const dataset = await getCofiDatasetFromDb();

  return <CofiSamplesShell dataset={dataset} />;
}
