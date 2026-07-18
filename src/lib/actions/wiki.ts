"use server";

import {
  type CmsCharacterFaction,
  type CmsCharacterGalleryItem,
  type CmsCharacterOutfit,
  type CmsCharacterRelationship,
  type CmsCharacterWorld,
  type CmsLocationGalleryItem,
  getCmsCharacterBySlug,
  getCmsCharacterBySlugInStory,
  getCmsCharacterFactions,
  getCmsCharacterGallery,
  getCmsCharacterOutfits,
  getCmsCharacterRelationships,
  getCmsCharactersByWorldSlug,
  getCmsCharacterWorlds,
  getCmsFactionBySlug,
  getCmsFactionBySlugInStory,
  getCmsFactionMembers,
  getCmsFactionsByWorldSlug,
  getCmsLocationById,
  getCmsLocationBySlug,
  getCmsLocationGallery,
  getCmsLocationsByWorldSlug,
  getCmsPublishedStories,
  getCmsPublicStories,
  getCmsStoryBySlug,
  getCmsWorldBySlug,
  getCmsWorldsByStorySlug,
} from "@/lib/tuturuuu-cms-delivery";
import type {
  Character,
  CharacterDetail,
  Faction,
  Location,
  Story,
  World,
} from "@/types/exocorpse-content";

export type { Character, CharacterDetail, Faction, Location, Story, World };
export type CharacterRelationshipEnhanced = CmsCharacterRelationship;
export type LocationGalleryImage = CmsLocationGalleryItem;

export async function getPublicStories(): Promise<Story[]> {
  return (await getCmsPublicStories()) ?? [];
}
export async function getPublishedStories(): Promise<Story[]> {
  return (await getCmsPublishedStories()) ?? [];
}
export async function getStoryBySlug(slug: string) {
  return getCmsStoryBySlug(slug);
}
export async function getWorldsByStorySlug(
  storySlug: string,
): Promise<World[]> {
  return (await getCmsWorldsByStorySlug(storySlug)) ?? [];
}
export async function getWorldBySlug(storySlug: string, worldSlug: string) {
  return getCmsWorldBySlug(storySlug, worldSlug);
}
export async function getCharactersByWorldSlug(
  storySlug: string,
  worldSlug: string,
): Promise<Character[]> {
  return (await getCmsCharactersByWorldSlug(storySlug, worldSlug)) ?? [];
}
export async function getCharactersByStorySlug(
  storySlug: string,
): Promise<Character[]> {
  const worlds = await getWorldsByStorySlug(storySlug);
  const groups = await Promise.all(
    worlds.map((world) => getCharactersByWorldSlug(storySlug, world.slug)),
  );
  return [...new Map(groups.flat().map((item) => [item.id, item])).values()];
}
export async function getCharacterBySlug(
  storySlug: string,
  worldSlug: string,
  characterSlug: string,
) {
  return getCmsCharacterBySlug(storySlug, worldSlug, characterSlug);
}
export async function getCharacterBySlugInStory(
  storySlug: string,
  characterSlug: string,
) {
  return getCmsCharacterBySlugInStory(storySlug, characterSlug);
}
export async function getCharacterGallery(
  characterId: string,
): Promise<CmsCharacterGalleryItem[]> {
  return (await getCmsCharacterGallery(characterId)) ?? [];
}
export async function getCharacterOutfits(
  characterId: string,
): Promise<CmsCharacterOutfit[]> {
  return (await getCmsCharacterOutfits(characterId)) ?? [];
}
export async function getCharacterFactions(
  characterId: string,
): Promise<CmsCharacterFaction[]> {
  return (await getCmsCharacterFactions(characterId)) ?? [];
}
export async function getCharacterWorlds(
  characterId: string,
): Promise<CmsCharacterWorld[]> {
  return (await getCmsCharacterWorlds(characterId)) ?? [];
}
export async function getCharacterRelationships(
  characterId: string,
): Promise<CharacterRelationshipEnhanced[]> {
  return (await getCmsCharacterRelationships(characterId)) ?? [];
}
export async function getCharacterDetailData(characterId: string) {
  const [gallery, outfits, factions, worlds, relationships] = await Promise.all(
    [
      getCharacterGallery(characterId),
      getCharacterOutfits(characterId),
      getCharacterFactions(characterId),
      getCharacterWorlds(characterId),
      getCharacterRelationships(characterId),
    ],
  );
  return { factions, gallery, outfits, relationships, worlds };
}
export async function getFactionsByWorldSlug(
  storySlug: string,
  worldSlug: string,
): Promise<Faction[]> {
  return (await getCmsFactionsByWorldSlug(storySlug, worldSlug)) ?? [];
}
export async function getFactionsByStorySlug(
  storySlug: string,
): Promise<Faction[]> {
  const worlds = await getWorldsByStorySlug(storySlug);
  const groups = await Promise.all(
    worlds.map((world) => getFactionsByWorldSlug(storySlug, world.slug)),
  );
  return [...new Map(groups.flat().map((item) => [item.id, item])).values()];
}
export async function getFactionBySlug(
  storySlug: string,
  worldSlug: string,
  factionSlug: string,
) {
  return getCmsFactionBySlug(storySlug, worldSlug, factionSlug);
}
export async function getFactionBySlugInStory(
  storySlug: string,
  factionSlug: string,
) {
  return getCmsFactionBySlugInStory(storySlug, factionSlug);
}
export async function getFactionMembers(factionId: string) {
  return (await getCmsFactionMembers(factionId)) ?? [];
}
export async function getLocationsByWorldSlug(
  storySlug: string,
  worldSlug: string,
): Promise<Location[]> {
  return (await getCmsLocationsByWorldSlug(storySlug, worldSlug)) ?? [];
}
export async function getLocationBySlug(
  storySlug: string,
  worldSlug: string,
  locationSlug: string,
) {
  return getCmsLocationBySlug(storySlug, worldSlug, locationSlug);
}
export async function getLocationById(locationId: string) {
  return getCmsLocationById(locationId);
}
export async function getLocationGallery(
  locationId: string,
): Promise<LocationGalleryImage[]> {
  return (await getCmsLocationGallery(locationId)) ?? [];
}
