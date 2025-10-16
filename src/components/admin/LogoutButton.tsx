"use client";

import { logout } from "@/lib/actions/auth";
import { useState } from "react";
import toast from "react-hot-toast";

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const result = await logout();
      if (result?.error) {
        toast.error(result.error);
        setIsLoading(false);
      }
      // If successful, logout will redirect to login page
    } catch (error) {
      toast.error("Failed to logout");
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
