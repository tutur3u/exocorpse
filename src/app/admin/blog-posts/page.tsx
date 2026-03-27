import StorageAnalytics from "@/components/admin/StorageAnalytics";
import { getAllBlogPostsPaginated } from "@/lib/actions/blog";
import BlogPostsClient from "./BlogPostsClient";

const DEFAULT_PAGE_SIZE = 9;
export const dynamic = "force-dynamic";

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
  const rawPage = Number(params.page);
  const rawPageSize = Number(params.pageSize);
  const page =
    Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const pageSize = Math.min(
    Math.max(
      Number.isFinite(rawPageSize) && rawPageSize > 0
        ? Math.floor(rawPageSize)
        : DEFAULT_PAGE_SIZE,
      1,
    ),
    100,
  );

  try {
    const initialData = await getAllBlogPostsPaginated(page, pageSize);

    return (
      <div className="space-y-6">
        <StorageAnalytics />
        <BlogPostsClient initialData={initialData} pageSize={pageSize} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return (
      <div className="rounded-[1.75rem] border border-red-200/80 bg-white p-8 shadow-sm dark:border-red-900/60 dark:bg-zinc-950">
        <p className="text-xs font-semibold tracking-[0.35em] text-red-600 uppercase dark:text-red-400">
          Blog Control Room
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-zinc-950 dark:text-zinc-50">
          Blog posts could not be loaded
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          The admin route failed while fetching blog data. Check the server logs
          for the underlying error and reload the page after fixing it.
        </p>
      </div>
    );
  }
}
