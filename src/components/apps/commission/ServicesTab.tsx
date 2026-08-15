"use client";

import RotatingGallery from "@/components/shared/RotatingGallery";
import { useMobileDetection } from "@/hooks/useMobileDetection";
import { useBatchMediaUrls } from "@/hooks/useMediaUrl";
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

  const isUsingMobile = useMobileDetection();

  const imagePaths = Array.from(
    new Set(
      services.flatMap((service) => [
        service.cover_image_url,
        ...(service.pictures?.map((picture) => picture.image_url) || []),
        ...(service.styles?.flatMap(
          (style) => style.pictures?.map((picture) => picture.image_url) || [],
        ) || []),
      ]),
    ),
  ).filter((path): path is string => !!path);
  const { signedUrls } = useBatchMediaUrls(imagePaths);

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
      <div className="grid grid-cols-1 gap-5 @4xl:grid-cols-2">
        {services.map((service) => {
          const previewImages = Array.from(
            new Map(
              [
                service.cover_image_url,
                ...(service.pictures?.map((picture) => picture.image_url) ||
                  []),
                ...(service.styles?.flatMap(
                  (style) =>
                    style.pictures?.map((picture) => picture.image_url) || [],
                ) || []),
              ]
                .filter((path): path is string => !!path)
                .map((path, index) => [
                  path,
                  {
                    id: `${service.service_id}-${index}`,
                    src: path,
                    signedUrl: signedUrls.get(path) ?? null,
                    alt: service.name,
                  },
                ]),
            ).values(),
          );

          return (
            <div
              key={service.service_id}
              onClick={() => handleServiceClick(service.slug)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleServiceClick(service.slug);
                }
              }}
              className="group relative grid min-h-0 cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl @xl:grid-cols-[minmax(15rem,42%)_minmax(0,1fr)] dark:border-gray-700 dark:bg-gray-800"
              role="button"
              tabIndex={0}
            >
              {/* Service Image */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-200 @xl:aspect-auto @xl:min-h-56 dark:bg-gray-700">
                {previewImages.length > 0 ? (
                  <RotatingGallery
                    images={previewImages}
                    className="h-full w-full"
                    imageClassName="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-4xl text-gray-400">🎨</span>
                  </div>
                )}
              </div>

              {/* Service Info */}
              <div className="flex min-w-0 flex-col justify-center px-5 py-5 text-left @xl:px-7">
                <h3 className="text-xl font-semibold tracking-tight text-gray-900 @2xl:text-2xl dark:text-white">
                  {service.name.toUpperCase()}
                </h3>
                <p className="mt-1 text-sm text-gray-600 @2xl:text-lg dark:text-gray-400">
                  starting from: {service.base_price}€
                </p>

                {/* Add-ons preview */}
                {!isUsingMobile &&
                  service.service_addons &&
                  service.service_addons.length > 0 && (
                    <div className="mt-3 text-left">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        add ons:
                      </p>
                      <ul className="mt-1 space-y-0.5 text-xs text-gray-600 dark:text-gray-400">
                        {service.service_addons.slice(0, 2).map((sa) => (
                          <li key={sa.addon_id}>
                            • {sa.addons?.name}: +{sa.addons?.price_impact}
                            {sa.addons?.percentage ? "%" : "€"}
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
