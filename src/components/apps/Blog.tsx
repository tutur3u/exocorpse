"use client";

import BlogClient from "@/components/apps/BlogClient";
import { useInitialBlogData } from "@/contexts/InitialBlogDataContext";

export default function Blog() {
  const initialData = useInitialBlogData();

  return <BlogClient initialData={initialData} />;
}
