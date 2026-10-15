import type { ExocorpseJson } from "@/types/exocorpse-cms";

export function parseStringArrayInput(text: string) {
  return text
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function stringArrayInputValue(value: ExocorpseJson | undefined) {
  return Array.isArray(value) ? value.join("\n") : "";
}

export function reconcileStringArrayInput(text: string, serialized: string) {
  return parseStringArrayInput(text).join("\n") === serialized
    ? text
    : serialized;
}
