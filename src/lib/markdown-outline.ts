export type MarkdownOutlineItem = {
  depth: number;
  id: string;
  label: string;
};

export function markdownHeadingId(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[`*_~[\]()]|<[^>]+>/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

export function markdownOutline(markdown: string): MarkdownOutlineItem[] {
  const items: MarkdownOutlineItem[] = [];
  const ids = new Map<string, number>();
  let fenced = false;

  for (const line of markdown.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const match = /^(#{1,4})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    const label = (match[2] ?? "").trim();
    if (!label) continue;
    const base = markdownHeadingId(label);
    const occurrence = ids.get(base) ?? 0;
    ids.set(base, occurrence + 1);
    items.push({
      depth: match[1]?.length ?? 1,
      id: occurrence ? `${base}-${occurrence + 1}` : base,
      label: label.replace(/[`*_~]/g, ""),
    });
  }

  return items;
}
