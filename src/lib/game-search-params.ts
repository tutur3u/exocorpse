import { GAME_IDS } from "@/lib/game-constants";
import {
  createLoader,
  createSerializer,
  parseAsStringLiteral,
  type UrlKeys,
} from "nuqs/server";

export const gameSearchParams = {
  game: parseAsStringLiteral(GAME_IDS),
};

export const gameUrlKeys: UrlKeys<typeof gameSearchParams> = {
  game: "game",
};

export const loadGameSearchParams = createLoader(gameSearchParams, {
  urlKeys: gameUrlKeys,
});

export const serializeGameSearchParams = createSerializer(gameSearchParams, {
  urlKeys: gameUrlKeys,
});

export type GameSearchParams = {
  game: "heaven-space" | null;
};
