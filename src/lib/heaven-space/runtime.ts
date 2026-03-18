import {
  HEAVEN_SPACE_PASSAGES,
  type HeavenSpacePassage,
} from "@/lib/heaven-space/passages";

export const HEAVEN_SPACE_STORAGE_KEY = "heaven-space-save-v1";

type HeavenSpaceVariableKey =
  | "memory"
  | "sleep"
  | "annoyed"
  | "beach"
  | "city"
  | "forest";

export type HeavenSpaceState = {
  memory: number;
  sleep: number;
  annoyed: number;
  beach: boolean;
  city: boolean;
  forest: boolean;
};

export type HeavenSpaceSnapshot = {
  currentPassage: string;
  state: HeavenSpaceState;
};

export type HeavenSpaceChoice = {
  label: string;
  target: string;
};

export type HeavenSpaceEnding =
  | "sleep"
  | "bad"
  | "neutral"
  | "true"
  | "weird"
  | null;

export type HeavenSpaceResolvedPassage = {
  passage: string;
  displayName: string;
  markdown: string;
  image: string | null;
  imageAlt: string | null;
  choices: HeavenSpaceChoice[];
  state: HeavenSpaceState;
  ending: HeavenSpaceEnding;
};

const IMAGE_FILENAME_PATTERN = /\/([^/?#]+\.(?:png|jpg|jpeg|webp))/i;

const PASSAGE_MAP = new Map(
  HEAVEN_SPACE_PASSAGES.map((passage) => [
    normalizePassageName(passage.name),
    {
      ...passage,
      name: normalizePassageName(passage.name),
    },
  ]),
);

export function createDefaultHeavenSpaceState(): HeavenSpaceState {
  return {
    memory: 0,
    sleep: 0,
    annoyed: 0,
    beach: false,
    city: false,
    forest: false,
  };
}

export function createInitialHeavenSpaceSnapshot(): HeavenSpaceSnapshot {
  return {
    currentPassage: "WARNING",
    state: createDefaultHeavenSpaceState(),
  };
}

export function isHeavenSpaceSnapshot(
  value: unknown,
): value is HeavenSpaceSnapshot {
  if (!value || typeof value !== "object") return false;

  const snapshot = value as HeavenSpaceSnapshot;

  return (
    typeof snapshot.currentPassage === "string" &&
    !!getPassage(snapshot.currentPassage) &&
    typeof snapshot.state?.memory === "number" &&
    typeof snapshot.state?.sleep === "number" &&
    typeof snapshot.state?.annoyed === "number" &&
    typeof snapshot.state?.beach === "boolean" &&
    typeof snapshot.state?.city === "boolean" &&
    typeof snapshot.state?.forest === "boolean"
  );
}

export function resolveCurrentHeavenSpacePassage(
  snapshot: HeavenSpaceSnapshot,
): HeavenSpaceResolvedPassage {
  return resolveHeavenSpacePassage(snapshot.currentPassage, snapshot.state, {
    applyEntryEffects: false,
  });
}

export function advanceHeavenSpaceSnapshot(
  snapshot: HeavenSpaceSnapshot,
  targetPassage: string,
): HeavenSpaceSnapshot {
  const resolved = resolveHeavenSpacePassage(targetPassage, snapshot.state, {
    applyEntryEffects: true,
  });

  return {
    currentPassage: resolved.passage,
    state: resolved.state,
  };
}

function resolveHeavenSpacePassage(
  targetPassage: string,
  previousState: HeavenSpaceState,
  options: {
    applyEntryEffects: boolean;
  },
): HeavenSpaceResolvedPassage {
  const passage = getPassage(targetPassage);

  if (!passage) {
    throw new Error(`Unknown Heaven Space passage: ${targetPassage}`);
  }

  const workingState = { ...previousState };
  const resolvedContent = renderTwineContent(
    passage.content,
    workingState,
    options.applyEntryEffects,
  );
  const { image, bodyWithoutImage } = extractImage(resolvedContent);
  const choices = extractChoices(bodyWithoutImage);
  const bodyWithoutChoices = bodyWithoutImage.replace(
    /\[\[(.*?)(?:\|(.*?))?\]\]/g,
    "",
  );
  const markdown = toMarkdown(bodyWithoutChoices);

  return {
    passage: passage.name,
    displayName: getDisplayName(passage),
    markdown,
    image,
    imageAlt: image ? getDisplayName(passage) : null,
    choices,
    state: workingState,
    ending: detectEnding(passage.name, markdown),
  };
}

function getPassage(name: string): HeavenSpacePassage | undefined {
  return PASSAGE_MAP.get(normalizePassageName(name));
}

function normalizePassageName(name: string) {
  return name.replace(/\s+/g, " ").trim();
}

function getDisplayName(passage: HeavenSpacePassage) {
  const normalized = normalizePassageName(passage.name);

  switch (normalized) {
    case "WARNING":
      return "Content Notice";
    case "Enter the boat.":
      return "Crossing";
    case "Get up.":
      return "Awakening";
    default:
      return normalized;
  }
}

function renderTwineContent(
  source: string,
  state: HeavenSpaceState,
  applyEntryEffects: boolean,
) {
  let output = "";
  let index = 0;

  while (index < source.length) {
    const macro = parseMacro(source, index);

    if (!macro) {
      output += source[index];
      index += 1;
      continue;
    }

    if (macro.name === "set") {
      if (applyEntryEffects) {
        applySetExpression(macro.body, state);
      }
      index = macro.end + 1;
      continue;
    }

    if (macro.name === "if") {
      const rendered = renderConditionalBlock(
        source,
        macro,
        state,
        applyEntryEffects,
      );
      output += rendered.output;
      index = rendered.nextIndex;
      continue;
    }

    const hookStart = skipWhitespace(source, macro.end + 1);
    const hook = parseHook(source, hookStart);

    if (hook) {
      // Formatting macros like `(text-colour:red)[[Choice|Target]]` apply to a
      // link token directly, not to a plain text hook. Preserve full link
      // markup so downstream choice extraction still works.
      const hookContent =
        hook.raw.startsWith("[[") && hook.raw.endsWith("]]")
          ? hook.raw
          : hook.inner;

      output += renderTwineContent(hookContent, state, applyEntryEffects);
      index = hook.end + 1;
      continue;
    }

    index = macro.end + 1;
  }

  return output;
}

function renderConditionalBlock(
  source: string,
  macro: MacroToken,
  state: HeavenSpaceState,
  applyEntryEffects: boolean,
) {
  let cursor = skipWhitespace(source, macro.end + 1);
  const initialHook = parseHook(source, cursor);

  if (!initialHook) {
    return { output: "", nextIndex: macro.end + 1 };
  }

  const branches: Array<{ condition: string | null; content: string }> = [
    {
      condition: macro.body,
      content: initialHook.inner,
    },
  ];

  cursor = initialHook.end + 1;

  while (true) {
    const nextMacro = parseMacro(source, skipWhitespace(source, cursor));

    if (!nextMacro || !["else-if", "else"].includes(nextMacro.name)) {
      break;
    }

    const hook = parseHook(source, skipWhitespace(source, nextMacro.end + 1));

    if (!hook) {
      cursor = nextMacro.end + 1;
      continue;
    }

    branches.push({
      condition: nextMacro.name === "else" ? null : nextMacro.body,
      content: hook.inner,
    });

    cursor = hook.end + 1;
  }

  const selected = branches.find((branch) =>
    branch.condition ? evaluateCondition(branch.condition, state) : true,
  );

  return {
    output: selected
      ? renderTwineContent(selected.content, state, applyEntryEffects)
      : "",
    nextIndex: cursor,
  };
}

type MacroToken = {
  name: string;
  body: string;
  end: number;
};

function parseMacro(source: string, start: number): MacroToken | null {
  if (source[start] !== "(") {
    return null;
  }

  const end = source.indexOf(")", start);

  if (end === -1) {
    return null;
  }

  const body = source.slice(start + 1, end);
  const colonIndex = body.indexOf(":");

  if (colonIndex === -1) {
    return null;
  }

  return {
    name: body.slice(0, colonIndex).trim(),
    body: body.slice(colonIndex + 1).trim(),
    end,
  };
}

function parseHook(source: string, start: number) {
  if (source[start] !== "[") {
    return null;
  }

  let depth = 0;

  for (let index = start; index < source.length; index += 1) {
    if (source[index] === "[") {
      depth += 1;
    } else if (source[index] === "]") {
      depth -= 1;

      if (depth === 0) {
        return {
          inner: source.slice(start + 1, index),
          raw: source.slice(start, index + 1),
          end: index,
        };
      }
    }
  }

  return null;
}

function skipWhitespace(source: string, index: number) {
  let cursor = index;

  while (cursor < source.length && /\s/.test(source[cursor])) {
    cursor += 1;
  }

  return cursor;
}

function applySetExpression(expression: string, state: HeavenSpaceState) {
  const normalized = expression.trim();
  const assignBoolean = normalized.match(/^\$([a-z]+)\s+to\s+(true|false)$/i);

  if (assignBoolean) {
    const key = assignBoolean[1] as HeavenSpaceVariableKey;
    state[key] = (assignBoolean[2].toLowerCase() === "true") as never;
    return;
  }

  const assignNumber = normalized.match(/^\$([a-z]+)\s*=\s*(-?\d+)$/);

  if (assignNumber) {
    const key = assignNumber[1] as HeavenSpaceVariableKey;
    state[key] = Number(assignNumber[2]) as never;
    return;
  }

  const increment = normalized.match(
    /^\$([a-z]+)\s*=\s*\$([a-z]+)\s*([+-])\s*(\d+)$/,
  );

  if (increment) {
    const key = increment[1] as HeavenSpaceVariableKey;
    const baseKey = increment[2] as HeavenSpaceVariableKey;
    const amount = Number(increment[4]) * (increment[3] === "-" ? -1 : 1);

    state[key] = ((state[baseKey] as number) + amount) as never;
  }
}

function evaluateCondition(expression: string, state: HeavenSpaceState) {
  return expression
    .split(/\s+and\s+/i)
    .every((part) => evaluateConditionPart(part.trim(), state));
}

function evaluateConditionPart(expression: string, state: HeavenSpaceState) {
  const match = expression.match(
    /^\$([a-z]+)\s*(>=|<=|>|<|is not|is)\s*(true|false|-?\d+)$/i,
  );

  if (!match) {
    return false;
  }

  const key = match[1] as HeavenSpaceVariableKey;
  const operator = match[2].toLowerCase();
  const rawValue = match[3].toLowerCase();
  const left = state[key] as number | boolean;
  const right =
    rawValue === "true"
      ? true
      : rawValue === "false"
        ? false
        : Number(rawValue);

  switch (operator) {
    case ">=":
      return Number(left) >= Number(right);
    case "<=":
      return Number(left) <= Number(right);
    case ">":
      return Number(left) > Number(right);
    case "<":
      return Number(left) < Number(right);
    case "is":
      return left === right;
    case "is not":
      return left !== right;
    default:
      return false;
  }
}

function extractChoices(content: string): HeavenSpaceChoice[] {
  return [...content.matchAll(/\[\[(.*?)(?:\|(.*?))?\]\]/g)].map((match) => ({
    label: normalizeChoiceLabel(match[1] ?? ""),
    target: normalizePassageName(match[2] || match[1] || ""),
  }));
}

function normalizeChoiceLabel(label: string) {
  const trimmed = label.replace(/\s+/g, " ").trim();

  if (trimmed.startsWith("WAKE UP. WAKE UP.")) {
    return "WAKE UP.";
  }

  return trimmed;
}

function extractImage(content: string) {
  const match = content.match(/<img[^>]*src="([^"]+)"[^>]*>/i);
  const image = match?.[1] ? localizeImagePath(match[1]) : null;

  return {
    image,
    bodyWithoutImage: content
      .replace(/<\/style>/gi, "")
      .replace(/<\/div>/gi, "")
      .replace(/<img[^>]*>/gi, "")
      .trim(),
  };
}

function localizeImagePath(source: string) {
  const filename = source.match(IMAGE_FILENAME_PATTERN)?.[1];

  if (!filename) {
    return null;
  }

  const normalizedFilename = filename.toLowerCase().replace(/_/g, "-");

  return `/media/heaven-space/${normalizedFilename}`;
}

function toMarkdown(content: string) {
  return content
    .replace(/\[(?!\[)([\s\S]*?)\]/g, "$1")
    .replace(/''([^']+?)''/g, "**$1**")
    .replace(/\/\/([^/]+?)\/\//g, "*$1*")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function detectEnding(
  passageName: string,
  markdown: string,
): HeavenSpaceResolvedPassage["ending"] {
  if (normalizePassageName(passageName) === "Epilogue") {
    return "true";
  }

  if (markdown.includes("SLEEP ENDING")) {
    return "sleep";
  }

  if (markdown.includes("BAD ENDING")) {
    return "bad";
  }

  if (markdown.includes("NEUTRAL ENDING")) {
    return "neutral";
  }

  if (markdown.includes("WEIRD ENDING")) {
    return "weird";
  }

  return null;
}
