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
  "field-report": "Field Report",
};

/**
 * Get a display label for a post type
 * Falls back to the raw type value if not found in the mapping
 */
export function getTypeLabel(type: string): string {
  return typeLabels[type] || type;
}

/**
 * Format a date string for display
 * Returns empty string if date is null/undefined
 */
export function formatDate(date: string | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
