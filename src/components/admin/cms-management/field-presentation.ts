import type { ExocorpseCmsFieldDefinition } from "@/types/exocorpse-cms";

export const spaciousFieldKeys = new Set([
  "abilities",
  "distinguishingFeatures",
  "fanworkPolicy",
  "personalitySummary",
]);

const multilineFieldKeys = new Set([...spaciousFieldKeys, "notes"]);

// Legacy CMS definitions can store long-form fields as strings. Keep rendering
// and grid sizing aligned instead of inferring control size from storage type.
export function isMultilineField(definition: ExocorpseCmsFieldDefinition) {
  return (
    definition.key !== "quote" &&
    (definition.field_type === "markdown" ||
      multilineFieldKeys.has(definition.key))
  );
}

export function isFullWidthField(definition: ExocorpseCmsFieldDefinition) {
  return (
    isMultilineField(definition) ||
    ["json", "markdown", "string-array"].includes(definition.field_type) ||
    Boolean(definition.description)
  );
}
