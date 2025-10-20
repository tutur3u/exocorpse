/**
 * Cleans form data by converting empty strings to undefined and parsing number fields
 * @param data - The form data object
 * @param stringFields - Array of field names that should be treated as strings
 * @param numberFields - Array of field names that should be treated as numbers
 * @returns Cleaned form data with proper types
 */
export function cleanFormData<T extends Record<string, unknown>>(
  data: T,
  stringFields: string[] = [],
  numberFields: string[] = [],
): T {
  const cleaned: Record<string, unknown> = { ...data };

  // Clean string fields - convert empty strings to undefined
  stringFields.forEach((field) => {
    if (cleaned[field] === "") {
      cleaned[field] = undefined;
    }
  });

  // Clean number fields - convert empty/invalid strings to undefined, parse valid strings to numbers
  numberFields.forEach((field) => {
    const value = cleaned[field];
    if (value === "" || value === null || value === undefined) {
      cleaned[field] = undefined;
    } else if (typeof value === "string") {
      const parsed = parseInt(value, 10);
      cleaned[field] = isNaN(parsed) ? undefined : parsed;
    }
    // If it's already a number, leave it as is
  });

  return cleaned as T;
}
