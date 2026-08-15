export function toolbarOverflowStartIndex({
  availableWidth,
  gap,
  itemWidths,
  overflowControlWidth = 40,
}: {
  availableWidth: number;
  gap: number;
  itemWidths: number[];
  overflowControlWidth?: number;
}) {
  const naturalWidth =
    itemWidths.reduce((total, width) => total + width, 0) +
    Math.max(0, itemWidths.length - 1) * gap;
  if (naturalWidth <= availableWidth) return null;

  const visibleWidth = Math.max(0, availableWidth - overflowControlWidth);
  let consumedWidth = 0;
  for (const [index, width] of itemWidths.entries()) {
    const nextWidth = width + (index === 0 ? 0 : gap);
    if (consumedWidth + nextWidth > visibleWidth) return index;
    consumedWidth += nextWidth;
  }
  return itemWidths.length;
}
