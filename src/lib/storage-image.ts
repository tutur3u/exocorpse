export const DEFAULT_IMAGE_BLUR_DATA_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cdefs%3E%3ClinearGradient id='g'%3E%3Cstop stop-color='%23070d19'/%3E%3Cstop offset='.5' stop-color='%23192538'/%3E%3Cstop offset='1' stop-color='%23070d19'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='12' height='8' fill='url(%23g)'/%3E%3C/svg%3E";

export function isTuturuuuCmsAssetUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "tuturuuu.com" &&
      /^\/api\/v1\/workspaces\/[^/]+\/external-projects\/assets\/[^/]+$/.test(
        url.pathname,
      )
    );
  } catch {
    return false;
  }
}
