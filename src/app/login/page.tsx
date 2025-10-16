import LoginForm from "@/components/LoginForm";
import Image from "next/image";
import { Suspense } from "react";

export default async function LoginPage(props: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await props.searchParams;
  const redirectTo = params.redirect || "/admin";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8">
        <div>
          <Image
            className="mx-auto"
            src="/exocorpse.png"
            alt="ExoCorpse Logo"
            width={100}
            height={100}
            priority={false}
          />
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Admin access only
          </p>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm redirectTo={redirectTo} />
        </Suspense>
      </div>
    </div>
  );
}
