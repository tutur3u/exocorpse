import { getAllBlogPostsPaginated } from "@/lib/actions/blog";
import BlogPostsClient from "./BlogPostsClient";

const DEFAULT_PAGE_SIZE = 9;

type SearchParams = Promise<{
  page?: string;
  pageSize?: string;
}>;

export default async function BlogPostsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = Math.min(
    Math.max(Number(params.pageSize) || DEFAULT_PAGE_SIZE, 1),
    100,
  ); // Clamp between 1 and 100

  const initialData = await getAllBlogPostsPaginated(page, pageSize);

  return <BlogPostsClient initialData={initialData} pageSize={pageSize} />;
}
