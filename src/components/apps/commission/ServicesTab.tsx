"use client";

import StorageImage from "@/components/shared/StorageImage";
import { useBatchStorageUrls } from "@/hooks/useStorageUrl";
import type { ServiceWithDetails } from "@/lib/actions/commissions";
import { parseAsString, useQueryStates } from "nuqs";

type ServicesTabProps = {
  services: ServiceWithDetails[];
};

export default function ServicesTab({ services }: ServicesTabProps) {
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

  // Prefetch only one image per service: cover if present, otherwise first picture
  const imagePaths = services
    .map(
      (service) =>
        service.cover_image_url || service.pictures?.[0]?.image_url || null,
    )
    .filter((p): p is string => !!p);
  const { signedUrls } = useBatchStorageUrls(imagePaths);

  const handleServiceClick = (slug: string) => {
    setParams({
      service: slug,
      style: null, // Reset style when selecting a service
    });
  };

  if (services.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            No services available at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className="rounded-lg bg-linear-to-r from-purple-500 to-pink-500 p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">CURRENT STATUS: OPEN</h2>
            <p className="mt-2 text-sm opacity-90">
              <span className="font-semibold">CAUTION:</span> Before you
              commission me, please make sure that you have read through the
              Terms of Service and the Blacklists before moving forward.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="h-32 w-32">
              {/* Placeholder for status icon/image */}
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white/20">
                <span className="text-6xl">✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Heading */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          SERVICES
        </h2>
      </div>

      {/* Services Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          // Prefer cover image; fallback to first picture
          const coverPath = service.cover_image_url || null;
          const primaryPicture =
            !coverPath && service.pictures && service.pictures.length > 0
              ? service.pictures[0]
              : null;

          // Get pre-fetched signed URL if available
          const preSignedUrl = coverPath
            ? signedUrls.get(coverPath)
            : primaryPicture
              ? signedUrls.get(primaryPicture.image_url)
              : null;

          return (
            <button
              key={service.service_id}
              onClick={() => handleServiceClick(service.slug)}
              className="group relative overflow-hidden rounded-lg bg-white shadow-lg transition-all hover:shadow-xl dark:bg-gray-800"
            >
              {/* Service Image */}
              <div className="relative aspect-4/3 w-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                {coverPath || primaryPicture ? (
                  <StorageImage
                    src={coverPath || primaryPicture!.image_url}
                    signedUrl={preSignedUrl}
                    alt={service.name}
                    fill
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-4xl text-gray-400">🎨</span>
                  </div>
                )}
              </div>

              {/* Service Info */}
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {service.name.toUpperCase()}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  starting from: {service.base_price}$
                </p>

                {/* Add-ons preview */}
                {service.service_addons &&
                  service.service_addons.length > 0 && (
                    <div className="mt-3 text-left">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        add ons:
                      </p>
                      <ul className="mt-1 space-y-0.5 text-xs text-gray-600 dark:text-gray-400">
                        {service.service_addons.slice(0, 2).map((sa) => (
                          <li key={sa.addon_id}>
                            • {sa.addons?.name}: +{sa.addons?.price_impact}
                            {typeof sa.addons?.price_impact === "number" &&
                            sa.addons.price_impact > 0 &&
                            sa.addons.price_impact < 1
                              ? "%"
                              : "$"}
                          </li>
                        ))}
                        {service.service_addons.length > 2 && (
                          <li className="text-gray-500">
                            +{service.service_addons.length - 2} more...
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
