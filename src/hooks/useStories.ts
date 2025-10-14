"use client";

import { getPublishedStories } from "@/lib/actions/wiki";
import { useQuery } from "@tanstack/react-query";

export function useStories() {
  return useQuery({
    queryKey: ["stories"],
    queryFn: () => getPublishedStories(),
  });
}
