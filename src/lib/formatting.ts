/**
 * Formatting utilities for dates and display labels
 */

/**
 * Map post type values to human-readable display labels
 */
export const typeLabels: Record<string, string> = {
  essay: "Essay",
  decoder: "Decoder",
  index: "Index",
};

/**
 * Get a display label for a post type
 * Returns an empty string for types not in the mapping (so callers can
 * easily branch on truthiness when deciding whether to render a label).
 */
export function getTypeLabel(type: string): string {
  return typeLabels[type] ?? "";
}

/**
 * Format a date string for display
 * Returns empty string if date is null/undefined
 * Uses short format: "Jan 24, 2026"
 */
export function formatDate(date: string | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
