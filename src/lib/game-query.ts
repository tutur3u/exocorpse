import {
  GAME_IDS,
  HEAVEN_SPACE_GAME_ID,
  buildHeavenSpaceUrl,
} from "@/lib/game-constants";
import { parseAsStringLiteral } from "nuqs";

export const gameQueryParser = parseAsStringLiteral(GAME_IDS);

export { buildHeavenSpaceUrl, GAME_IDS, HEAVEN_SPACE_GAME_ID };
