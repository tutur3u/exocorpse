"use server";

import {
  getCmsActiveServices,
  getCmsServiceBySlug,
} from "@/lib/tuturuuu-cms-delivery";
import type {
  Addon,
  Picture,
  Service,
  ServiceAddon,
  Style,
} from "@/types/exocorpse-content";

export type { Addon, Picture, Service, ServiceAddon, Style };
export type ServiceWithDetails = Service;
export type StyleWithPictures = Style & { pictures?: Picture[] };

export async function getActiveServices(): Promise<ServiceWithDetails[]> {
  return (await getCmsActiveServices()) ?? [];
}

export async function getServiceBySlug(slug: string) {
  return getCmsServiceBySlug(slug);
}
