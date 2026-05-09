#!/usr/bin/env bash
# Verify that all expected files exist for a given phase transition.
# Exits non-zero with a list of missing files if any are absent.
# Usage: verify_phase.sh <artifact-root> <phase-number:0|1|2|3|4>
set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <artifact-root> <phase:0|1|2|3|4>" >&2
  exit 2
fi

ROOT="$1"
PHASE="$2"

missing=()
check() {
  if [ ! -f "$1" ]; then
    missing+=("$1")
  fi
}

glob_count() {
  # count files matching a glob; does not fail on zero matches
  local pattern="$1"
  local count
  count=$(find "$(dirname "$pattern")" -maxdepth 1 -type f -name "$(basename "$pattern")" 2>/dev/null | wc -l | tr -d ' ')
  echo "$count"
}

case "$PHASE" in
  0)
    check "$ROOT/STATUS.md"
    check "$ROOT/phase-0/analysis-brief.md"
    check "$ROOT/context-packets/phase-0-packet.md"
    ;;
  1)
    check "$ROOT/STATUS.md"
    check "$ROOT/context-packets/phase-1-packet.md"
    count=$(glob_count "$ROOT/phase-1/area-*.md")
    if [ "$count" -lt 5 ]; then
      missing+=("$ROOT/phase-1/area-*.md (found $count, expected 5)")
    fi
    ;;
  2)
    check "$ROOT/STATUS.md"
    check "$ROOT/context-packets/phase-2-packet.md"
    count=$(glob_count "$ROOT/phase-2/iterator-*.md")
    if [ "$count" -lt 5 ]; then
      missing+=("$ROOT/phase-2/iterator-*.md (found $count, expected 5)")
    fi
    ;;
  3)
    check "$ROOT/STATUS.md"
    check "$ROOT/context-packets/phase-3-packet.md"
    count=$(glob_count "$ROOT/phase-3/synthesis-*.md")
    if [ "$count" -lt 3 ]; then
      missing+=("$ROOT/phase-3/synthesis-*.md (found $count, expected 3)")
    fi
    ;;
  4)
    check "$ROOT/STATUS.md"
    check "$ROOT/phase-4/analysis-report.md"
    ;;
  *)
    echo "Invalid phase: $PHASE (expected 0-4)" >&2
    exit 2
    ;;
esac

if [ "${#missing[@]}" -gt 0 ]; then
  echo "Phase $PHASE verification FAILED. Missing:" >&2
  for f in "${missing[@]}"; do
    echo "  - $f" >&2
  done
  exit 1
fi

echo "Phase $PHASE verification OK."
