#!/usr/bin/env bash
# block-debug-artifacts.sh
# PreToolUse hook: blocks git commit when staged files match debug-*.spec.ts or *.bak
# Exit 2 on violation; exit 0 otherwise.

set -euo pipefail

staged_files=$(git diff --cached --name-only 2>/dev/null || true)

if [ -z "$staged_files" ]; then
  exit 0
fi

violations=()

while IFS= read -r file; do
  # Match debug-*.spec.ts
  if [[ "$file" =~ (^|/)debug-[^/]*\.spec\.ts$ ]]; then
    violations+=("$file (matches debug-*.spec.ts)")
    continue
  fi
  # Match *.bak
  if [[ "$file" =~ \.bak$ ]]; then
    violations+=("$file (matches *.bak)")
  fi
done <<< "$staged_files"

if [ ${#violations[@]} -gt 0 ]; then
  echo "ERROR: block-debug-artifacts: staged files contain debug artifacts:" >&2
  for v in "${violations[@]}"; do
    echo "  - $v" >&2
  done
  echo "Remove these files from staging before committing." >&2
  exit 2
fi

exit 0
