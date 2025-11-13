import ListDetail, { type ListDetailItem } from "@/components/ListDetail";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";
import StorageImage from "@/components/shared/StorageImage";
import { useBatchStorageUrls } from "@/hooks/useStorageUrl";
import type { Story } from "@/lib/actions/wiki";

type StoriesViewProps = {
  stories: Story[];
  onStorySelect: (story: Story) => void;
};

export default function StoriesView({
  stories,
  onStorySelect,
}: StoriesViewProps) {
  // Batch fetch all story background images for optimal performance
  // Only fetch signed URLs for storage paths (non-HTTP URLs)
  const storyImagePaths = stories
    .map((s) => s.theme_background_image)
    .filter((p): p is string => !!p && !p.startsWith("http"));
  const { signedUrls: storyImageUrls } = useBatchStorageUrls(storyImagePaths);

  const storyItems: Array<ListDetailItem<string, Story>> = stories.map(
    (story) => ({
      id: story.id,
      title: story.title,
      subtitle: story.summary || undefined,
      data: story,
    }),
  );

  return (
    <div className="flex min-h-full flex-col bg-linear-to-br from-gray-900 to-gray-950">
      <div className="sticky top-0 z-10 border-b border-gray-700 bg-linear-to-br from-gray-900 to-gray-950 px-6 py-4">
        <div>
          <h3 className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
            Stories
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Explore creative worlds
          </p>
        </div>
      </div>

      {stories.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
              <svg
                className="h-10 w-10 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h4 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
              No stories yet
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Check back later for new stories
            </p>
          </div>
        </div>
      ) : (
        <ListDetail
          items={storyItems}
          fullscreen
          indexLayout="grid"
          renderItemCard={(item) => (
            <div
              onClick={() => onStorySelect(item.data)}
              className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800"
            >
              {/* Cover Image / Gradient */}
              <div className="relative h-48 overflow-hidden bg-linear-to-br from-blue-500 via-purple-500 to-pink-500">
                {item.data.theme_background_image ? (
                  <>
                    <StorageImage
                      src={item.data.theme_background_image}
                      signedUrl={storyImageUrls.get(
                        item.data.theme_background_image,
                      )}
                      alt={item.title}
                      width={400}
                      height={192}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
                )}

                {/* Status Badge */}
                {item.data.is_published && (
                  <div className="absolute top-2 right-2 rounded-full bg-green-500/90 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    Published
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h4 className="mb-1 text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                  {item.title}
                </h4>
                {item.subtitle && (
                  <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                    {item.subtitle}
                  </p>
                )}
              </div>

              {/* Hover Overlay */}
              <div className="pointer-events-none absolute inset-0 rounded-xl border-2 border-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          )}
          renderDetail={(item) => (
            <div className="space-y-6">
              {/* Cover Image in Detail */}
              {item.data.theme_background_image && (
                <div className="h-48 overflow-hidden rounded-xl bg-linear-to-br from-blue-500 to-purple-500">
                  <StorageImage
                    src={item.data.theme_background_image}
                    signedUrl={storyImageUrls.get(
                      item.data.theme_background_image,
                    )}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    width={1280}
                    height={720}
                  />
                </div>
              )}

              {/* Description */}
              {item.data.description && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                  <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Description
                  </h4>
                  <MarkdownRenderer
                    content={item.data.description}
                    className="prose prose-sm dark:prose-invert max-w-none"
                  />
                </div>
              )}

              {/* Theme Colors */}
              {(item.data.theme_primary_color ||
                item.data.theme_secondary_color) && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                  <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Theme Colors
                  </h4>
                  <div className="flex gap-3">
                    {item.data.theme_primary_color && (
                      <div className="flex items-center gap-2">
                        <div
                          className="h-8 w-8 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                          style={{
                            backgroundColor: item.data.theme_primary_color,
                          }}
                        />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          Primary
                        </span>
                      </div>
                    )}
                    {item.data.theme_secondary_color && (
                      <div className="flex items-center gap-2">
                        <div
                          className="h-8 w-8 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                          style={{
                            backgroundColor: item.data.theme_secondary_color,
                          }}
                        />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          Secondary
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onStorySelect(item.data)}
                  className="flex-1 rounded-lg bg-linear-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Explore Worlds
                </button>
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}
