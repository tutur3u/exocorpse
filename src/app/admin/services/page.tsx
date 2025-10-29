import { getAllAddons, getAllServices } from "@/lib/actions/commissions";
import ServicesClient from "./ServicesClient";

export default async function ServicesAdminPage() {
  // Load initial data on the server
  const [services, addons] = await Promise.all([
    getAllServices(),
    getAllAddons(),
  ]);

  return <ServicesClient initialServices={services} initialAddons={addons} />;
}
