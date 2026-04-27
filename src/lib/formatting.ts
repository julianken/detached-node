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
