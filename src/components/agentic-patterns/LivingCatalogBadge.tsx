// ---------------------------------------------------------------------------
// LivingCatalogBadge
// ---------------------------------------------------------------------------
// Small "Updated [month YYYY]" pill that signals the catalog is a living
// reference (not a one-shot publication). Used at the top of the hub page.
//
// Pure presentation. Accepts an ISO date string (YYYY-MM-DD) and formats it
// as "Updated [Month YYYY]". Server-safe — no client JS.
//
// v1: chip styling duplicated with framework chips and reference type badges
// (see ReferencesSection / RelatedPatternsRow). Future: extract <Chip>.

interface LivingCatalogBadgeProps {
  /** ISO date string, e.g. "2026-05-03". */
  isoDate: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatIsoToMonthYear(iso: string): string {
  // Parse YYYY-MM-DD without timezone drift (Date constructor would shift
  // by local TZ; we want literal calendar fields from the ISO string).
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return iso;
  const year = match[1];
  const monthIdx = parseInt(match[2], 10) - 1;
  const monthName = MONTHS[monthIdx] ?? match[2];
  return `${monthName} ${year}`;
}

export function LivingCatalogBadge({ isoDate }: LivingCatalogBadgeProps) {
  const formatted = formatIsoToMonthYear(isoDate);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-surface px-2.5 py-1 font-mono text-xs font-medium tracking-[0.05em] text-text-tertiary"
    >
      <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
      <time dateTime={isoDate}>Updated {formatted}</time>
    </span>
  );
}
