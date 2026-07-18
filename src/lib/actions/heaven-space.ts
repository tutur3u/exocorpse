"use server";

import { getCmsHeavenSpacePassages } from "@/lib/tuturuuu-cms-delivery";
import type { HeavenSpacePassage } from "@/lib/heaven-space/runtime";

export async function getHeavenSpacePassages(): Promise<HeavenSpacePassage[]> {
  return (await getCmsHeavenSpacePassages()) ?? [];
}
