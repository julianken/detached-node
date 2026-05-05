#!/usr/bin/env python3
"""Atomically update STATUS.md for an analysis-funnel run.

Usage:
  update_status.py <artifact-root> [--complete N] [--start N] [--substate "text"] [--conclusion "text"]

Flags can be combined. --complete N marks phase N done, --start N marks phase N in-progress.
"""

import argparse
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional


def utc_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def update_phase_state(status: str, phase: int, *, complete: bool, start: bool) -> str:
    pattern = rf"^- \[[ x]\] Phase {phase}:"
    marker = "[x]" if complete else "[ ]"
    suffix_hint = ""
    if start and not complete:
        suffix_hint = " _(in progress)_"

    def repl(m: re.Match) -> str:
        line = m.group(0)
        # replace checkbox
        new = re.sub(r"^- \[[ x]\]", f"- {marker}", line)
        # strip any existing "(in progress)" hint
        new = re.sub(r" _\(in progress\)_$", "", new)
        return new + suffix_hint

    new_status = re.sub(pattern, repl, status, count=1, flags=re.MULTILINE)
    if new_status == status:
        print(f"warning: no Phase {phase} checkbox line found in STATUS.md", file=sys.stderr)
    return new_status


def replace_section(status: str, header: str, new_body: str) -> str:
    """Replace a markdown section (## Header) with new body text."""
    pattern = rf"(## {re.escape(header)}\n)(.*?)(?=\n## |\Z)"
    def repl(m: re.Match) -> str:
        return m.group(1) + new_body + "\n"
    new = re.sub(pattern, repl, status, count=1, flags=re.DOTALL)
    return new


def update_timestamp_and_substate(status: str, substate: Optional[str]) -> str:
    status = re.sub(r"(\*\*Last updated:\*\* )\S+", f"\\g<1>{utc_iso()}", status, count=1)
    if substate is not None:
        status = re.sub(r"(\*\*Sub-state:\*\* ).*", f"\\g<1>{substate}", status, count=1)
    return status


def update_current_phase(status: str, phase: int) -> str:
    return re.sub(r"(\*\*Phase:\*\* )\d+", f"\\g<1>{phase}", status, count=1)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", help="Artifact root containing STATUS.md")
    parser.add_argument("--complete", type=int, help="Mark phase N complete")
    parser.add_argument("--start", type=int, help="Mark phase N in-progress and set as current")
    parser.add_argument("--substate", help="Free-text sub-state description")
    parser.add_argument("--conclusion", help="Fill the Analysis Conclusion section")
    args = parser.parse_args()

    root = Path(args.root)
    status_path = root / "STATUS.md"
    if not status_path.exists():
        print(f"error: {status_path} does not exist. Run init_funnel.sh first.", file=sys.stderr)
        return 2

    status = status_path.read_text()

    if args.complete is not None:
        status = update_phase_state(status, args.complete, complete=True, start=False)
    if args.start is not None:
        status = update_phase_state(status, args.start, complete=False, start=True)
        status = update_current_phase(status, args.start)

    status = update_timestamp_and_substate(status, args.substate)

    if args.conclusion is not None:
        status = replace_section(status, "Analysis Conclusion", args.conclusion)

    # atomic write
    tmp = status_path.with_suffix(".md.tmp")
    tmp.write_text(status)
    tmp.replace(status_path)
    print(f"Updated {status_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
