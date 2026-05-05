#!/usr/bin/env bash
# Verify every full GitHub URL anchor in bridge content resolves; calendar-driven cadence (TOOL-1, not CI-integrated per RISK-2).

set -euo pipefail

BRIDGE_DIRS=(
  "src/data/agentic-design-patterns/patterns"
  "scripts/seed-cross-identity-code-review.ts"
  "scripts/seed-test-db.ts"
  "scripts/seed-theme-hero.ts"
)

REPO_SLUG="julianken/detached-node"
REPO_URL_PREFIX="https://github.com/${REPO_SLUG}"

failures=()
urls=()
pass_count=0

# Collect all unique full GitHub repo URLs from bridge content
while IFS= read -r line; do urls+=("$line"); done < <(
  grep -roh "https://github\.com/${REPO_SLUG}[^[:space:],'\")\`]*" \
    "${BRIDGE_DIRS[@]}" 2>/dev/null \
  | sort -u
)

if [[ ${#urls[@]} -eq 0 ]]; then
  echo "No bridge URLs found — nothing to verify." >&2
  exit 0
fi

for url in "${urls[@]}"; do
  # PRs: use gh pr view for authoritative state check
  if [[ "$url" =~ /pull/([0-9]+)$ ]]; then
    pr_num="${BASH_REMATCH[1]}"
    state=$(gh pr view "$pr_num" --repo "$REPO_SLUG" --json state --jq '.state' 2>/dev/null || echo "ERROR")
    if [[ -z "$state" || "$state" == "ERROR" ]]; then
      failures+=("$url: gh-pr-error (no JSON / command failed)")
    else
      echo "OK [pr:${state}] $url"
      (( pass_count++ )) || true
    fi

  # Issues: use gh issue view
  elif [[ "$url" =~ /issues/([0-9]+)$ ]]; then
    issue_num="${BASH_REMATCH[1]}"
    state=$(gh issue view "$issue_num" --repo "$REPO_SLUG" --json state --jq '.state' 2>/dev/null || echo "ERROR")
    if [[ -z "$state" || "$state" == "ERROR" ]]; then
      failures+=("$url: gh-issue-error (no JSON / command failed)")
    else
      echo "OK [issue:${state}] $url"
      (( pass_count++ )) || true
    fi

  # All other URLs (blob/main/...) — HEAD check via curl
  else
    http_code=$(curl -sI -L -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || echo "000")
    if [[ "$http_code" == "200" ]]; then
      echo "OK [${http_code}] $url"
      (( pass_count++ )) || true
    else
      failures+=("$url: HTTP ${http_code}")
    fi
  fi
done

echo ""
echo "--- verify_bridge_urls summary ---"
echo "Checked : $((pass_count + ${#failures[@]}))"
echo "Passed  : $pass_count"
echo "Failed  : ${#failures[@]}"

if [[ ${#failures[@]} -gt 0 ]]; then
  echo ""
  echo "FAILURES:"
  for f in "${failures[@]}"; do
    echo "  - $f"
  done
  exit 1
fi

exit 0
