"use client";

import { useEffect, useState } from "react";
import { getPublishedStories, type Story } from "@/lib/actions/wiki";
import WikiClient from "./WikiClient";

export default function Wiki() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublishedStories()
      .then((data) => {
        setStories(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching stories:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <h2 className="text-2xl font-bold">Character & World Wiki</h2>
      </div>
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-gray-500 dark:text-gray-400">Loading...</div>
          </div>
        ) : (
          <WikiClient stories={stories} />
        )}
      </div>
    </div>
  );
}
