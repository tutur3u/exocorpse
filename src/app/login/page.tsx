import {
  getExocorpseAdminLoginPath,
  resolveExocorpseAdminTargetKeyFromPath,
} from "@/lib/exocorpse-config";
import { redirect } from "next/navigation";

export const instant = false;

// /admin/tuturuuu/login is the only entry point that issues the one-use login
// state, so this page only hands off to it.
export default async function LoginPage(props: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await props.searchParams;

  redirect(
    getExocorpseAdminLoginPath(
      resolveExocorpseAdminTargetKeyFromPath(params.redirect),
    ),
  );
}
