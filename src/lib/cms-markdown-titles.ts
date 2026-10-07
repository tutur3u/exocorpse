/** Titles used by the cutover importer and the legacy branded editors. */
export function matchesCmsMarkdownTitle(
  actual: string | null | undefined,
  expected: string,
) {
  const title = actual?.trim().toLowerCase() ?? "";
  const canonical = expected.trim().toLowerCase();
  if (title === canonical) return true;
  return (
    canonical === "content" &&
    [
      "story content",
      "world lore",
      "faction content",
      "blog content",
      "post content",
      "writing content",
    ].includes(title)
  );
}
