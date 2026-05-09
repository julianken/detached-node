#!/usr/bin/env bash
# Initialize an analysis-funnel artifact tree.
# Usage: init_funnel.sh <artifact-root> "<question summary>"
set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <artifact-root> \"<question summary>\"" >&2
  exit 2
fi

ROOT="$1"
QUESTION="$2"
TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

mkdir -p "$ROOT/phase-0" "$ROOT/phase-1" "$ROOT/phase-2" "$ROOT/phase-3" "$ROOT/phase-4" "$ROOT/context-packets"

STATUS="$ROOT/STATUS.md"
if [ -f "$STATUS" ]; then
  echo "STATUS.md already exists at $STATUS — refusing to overwrite." >&2
  echo "If you are recovering, hand-edit or delete it first." >&2
  exit 3
fi

cat > "$STATUS" <<EOF
# Analysis Funnel Status

## Current State
- **Phase:** 0
- **Sub-state:** Phase 0 in-progress (framing)
- **Last updated:** $TS
- **Artifact root:** $(cd "$ROOT" && pwd)

## Analysis Question
$QUESTION

## Analysis Conclusion
_Filled after Phase 4._

## Domain Tags
_To be filled during Phase 0._

## Phase Completion
- [ ] Phase 0: Frame
- [ ] Phase 1: Investigate (5 areas)
- [ ] Phase 2: Iterate (5 iterators)
- [ ] Phase 3: Synthesize (3 synthesizers)
- [ ] Phase 4: Final report

## Context Packets Available
_None yet._

## Recovery Instructions
To resume from this state:
1. Read this STATUS.md
2. Read the context packet for the current phase
3. Read any incomplete artifacts for the sub-state
4. Continue from where the sub-state indicates
EOF

echo "Initialized funnel at $ROOT"
echo "STATUS.md written. Next: write phase-0/analysis-brief.md and context-packets/phase-0-packet.md, then run verify_phase.sh $ROOT 0"
