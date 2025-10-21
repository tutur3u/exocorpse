"use client";

import type { BlogPost } from "@/lib/actions/blog";
import { createContext, useContext, type ReactNode } from "react";

export type InitialBlogData = {
  posts: BlogPost[];
  total: number;
  page: number;
  pageSize: number;
  selectedPost: BlogPost | null;
};

const InitialBlogDataContext = createContext<InitialBlogData | undefined>(
  undefined,
);

export function InitialBlogDataProvider({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: InitialBlogData;
}) {
  return (
    <InitialBlogDataContext.Provider value={initialData}>
      {children}
    </InitialBlogDataContext.Provider>
  );
}

export function useInitialBlogData() {
  const context = useContext(InitialBlogDataContext);
  if (context === undefined) {
    throw new Error(
      "useInitialBlogData must be used within InitialBlogDataProvider",
    );
  }
  return context;
}
