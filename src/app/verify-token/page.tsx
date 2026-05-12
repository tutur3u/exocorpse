import { VerifyTokenClient } from "@/components/VerifyTokenClient";
import { LoaderCircle } from "lucide-react";
import { Suspense } from "react";

function VerifyTokenFallback() {
  return (
    <>
      <div className="flex size-12 items-center justify-center rounded-xl border border-blue-300/30 bg-blue-400/12 text-blue-100">
        <LoaderCircle className="size-5 animate-spin" />
      </div>
      <h1 className="mt-5 text-3xl font-black text-white">
        Connecting Exocorpse
      </h1>
      <p className="mt-3 text-sm leading-6 text-white/64">
        Finishing centralized Tuturuuu authentication.
      </p>
    </>
  );
}

export default function VerifyTokenPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-gray-950 px-6 text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/12 bg-white/[0.04] p-6 shadow-2xl">
        <Suspense fallback={<VerifyTokenFallback />}>
          <VerifyTokenClient />
        </Suspense>
      </section>
    </main>
  );
}
