export const HEAVEN_SPACE_GAME_ID = "heaven-space" as const;
export const GAME_IDS = [HEAVEN_SPACE_GAME_ID] as const;

export function buildHeavenSpaceUrl(origin: string) {
  const url = new URL("/", origin);
  url.searchParams.set("game", HEAVEN_SPACE_GAME_ID);
  return url.toString();
}
