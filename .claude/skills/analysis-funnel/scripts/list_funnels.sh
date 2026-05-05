#!/usr/bin/env bash
# Find all analysis-funnel runs under a search root and summarize their state.
# Usage: list_funnels.sh [search-root]  (default: docs)
set -euo pipefail

ROOT="${1:-docs}"

if [ ! -d "$ROOT" ]; then
  echo "No such directory: $ROOT" >&2
  exit 1
fi

found=0
while IFS= read -r -d '' status_file; do
  found=$((found + 1))
  artifact_dir="$(dirname "$status_file")"
  topic="$(basename "$artifact_dir")"

  phase=$(grep -m1 '^\- \*\*Phase:\*\*' "$status_file" 2>/dev/null | sed 's/.*Phase:\*\* //' || echo "?")
  substate=$(grep -m1 '^\- \*\*Sub-state:\*\*' "$status_file" 2>/dev/null | sed 's/.*Sub-state:\*\* //' || echo "?")
  updated=$(grep -m1 '^\- \*\*Last updated:\*\*' "$status_file" 2>/dev/null | sed 's/.*Last updated:\*\* //' || echo "?")

  echo "[$topic] phase=$phase  last-updated=$updated"
  echo "    sub-state: $substate"
  echo "    root: $artifact_dir"
  echo
done < <(find "$ROOT" -maxdepth 4 -name STATUS.md -print0 2>/dev/null)

if [ "$found" -eq 0 ]; then
  echo "No funnels found under $ROOT (searched for */STATUS.md up to depth 4)."
  exit 0
fi

echo "$found funnel(s) found."
