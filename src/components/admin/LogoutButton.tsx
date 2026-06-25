"use client";

import toastWithSound from "@/lib/toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/tuturuuu-logout", {
        cache: "no-store",
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to logout");
      }

      router.push("/login");
      router.refresh();
    } catch (error) {
      toastWithSound.error("Failed to logout");
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:cursor-pointer hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
    >
      {isLoading ? "Logging out..." : "Logout"}
    </button>
  );
}
