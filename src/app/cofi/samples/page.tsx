import dynamic from "next/dynamic";
import Image from "next/image";
import { getCofiDatasetFromDb } from "@/lib/cofi-data";

const LOADING_SIGIL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23d23642'/%3E%3Cstop offset='100%25' stop-color='%232d49d8'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='60' cy='60' r='53' fill='none' stroke='url(%23g)' stroke-width='6' opacity='0.9'/%3E%3Cpath d='M28 60h64M60 28v64' stroke='%23f4efdd' stroke-width='4' stroke-linecap='round' opacity='0.7'/%3E%3Ccircle cx='60' cy='60' r='14' fill='%23f4efdd' fill-opacity='0.18' stroke='%23f4efdd' stroke-width='3'/%3E%3C/svg%3E";

const CofiSamplesClient = dynamic(() => import("./CofiSamplesClient"), {
  loading: () => (
    <main className="flex min-h-screen items-center justify-center bg-[#04050a] px-6 text-[#f4efdd]">
      <div className="rounded-[1.5rem] border border-[#ccb07d]/18 bg-[linear-gradient(180deg,rgba(12,18,32,0.94),rgba(8,11,19,0.98))] px-6 py-5 text-center shadow-[0_18px_45px_rgba(0,0,0,0.26)]">
        <Image
          src={LOADING_SIGIL}
          alt=""
          width={72}
          height={72}
          unoptimized
          priority
          className="mx-auto"
        />
        <p className="text-[0.72rem] tracking-[0.28em] text-[#b39165] uppercase">
          COFI Samples
        </p>
        <p className="font-[Baskerville,Palatino Linotype,Book Antiqua,serif] mt-3 text-2xl font-semibold text-[#fff6de]">
          Loading archive viewer
        </p>
      </div>
    </main>
  ),
});

export const metadata = {
  title: "COFI Samples - EXOCORPSE",
  description:
    "A smoother way to browse COFI April 2026 samples, powered by EXOCORPSE.",
};

export default async function CofiSamplesPage() {
  const dataset = await getCofiDatasetFromDb();

  return <CofiSamplesClient dataset={dataset} />;
}
