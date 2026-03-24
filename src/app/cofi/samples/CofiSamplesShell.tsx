"use client";

import type { CofiDataset } from "@/data/cofi/types";
import { useEffect, useState } from "react";
import CofiSamplesClient from "./CofiSamplesClient";

type Props = {
  dataset: CofiDataset;
};

function LoadingShell() {
  return (
    <main className="h-screen overflow-x-hidden overflow-y-auto bg-[#04050a] text-[#f4efdd]">
      <div className="relative min-h-full overflow-hidden bg-[linear-gradient(180deg,rgba(2,4,9,0.98),rgba(3,4,9,1))]">
        <section className="relative mx-auto flex w-full max-w-[1800px] flex-col gap-8 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <div className="overflow-hidden rounded-[1.6rem] border border-[#ccb07d]/22 bg-[linear-gradient(180deg,rgba(8,12,24,0.92),rgba(7,10,18,0.94))] p-8 shadow-[0_32px_90px_rgba(0,0,0,0.55)] sm:rounded-[2rem]">
            <p className="text-[0.72rem] tracking-[0.38em] text-[#d2ac71] uppercase">
              COFI Samples
            </p>
            <h1 className="font-[Baskerville,Palatino Linotype,Book Antiqua,serif] mt-3 text-3xl leading-none font-semibold text-[#fbf0de] sm:text-5xl">
              Loading the COFI archive vessel.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#d4c8b7] sm:text-base">
              Preparing the EXOCORPSE browser and current sample records.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function CofiSamplesShell({ dataset }: Props) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <LoadingShell />;
  }

  return <CofiSamplesClient dataset={dataset} />;
}
