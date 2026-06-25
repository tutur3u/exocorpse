import { buildExocorpseCentralizedLoginUrl } from "@/lib/exocorpse-config";
import { redirect } from "next/navigation";

export default async function LoginPage(props: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await props.searchParams;
  const redirectTo = params.redirect || "/admin";

  redirect(buildExocorpseCentralizedLoginUrl({ nextUrl: redirectTo }));
}
