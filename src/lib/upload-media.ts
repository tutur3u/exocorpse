export const raster = new Map([
  ["image/png", ["png"]],
  ["image/jpeg", ["jpg", "jpeg"]],
  ["image/webp", ["webp"]],
  ["image/avif", ["avif"]],
  ["image/gif", ["gif"]],
]);
export const audio = new Map([
  ["audio/mpeg", ["mp3"]],
  ["audio/ogg", ["ogg", "oga"]],
  ["audio/wav", ["wav"]],
  ["audio/x-wav", ["wav"]],
  ["audio/mp4", ["m4a"]],
  ["audio/x-m4a", ["m4a"]],
]);
export const video = new Map([
  ["video/mp4", ["mp4"]],
  ["video/webm", ["webm"]],
  ["video/ogg", ["ogv"]],
]);

export function isInlineMedia(contentType: string, filename: string) {
  const extension = filename.split(".").at(-1)?.toLowerCase() ?? "";
  return [raster, audio, video].some((types) =>
    types.get(contentType)?.includes(extension),
  );
}

export function uploadFilename(filename: string) {
  const normalized = filename.normalize("NFKC");
  const dot = normalized.lastIndexOf(".");
  const extension =
    dot >= 0
      ? normalized
          .slice(dot + 1)
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
      : "";
  const rawStem = dot >= 0 ? normalized.slice(0, dot) : normalized;
  const stem =
    rawStem
      .replace(/[^A-Za-z0-9_-]/g, "-")
      .replace(/^[^A-Za-z0-9]+|[-_]+$/g, "") || "upload";
  const suffix = crypto.randomUUID();
  const ending = `-${suffix}${extension ? `.${extension.slice(0, 20)}` : ""}`;
  return `${stem.slice(0, 160 - ending.length)}${ending}`;
}
