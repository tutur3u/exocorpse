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
  // If total pages is less than or equal to maxVisible, show all pages
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Calculate how many pages to show on each side of current page
  const sidePages = Math.floor((maxVisible - 3) / 2); // -3 for first, last, and current page

  // Always show first page
  const pages: (number | "...")[] = [1];

  // Calculate start and end of the middle range
  let startPage = Math.max(2, currentPage - sidePages);
  let endPage = Math.min(totalPages - 1, currentPage + sidePages);

  // Adjust if we're near the start
  if (currentPage <= sidePages + 2) {
    endPage = Math.min(totalPages - 1, maxVisible - 2);
    startPage = 2;
  }

  // Adjust if we're near the end
  if (currentPage >= totalPages - sidePages - 1) {
    startPage = Math.max(2, totalPages - maxVisible + 2);
    endPage = totalPages - 1;
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
  if (endPage < totalPages - 1) {
    pages.push("...");
  }

  // Always show last page if there's more than one page
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}
