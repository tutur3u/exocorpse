import ListDetail, { type ListDetailItem } from "@/components/ListDetail";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";
import { type Character, type Faction } from "@/lib/actions/wiki";
import Image from "next/image";

type ContentViewProps = {
  characters: Character[];
  factions: Faction[];
  onCharacterSelect: (character: Character) => void;
  onFactionSelect: (faction: Faction) => void;
};

export default function ContentView({
  characters,
  factions,
  onCharacterSelect,
  onFactionSelect,
}: ContentViewProps) {
  const contentItems: Array<
    ListDetailItem<
      string,
      (Character | Faction) & { type: "character" | "faction" }
    >
  > = [
    ...characters.map((char) => ({
      id: char.id,
      title: char.name,
      subtitle: char.nickname || "Character",
      data: { ...char, type: "character" as const },
    })),
    ...factions.map((faction) => ({
      id: faction.id,
      title: faction.name,
      subtitle: faction.summary || "Faction",
      data: { ...faction, type: "faction" as const },
    })),
  ];

  return (
    <div className="h-[calc(100%-3rem)] overflow-hidden">
      <ListDetail
        items={contentItems}
        fullscreen
        indexLayout="grid"
        renderItemCard={(item) => (
          <div
            onClick={() => {
              if (item.data.type === "character") {
                onCharacterSelect(item.data as Character);
              } else if (item.data.type === "faction") {
                onFactionSelect(item.data as Faction);
              }
            }}
            className="group relative h-full cursor-pointer overflow-visible rounded-xl border border-gray-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800"
          >
            {item.data.type === "character" ? (
              <>
                {/* Character Card */}
                <div className="relative h-32 overflow-visible rounded-t-xl">
                  {/* Banner or gradient background */}
                  <div
                    className="h-full overflow-hidden rounded-t-xl bg-gradient-to-br from-green-400 via-emerald-400 to-teal-400"
                    style={
                      "banner_image" in item.data && item.data.banner_image
                        ? {
                            backgroundImage: `url(${item.data.banner_image})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : {}
                    }
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  </div>

                  {/* Profile Image */}
                  <div className="absolute -bottom-8 left-4 z-10">
                    <div className="h-16 w-16 overflow-hidden rounded-full border-4 border-white bg-gray-200 shadow-lg dark:border-gray-800 dark:bg-gray-700">
                      {"profile_image" in item.data &&
                      item.data.profile_image ? (
                        <Image
                          src={item.data.profile_image}
                          alt={item.title}
                          className="h-full w-full object-cover"
                          width={128}
                          height={128}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-gray-400">
                          {item.title.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  {"status" in item.data && item.data.status && (
                    <div className="absolute top-2 right-2 z-10 rounded-full bg-green-500/90 px-2 py-1 text-xs font-medium text-white capitalize backdrop-blur-sm">
                      {item.data.status}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col px-4 pt-10 pb-4">
                  <h4 className="mb-1 line-clamp-1 text-lg font-bold text-gray-900 transition-colors group-hover:text-green-600 dark:text-gray-100 dark:group-hover:text-green-400">
                    {item.title}
                  </h4>
                  <p className="mb-2 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                    {item.subtitle}
                  </p>
                  <div className="mt-auto">
                    {"age" in item.data && item.data.age && (
                      <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {item.data.age} years old
                      </span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Faction Card */}
                <div className="relative h-32 overflow-hidden rounded-t-xl bg-gradient-to-br from-purple-400 via-pink-400 to-rose-400">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

                  {/* Faction Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="h-16 w-16 text-white/30"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col px-4 pt-10 pb-4">
                  <h4 className="mb-1 line-clamp-1 text-lg font-bold text-gray-900 transition-colors group-hover:text-purple-600 dark:text-gray-100 dark:group-hover:text-purple-400">
                    {item.title}
                  </h4>
                  <p className="line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                    {item.subtitle}
                  </p>
                </div>
              </>
            )}

            {/* Hover Overlay */}
            <div
              className={`pointer-events-none absolute inset-0 rounded-xl border-2 opacity-0 transition-opacity group-hover:opacity-100 ${
                item.data.type === "character"
                  ? "border-green-500"
                  : "border-purple-500"
              }`}
            />
          </div>
        )}
        renderDetail={(item) => (
          <div className="space-y-6">
            {/* Type Badge */}
            <div
              className={`inline-block rounded-lg px-3 py-1.5 text-xs font-medium ${
                item.data.type === "character"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                  : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
              }`}
            >
              {item.data.type === "character" ? "Character" : "Faction"}
            </div>

            {/* Character-specific details */}
            {item.data.type === "character" && (
              <>
                {"nickname" in item.data && item.data.nickname && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Nickname:</span> &quot;
                    {item.data.nickname}&quot;
                  </div>
                )}
                {"personality_summary" in item.data &&
                  item.data.personality_summary && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                      <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Personality
                      </h4>
                      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                        {item.data.personality_summary}
                      </p>
                    </div>
                  )}
                {"status" in item.data && item.data.status && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Status:
                    </span>{" "}
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700 capitalize dark:bg-green-900/30 dark:text-green-300">
                      {item.data.status}
                    </span>
                  </div>
                )}
              </>
            )}

            {/* Faction-specific details */}
            {item.data.type === "faction" &&
              "description" in item.data &&
              item.data.description && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                  <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Description
                  </h4>
                  <MarkdownRenderer
                    content={item.data.description}
                    className="prose prose-sm dark:prose-invert max-w-none"
                  />
                </div>
              )}
          </div>
        )}
      />
    </div>
  );
}
