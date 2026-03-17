export function markdownToPlainText(content?: string | null) {
  if (!content) {
    return "";
  }

  return content
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/^[>#-]+\s*/gm, "")
    .replace(/[*_~`]+/g, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
