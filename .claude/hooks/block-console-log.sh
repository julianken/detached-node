#!/usr/bin/env bash
# block-console-log.sh
# PreToolUse hook: blocks git commit when staged files outside the allowlist contain console.log
# Allowlist: tests/, e2e/, scripts/, *.test.*, *.spec.*
# Exit 2 on violation; exit 0 otherwise.

set -euo pipefail

staged_files=$(git diff --cached --name-only 2>/dev/null || true)

if [ -z "$staged_files" ]; then
  exit 0
fi

violations=()

while IFS= read -r file; do
  # Skip allowlisted paths
  if [[ "$file" =~ ^tests/ ]]; then continue; fi
  if [[ "$file" =~ ^e2e/ ]]; then continue; fi
  if [[ "$file" =~ ^scripts/ ]]; then continue; fi
  if [[ "$file" =~ \.test\. ]]; then continue; fi
  if [[ "$file" =~ \.spec\. ]]; then continue; fi

  # Check if the staged version of the file contains console.log
  if git diff --cached -U0 -- "$file" | grep -qE '^\+.*console\.log'; then
    violations+=("$file")
  fi
done <<< "$staged_files"

if [ ${#violations[@]} -gt 0 ]; then
  echo "ERROR: block-console-log: staged files contain console.log outside the allowlist:" >&2
  for v in "${violations[@]}"; do
    echo "  - $v" >&2
  done
  echo "Remove console.log statements before committing. Allowlist: tests/, e2e/, scripts/, *.test.*, *.spec.*" >&2
  exit 2
fi

exit 0
