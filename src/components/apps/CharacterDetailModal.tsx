import type { Character } from "@/lib/actions/wiki";
import {
  getCharacterFactions,
  getCharacterGallery,
  getCharacterOutfits,
} from "@/lib/actions/wiki";
import Image from "next/image";
import { useEffect, useState } from "react";

type CharacterDetailModalProps = {
  character: Character;
  onClose: () => void;
};

type GalleryImage = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  thumbnail_url: string | null;
  artist_name: string | null;
  artist_url: string | null;
  tags: string[] | null;
};

type Outfit = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  color_palette: string | null;
};

type Membership = {
  id: string;
  role: string | null;
  rank: string | null;
  is_current: boolean | null;
  factions?: {
    id: string;
    name: string;
  };
};

export default function CharacterDetailModal({
  character,
  onClose,
}: CharacterDetailModalProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "outfits" | "lore" | "gallery"
  >("overview");
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [factions, setFactions] = useState<Membership[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [galleryData, outfitsData, factionsData] = await Promise.all([
          getCharacterGallery(character.id),
          getCharacterOutfits(character.id),
          getCharacterFactions(character.id),
        ]);
        setGallery(galleryData);
        setOutfits(outfitsData);
        setFactions(factionsData);
      } catch (error) {
        console.error("Error fetching character data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [character.id]);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "outfits", label: `Outfits (${outfits.length})` },
    { id: "lore", label: "Lore & Backstory" },
    { id: "gallery", label: `Gallery (${gallery.length})` },
  ];

  return (
    <>
      <div className="bg-opacity-70 animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
        <div className="animate-slideUp relative flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
          {/* Header */}
          <div
            className="relative h-56 bg-cover bg-center"
            style={{
              backgroundImage: character.banner_image
                ? `url(${character.banner_image})`
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

            <button
              onClick={onClose}
              className="bg-opacity-50 hover:bg-opacity-70 absolute top-4 right-4 rounded-full bg-black p-2.5 text-white backdrop-blur-sm transition-all duration-200 hover:shadow-xl"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Profile Image */}
            <div className="absolute -bottom-16 left-8">
              <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-gray-200 to-gray-300 shadow-xl ring-2 ring-gray-200 dark:border-gray-900 dark:from-gray-800 dark:to-gray-700 dark:ring-gray-700">
                {character.profile_image ? (
                  <Image
                    src={character.profile_image}
                    alt={character.name}
                    className="h-full w-full object-cover"
                    width={128}
                    height={128}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-4xl font-bold text-white">
                    {character.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Character Info */}
          <div className="border-b bg-gradient-to-b from-transparent to-gray-50/50 px-8 pt-20 pb-6 dark:border-gray-800 dark:to-gray-900/50">
            <h1 className="mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-4xl font-bold text-transparent dark:from-white dark:to-gray-300">
              {character.name}
            </h1>
            {character.nickname && (
              <p className="mb-2 text-lg text-gray-600 italic dark:text-gray-400">
                &quot;{character.nickname}&quot;
              </p>
            )}
            {character.title && (
              <p className="mb-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                {character.title}
              </p>
            )}
            <div className="flex flex-wrap gap-2 text-sm">
              {character.age && (
                <span className="rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1.5 font-medium text-white shadow-sm">
                  {character.age} years old
                </span>
              )}
              {character.status && (
                <span className="rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1.5 font-medium text-white capitalize shadow-sm">
                  {character.status}
                </span>
              )}
              {character.species && (
                <span className="rounded-full bg-gradient-to-r from-purple-500 to-purple-600 px-3 py-1.5 font-medium text-white shadow-sm">
                  {character.species}
                </span>
              )}
              {character.occupation && (
                <span className="rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 px-3 py-1.5 font-medium text-white shadow-sm">
                  {character.occupation}
                </span>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b bg-gray-50/50 px-8 dark:border-gray-800 dark:bg-gray-900/30">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(
                      tab.id as "overview" | "outfits" | "lore" | "gallery",
                    )
                  }
                  className={`relative rounded-t-lg px-4 py-3 font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-white text-blue-600 shadow-sm dark:bg-gray-900 dark:text-blue-400"
                      : "text-gray-600 hover:bg-white/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-transparent to-gray-50/30 p-8 dark:to-gray-900/30">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                  <div className="font-medium text-gray-500 dark:text-gray-400">
                    Loading...
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div className="animate-fadeIn space-y-6">
                    {character.personality_summary && (
                      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800/50">
                        <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                          <span className="h-6 w-1 rounded-full bg-gradient-to-b from-blue-600 to-purple-600"></span>
                          Personality
                        </h3>
                        <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                          {character.personality_summary}
                        </p>
                      </div>
                    )}

                    {/* Physical Traits */}
                    {(character.height ||
                      character.build ||
                      character.hair_color ||
                      character.eye_color) && (
                      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800/50">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                          <span className="h-6 w-1 rounded-full bg-gradient-to-b from-green-600 to-emerald-600"></span>
                          Physical Traits
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {character.height && (
                            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
                              <span className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                Height
                              </span>
                              <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                                {character.height}
                              </p>
                            </div>
                          )}
                          {character.build && (
                            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
                              <span className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                Build
                              </span>
                              <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                                {character.build}
                              </p>
                            </div>
                          )}
                          {character.hair_color && (
                            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
                              <span className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                Hair
                              </span>
                              <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                                {character.hair_color}
                              </p>
                            </div>
                          )}
                          {character.eye_color && (
                            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
                              <span className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                Eyes
                              </span>
                              <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                                {character.eye_color}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Factions */}
                    {factions.length > 0 && (
                      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800/50">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                          <span className="h-6 w-1 rounded-full bg-gradient-to-b from-purple-600 to-pink-600"></span>
                          Affiliations
                        </h3>
                        <div className="space-y-2">
                          {factions.map((membership) => (
                            <div
                              key={membership.id}
                              className="rounded-lg border border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50 p-4 dark:border-purple-800/30 dark:from-purple-900/20 dark:to-pink-900/20"
                            >
                              <div className="font-semibold text-gray-900 dark:text-gray-100">
                                {membership.factions?.name}
                              </div>
                              {membership.role && (
                                <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                  {membership.role}
                                  {membership.rank && ` • ${membership.rank}`}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills & Abilities */}
                    {(character.skills || character.abilities) && (
                      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800/50">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                          <span className="h-6 w-1 rounded-full bg-gradient-to-b from-yellow-600 to-orange-600"></span>
                          Skills & Abilities
                        </h3>
                        {character.skills && (
                          <div className="mb-4 rounded-lg border border-yellow-100 bg-yellow-50 p-4 dark:border-yellow-800/30 dark:bg-yellow-900/10">
                            <h4 className="mb-2 text-sm font-semibold tracking-wide text-yellow-900 uppercase dark:text-yellow-200">
                              Skills
                            </h4>
                            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                              {character.skills}
                            </p>
                          </div>
                        )}
                        {character.abilities && (
                          <div className="rounded-lg border border-orange-100 bg-orange-50 p-4 dark:border-orange-800/30 dark:bg-orange-900/10">
                            <h4 className="mb-2 text-sm font-semibold tracking-wide text-orange-900 uppercase dark:text-orange-200">
                              Abilities
                            </h4>
                            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                              {character.abilities}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Outfits Tab */}
                {activeTab === "outfits" && (
                  <div className="animate-fadeIn">
                    {outfits.length === 0 ? (
                      <div className="py-16 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                          <svg
                            className="h-8 w-8 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                            />
                          </svg>
                        </div>
                        <p className="font-medium text-gray-500 dark:text-gray-400">
                          No outfits added yet.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {outfits.map((outfit) => (
                          <div
                            key={outfit.id}
                            className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-800/50"
                          >
                            {outfit.image_url && (
                              <div className="relative h-56 overflow-hidden bg-gray-100 dark:bg-gray-800">
                                <Image
                                  src={outfit.image_url}
                                  alt={outfit.name}
                                  className="h-full w-full object-cover"
                                  width={128}
                                  height={128}
                                />
                              </div>
                            )}
                            <div className="p-4">
                              <h4 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {outfit.name}
                              </h4>
                              {outfit.description && (
                                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                  {outfit.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Lore Tab */}
                {activeTab === "lore" && (
                  <div className="animate-fadeIn space-y-6">
                    {character.backstory && (
                      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800/50">
                        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                          <span className="h-7 w-1 rounded-full bg-gradient-to-b from-indigo-600 to-purple-600"></span>
                          Backstory
                        </h3>
                        <div className="prose dark:prose-invert max-w-none">
                          <p className="text-base leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                            {character.backstory}
                          </p>
                        </div>
                      </div>
                    )}
                    {character.lore && (
                      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800/50">
                        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                          <span className="h-7 w-1 rounded-full bg-gradient-to-b from-purple-600 to-pink-600"></span>
                          Additional Lore
                        </h3>
                        <div className="prose dark:prose-invert max-w-none">
                          <p className="text-base leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                            {character.lore}
                          </p>
                        </div>
                      </div>
                    )}
                    {!character.backstory && !character.lore && (
                      <div className="py-16 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                          <svg
                            className="h-8 w-8 text-gray-400"
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
                        <p className="font-medium text-gray-500 dark:text-gray-400">
                          No lore or backstory added yet.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Gallery Tab */}
                {activeTab === "gallery" && (
                  <div className="animate-fadeIn">
                    {gallery.length === 0 ? (
                      <div className="py-16 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                          <svg
                            className="h-8 w-8 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <p className="font-medium text-gray-500 dark:text-gray-400">
                          No artwork added yet.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {gallery.map((image) => (
                          <button
                            key={image.id}
                            onClick={() => setSelectedImage(image)}
                            className="group aspect-square overflow-hidden rounded-xl ring-2 ring-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-blue-500 dark:ring-gray-700"
                          >
                            <Image
                              src={image.thumbnail_url || image.image_url}
                              alt={image.title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                              width={128}
                              height={128}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Gallery Lightbox */}
      {selectedImage && (
        <div
          className="bg-opacity-95 animate-fadeIn fixed inset-0 z-[60] flex items-center justify-center bg-black p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="animate-slideUp flex max-h-[95vh] max-w-6xl flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden rounded-2xl bg-gray-900 shadow-2xl">
              <Image
                src={selectedImage.image_url}
                alt={selectedImage.title}
                className="max-h-[70vh] w-full object-contain"
                width={1280}
                height={720}
              />
            </div>
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                {selectedImage.title}
              </h3>
              {selectedImage.description && (
                <p className="mb-4 leading-relaxed text-gray-600 dark:text-gray-400">
                  {selectedImage.description}
                </p>
              )}
              {selectedImage.artist_name && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1 font-medium text-white">
                    Artist: {selectedImage.artist_name}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedImage(null)}
              className="bg-opacity-60 hover:bg-opacity-80 absolute top-4 right-4 rounded-full bg-black p-3 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-2xl"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
