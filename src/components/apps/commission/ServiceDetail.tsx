"use client";

import { MasonryGallery } from "@/components/apps/Gallery";
import { useBatchStorageUrls } from "@/hooks/useStorageUrl";
import type { ServiceWithDetails } from "@/lib/actions/commissions";
import { parseAsString, useQueryStates } from "nuqs";

type ServiceDetailProps = {
  service: ServiceWithDetails;
  selectedStyleSlug: string | null;
};

export default function ServiceDetail({
  service,
  selectedStyleSlug,
}: ServiceDetailProps) {
  const [, setParams] = useQueryStates(
    {
      service: parseAsString,
      style: parseAsString,
    },
    {
      shallow: true,
      history: "push",
    },
  );

  // Determine which style to show based on URL param
  const styles = service.styles || [];
  const selectedStyle = selectedStyleSlug
    ? styles.find((s) => s.slug === selectedStyleSlug)
    : styles[0]; // Default to first style if no selection

  // Get pictures for the selected style or service-level pictures
  const displayPictures = selectedStyle?.pictures || service.pictures || [];

  // Batch fetch all picture URLs from all styles and service
  const allPicturePaths = [
    ...(service.pictures?.map((pic) => pic.image_url) || []),
    ...styles.flatMap(
      (style) => style.pictures?.map((pic) => pic.image_url) || [],
    ),
  ];
  const { signedUrls, loading } = useBatchStorageUrls(allPicturePaths);

  // Convert pictures to gallery format with signed URLs and metadata
  const galleryImages = displayPictures.map((picture, idx) => ({
    id: picture.picture_id ?? `${idx}`,
    url: signedUrls.get(picture.image_url) ?? picture.image_url,
    alt: `${service.name} example ${idx + 1}`,
    title: picture.caption ?? service.name,
  }));

  const handleBack = () => {
    setParams({
      service: null,
      style: null,
    });
  };

  const handleStyleChange = (styleSlug: string) => {
    setParams({
      style: styleSlug,
    });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header with back button */}
      <div className="mb-4 flex items-center border-b border-gray-300 pb-4 dark:border-gray-700">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <span className="mr-2 text-xl">←</span>
          <span className="font-medium">back</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Gallery - using shared MasonryGallery with 2 columns */}
          <div className="h-full lg:col-span-2">
            <MasonryGallery
              images={galleryImages}
              isLoading={loading}
              columnsBreakpoints={{ 350: 1, 750: 2, 1024: 2, 1280: 2 }}
              maxWidth="max-w-3xl"
            />
          </div>

          {/* Right Column: Details - Fixed width */}
          <div className="space-y-6 lg:overflow-auto">
            {/* Service Title and Price */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 uppercase dark:text-white">
                {service.name}
              </h1>
              <p className="mt-2 text-xl text-gray-700 dark:text-gray-300">
                starting from:{" "}
                <span className="font-bold">€{service.base_price}</span>
              </p>
            </div>

            {/* Style Examples Toggle (if multiple styles exist) */}
            {styles.length > 1 && (
              <div>
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  style examples
                </h3>
                <div className="flex gap-2">
                  {styles.map((style) => {
                    const isActive = selectedStyle?.style_id === style.style_id;
                    return (
                      <button
                        type="button"
                        key={style.style_id}
                        onClick={() => handleStyleChange(style.slug)}
                        className={`rounded-lg px-4 py-2 font-medium transition ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        }`}
                      >
                        {style.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add-ons */}
            {service.service_addons && service.service_addons.length > 0 && (
              <div>
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  add ons:
                </h3>
                <ul className="space-y-2">
                  {service.service_addons.map((sa) => (
                    <li
                      key={sa.addon_id}
                      className="flex items-start text-gray-700 dark:text-gray-300"
                    >
                      <span className="mr-2">•</span>
                      <div>
                        <span className="font-medium">{sa.addons?.name}</span>:{" "}
                        <span className="text-green-600 dark:text-green-400">
                          +{sa.addons?.price_impact}
                          {sa.addons?.percentage ? "%" : "€"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Service Description */}
            {service.description && (
              <div>
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  Description:
                </h3>
                <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                  {service.description}
                </p>
              </div>
            )}

            {/* Commission Link Button */}
            {service.comm_link && (
              <div className="mt-6">
                <a
                  href={service.comm_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full rounded-lg bg-linear-to-r from-purple-500 to-pink-500 px-6 py-3 text-center font-bold text-white shadow-lg transition hover:from-purple-600 hover:to-pink-600"
                >
                  officiate a request.
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
