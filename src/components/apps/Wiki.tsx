"use client";

import ListDetail, { type ListDetailItem } from "@/components/ListDetail";

type Character = {
  division: "Pulse" | "Neuro";
  description: string;
};

const characters: Array<ListDetailItem<string, Character>> = [
  {
    id: "pulse",
    title: "Pulse Division",
    subtitle: "Direct action & combat ops",
    data: {
      division: "Pulse",
      description:
        "The physically dominant branch of EXOCORPSE, specializing in direct action and combat operations.",
    },
  },
  {
    id: "neuro",
    title: "Neuro Division",
    subtitle: "Strategy, intelligence, covert",
    data: {
      division: "Neuro",
      description:
        "The intellectually cunning branch, handling strategy, intelligence, and covert operations.",
    },
  },
];

export default function Wiki() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <h2 className="text-2xl font-bold">Character & World Wiki</h2>
      </div>
      <div className="flex-1 overflow-hidden">
        <ListDetail
          items={characters}
          fullscreen
          indexLayout="grid"
          renderItemCard={(item) => (
            <div>
              <div className="mb-1 text-base font-semibold group-hover:text-blue-600">
                {item.title}
              </div>
              {item.subtitle ? (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {item.subtitle}
                </div>
              ) : null}
            </div>
          )}
          renderDetail={(item) => (
            <div className="space-y-4">
              {/* <div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                {item.subtitle ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.subtitle}
                  </p>
                ) : null}
              </div> */}
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {item.data.description}
                </p>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Division: {item.data.division}
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}
