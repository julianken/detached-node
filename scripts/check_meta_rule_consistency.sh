#!/usr/bin/env bash
# Verify that the user-CLAUDE.md token-economics meta-rule is present byte-identically in every pattern file that cites it.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PATTERNS_DIR="$REPO_ROOT/src/data/agentic-design-patterns/patterns"

# Verbatim fingerprint from ~/.claude/CLAUDE.md — the identifying substring shared by all citing files.
# Full source sentence: If a rule has a trigger ("when adding screenshots", "before committing",
# "during PR review"), it belongs in a skill, not here.
META_RULE='it belongs in a skill, not here'

# Files that must contain the meta-rule when they exist.
TARGETS=(
  "$PATTERNS_DIR/context-engineering.ts"
  "$PATTERNS_DIR/memory-management.ts"
  "$PATTERNS_DIR/12-factor-agent.ts"
)

FAILED=0
for FILE in "${TARGETS[@]}"; do
  if [[ ! -f "$FILE" ]]; then
    echo "SKIP: $FILE (not present)"
    continue
  fi
  if grep -qF "$META_RULE" "$FILE"; then
    echo "OK:   $FILE"
  else
    echo "FAIL: $FILE — meta-rule fingerprint not found"
    echo "      Expected: $META_RULE"
    FAILED=1
  fi
done

if [[ $FAILED -ne 0 ]]; then
  echo ""
  echo "Meta-rule consistency check failed. Ensure each citing file contains:"
  echo "  $META_RULE"
  exit 1
fi

echo ""
echo "Meta-rule consistency check passed."
