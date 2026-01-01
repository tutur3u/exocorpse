"use client";

import { getPublicStories, type Story } from "@/lib/actions/wiki";
import { useQuery } from "@tanstack/react-query";

export function usePublicStories(initialData?: Story[]) {
  return useQuery({
    queryKey: ["stories"],
    queryFn: () => getPublicStories(),
    initialData,
  });
}
