/**
 * Slug generation utilities for URL-safe identifiers
 */
import type { FieldHook } from "payload";

/**
 * Generate a URL-safe slug from a string
 * - Converts to lowercase
 * - Replaces non-alphanumeric characters with hyphens
 * - Removes leading/trailing hyphens
 */
export function generateSlug(value: string): string {
  if (!value) return "";
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Create a Payload field hook for auto-generating slugs
 * @param sourceField - The field to generate the slug from (e.g., 'title', 'name')
 * @returns A beforeValidate hook that generates slugs when not provided
 */
export function createSlugHook(sourceField: string): FieldHook {
  return ({ value, data }) => {
    if (!value && data?.[sourceField]) {
      return generateSlug(data[sourceField] as string);
    }
    return value;
  };
}
