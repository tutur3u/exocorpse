"use client";

import { getPublishedStories, type Story } from "@/lib/actions/wiki";
import { useQuery } from "@tanstack/react-query";

export function useStories(initialData?: Story[]) {
  return useQuery({
    queryKey: ["stories"],
    queryFn: () => getPublishedStories(),
    initialData,
  });
}
