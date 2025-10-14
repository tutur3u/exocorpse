"use client";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

interface HydrationWrapperProps {
  children: React.ReactNode;
  state: ReturnType<typeof dehydrate>;
}

export default function HydrationWrapper({
  children,
  state,
}: HydrationWrapperProps) {
  return <HydrationBoundary state={state}>{children}</HydrationBoundary>;
}
