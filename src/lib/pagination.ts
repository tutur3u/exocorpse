/**
 * Generates a smart pagination range with ellipses
 *
 * @param currentPage - The current page number (1-indexed)
 * @param totalPages - The total number of pages
 * @param maxVisible - Maximum number of page buttons to show (default: 7)
 * @returns An array of page numbers and ellipses markers
 *
 * @example
 * // With 10 pages, on page 1:
 * generatePaginationRange(1, 10) // [1, 2, 3, "...", 10]
 *
 * // With 10 pages, on page 5:
 * generatePaginationRange(5, 10) // [1, "...", 4, 5, 6, "...", 10]
 *
 * // With 10 pages, on page 10:
 * generatePaginationRange(10, 10) // [1, "...", 8, 9, 10]
 */
export function generatePaginationRange(
  currentPage: number,
  totalPages: number,
  maxVisible: number = 7,
): (number | "...")[] {
  // Normalize inputs
  const total = Math.max(0, Math.floor(Number(totalPages) || 0));
  const max = Math.max(5, Math.floor(Number(maxVisible) || 7));
  const current = Math.min(
    Math.max(1, Math.floor(Number(currentPage) || 1)),
    Math.max(1, total),
  );

  if (total <= 1) return total === 1 ? ([1] as (number | "...")[]) : [];
  if (total <= max) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  // Calculate how many pages to show on each side of current page
  const sidePages = Math.floor((max - 3) / 2); // -3 for first, last, and current page

  // Always show first page
  const pages: (number | "...")[] = [1];

  // Calculate start and end of the middle range
  let startPage = Math.max(2, current - sidePages);
  let endPage = Math.min(total - 1, current + sidePages);

  // Adjust if we're near the start
  if (current <= sidePages + 2) {
    endPage = Math.min(total - 1, max - 1);
    startPage = 2;
  }

  // Adjust if we're near the end
  if (current >= total - sidePages - 1) {
    startPage = Math.max(2, total - max + 2);
    endPage = total - 1;
  }

  // Add ellipsis before middle range if needed
  if (startPage > 2) {
    pages.push("...");
  }

  // Add middle range
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  // Add ellipsis after middle range if needed
  if (endPage < total - 1) {
    pages.push("...");
  }

  // Always show last page if there's more than one page
  if (total > 1) {
    pages.push(total);
  }

  return pages;
}
