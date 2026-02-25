---
name: subagent-workflow
description: MANDATORY for all multi-step tasks - parallel task execution with sequential per-task workflow (implementer → spec review → quality review) with Linear as source of truth
---

# Subagent-Driven Development Workflow

**MANDATORY for all multi-step work. Skip ONLY for single-line fixes, pure research, or reading files.**

## 8 Core Principles

1. **One Linear issue = one worktree = one PR** — never split an issue across multiple PRs
2. **Always query Linear before starting** — Linear is the source of truth
3. **Both spec + quality reviews required** — no exceptions, no shortcuts
4. **E2E tests must pass before PR** — GitHub Actions are disabled; local validation is mandatory
5. **All work via dispatched agents** — lead agent orchestrates, never edits code directly
6. **Fixes stay in the same worktree/PR** — never create a new PR for review fixes
7. **Update Linear at every state transition** — full audit trail required
8. **Clean debug artifacts before PR** — no debug-*.spec.ts, *.bak, or console.log leftovers

## Linear State Definitions

| State | Meaning |
|-------|---------|
| **Backlog** | Not yet planned |
| **Todo** | Ready to start (no blockers) |
| **In Progress** | Actively being worked on |
| **Blocked** | Work started but cannot proceed (set `blockedBy`) |
| **In Review** | PR created, awaiting review |
| **Done** | Merged and complete |

## Workflow Overview

```
PARALLEL across Linear issues, SEQUENTIAL within each issue:

BEA-330 ─┬─ Implementer → Spec Review → Quality Review → Merge
BEA-331 ─┬─ Implementer → Spec Review → Quality Review → Merge
BEA-332 ─┬─ Implementer → Spec Review → Quality Review → Merge

State flow: Backlog → Todo → In Progress → [Blocked] → In Review → Done
```

## Linear Comments (3 per issue — no more)

1. **Started:** `"Starting work on {ISSUE_ID}"`
2. **Review findings:** Combined spec + quality review results
3. **Done:** `"Completed {ISSUE_ID}, merged PR #{PR_NUM}"`

---

# Step 0: Get Work from Linear

**MANDATORY first step.**

1. List issues in "Todo" or "Backlog": `mcp__linear-server__list_issues`
2. Filter for unblocked issues
3. Read full issue details: `mcp__linear-server__get_issue { id: "issue-id" }`
   - Description, acceptance criteria, comments, linked PRs, labels, dependencies
4. **Claim the issue:** `mcp__linear-server__update_issue { id: "issue-id", state: "Todo", assignee: "me" }`

**If Linear is inaccessible:** STOP. Ask user to configure Linear MCP or provide a specific BEA-### issue ID. Never fabricate issue IDs.

---

# Step 1: Identify Parallel Linear Issues

Look for independent issues that modify different files/areas and have no dependencies on each other.

```
✅ GOOD: 3 independent issues → 3 worktrees → 3 PRs (parallel)
❌ BAD:  1 issue split into 3 tasks → 3 worktrees → 3 PRs (never do this)
```

Track each issue with `TodoWrite`.

---

# Step 2: Create Git Worktrees

One worktree per Linear issue using `Skill(using-git-worktrees)`:

```bash
git worktree add ../wt-BEA-330-login-form -b feat/BEA-330-login-form
cd ../wt-BEA-330-login-form && ./scripts/setup-worktree-e2e.sh && cd -
```

**CRITICAL:** Run `./scripts/setup-worktree-e2e.sh` in EACH worktree to prevent port conflicts.

Verify: `git worktree list`

---

# Step 3–5: Dispatch Agent Template

Steps 3, 4, and 5 each dispatch agents using `Task`. All agents for a given step are dispatched in a SINGLE message (parallel execution). Below is the reusable prompt template — each step fills in the role-specific section.

## Common Prompt Template

```
You are the {ROLE} for Linear issue {ISSUE_ID}.

**Working directory:** ../wt-{ISSUE_ID}-{slug}
**Linear Issue:** {ISSUE_ID} "{title}"
{IF_REVIEW: **PR to review:** PR #{PR_NUM}}

**Context scope:**
1. Determine which app this issue affects from the Linear issue description/labels
2. ONLY read that app's CLAUDE.md (e.g., apps/bingo/CLAUDE.md)
3. Do NOT read other app CLAUDE.md files unless issue spans multiple apps
4. Determine app from: issue title, description mentions, file paths, labels
5. Always read root CLAUDE.md for project-wide patterns

**Linear context:** Read issue {ISSUE_ID} description, comments, and linked PRs.

{ROLE_SPECIFIC_INSTRUCTIONS}

**CRITICAL:**
- One PR for the ENTIRE Linear issue — do NOT split
- Fixes happen in the SAME worktree/PR, never a new one
- E2E tests MUST pass before marking complete
```

---

# Step 3: Dispatch Implementer Agents

Update Linear: `state: "In Progress"` for each issue. Post comment: `"Starting work on {ISSUE_ID}"`.

**Role-specific instructions for IMPLEMENTER:**

```
1. Read Linear issue for FULL context (description, comments, linked PRs)
2. Read the relevant app's CLAUDE.md for patterns (context scope above)
3. Implement the ENTIRE issue in this worktree
4. Write tests (>80% coverage)
5. Run pre-PR gate:
   pnpm test:run && pnpm lint && pnpm typecheck
   pnpm test:e2e && pnpm test:e2e:summary  # MUST show "0 failed"
   git status --porcelain | grep -E "debug-|\.bak$" && echo "FAIL" && exit 1
6. Clean debug artifacts (debug-*.spec.ts, *.bak, console.log)
7. Commit: feat(scope): description (BEA-###)
8. Self-review, push, create draft PR using .github/PULL_REQUEST_TEMPLATE.md
9. Update Linear with pre-PR verification evidence (actual test output)
10. Mark task as completed
11. Documentation check: If your changes touch any of these high-signal files, update the corresponding doc section per the app's Update Triggers table:
    - Keyboard shortcut handlers → CLAUDE.md Keyboard Shortcuts
    - API route directories → CLAUDE.md API Routes
    - New packages in packages/ → root CLAUDE.md package table
    - Scene/state type definitions → CLAUDE.md Architecture Notes
    If no doc-impacting changes, note "No doc updates needed" in your commit.
```

**BLOCKING:** Do NOT create PR if ANY check fails. Fix first, re-run, then proceed.

---

# Step 4: Dispatch Spec Reviewers

Only after ALL implementers complete. One reviewer per issue/PR.

**Role-specific instructions for SPEC COMPLIANCE REVIEWER:**

```
1. Read Linear issue acceptance criteria
2. Review PR diff and code
3. Verify EACH acceptance criterion is met
4. Check tests cover acceptance criteria
5. Verify E2E tests pass
6. Documentation verification: Confirm that the implementer updated docs if changes touched files listed in the app's Update Triggers table, or explicitly noted "No doc updates needed."

If APPROVED: "SPEC COMPLIANT - {ISSUE_ID} acceptance criteria met"
If ISSUES: "SPEC GAPS FOUND" + specific gaps → implementer fixes in SAME worktree → re-review

Do NOT review code quality — that is Step 5.
```

**Do NOT proceed to quality review until spec review passes.**

---

# Step 5: Dispatch Quality Reviewers

Only after spec review PASSES. One reviewer per issue/PR.

**Role-specific instructions for CODE QUALITY REVIEWER:**

```
1. Code follows project conventions
2. No security vulnerabilities (XSS, injection)
3. Proper error handling
4. Performance considerations
5. Accessibility (WCAG 2.1 AA, 44x44px touch targets)
6. Test quality and coverage
7. E2E tests pass
8. No debug artifacts (debug-*.spec.ts, *.bak, console.log)
9. No code duplication

If APPROVED: "QUALITY APPROVED - {ISSUE_ID} code meets standards"
If ISSUES: "QUALITY ISSUES FOUND" + specific issues → implementer fixes in SAME worktree → re-review

Focus on HIGH-IMPACT issues only. Don't nitpick.
```

**Do NOT merge until quality review passes.**

---

# Step 6: Merge and Integrate

Once BOTH reviews pass for each issue:

1. Update Linear: `state: "In Review"`
2. Verify PR template is complete (all checkboxes checked, Five-Level Explanation filled)
3. Merge PRs in dependency order (foundation first, UI last; parallel if no dependencies)
4. Update Linear: `state: "Done"`. Post comment: `"Completed {ISSUE_ID}, merged PR #{PR_NUM}"`
5. Cleanup: `git worktree remove ../wt-{ISSUE_ID}-{slug}`

**Merge blockers:** Unchecked E2E checkbox, missing Five-Level Explanation, unresolved review issues.

---

# Example: Multiple Independent Issues

**Issues:** BEA-330 (login form), BEA-331 (trivia fix), BEA-332 (theme colors)

```
Step 0: Query Linear for all 3, read full context, claim with assignee: "me"
Step 1: 3 independent issues → task list
Step 2: 3 worktrees (wt-BEA-330-login, wt-BEA-331-trivia, wt-BEA-332-theme)
Step 3: 3 implementers dispatched in parallel (one Task call each, single message)
Step 4: 3 spec reviewers in parallel after implementers complete
Step 5: 3 quality reviewers in parallel after spec reviews pass
Step 6: Merge 3 PRs, update 3 issues to Done, cleanup 3 worktrees
```

Result: 3 issues → 3 worktrees → 3 PRs

---

# Troubleshooting

**Can't access Linear:** Check MCP config (`/mcp`), authenticate, or ask user for issue ID. Never fabricate IDs.

**Agent failed:** Read output, check worktree status, fix blockers, re-dispatch with corrected context.

**Reviews keep finding issues:** Verify acceptance criteria are clear in Linear. If ambiguous, ask user and update the issue.

**Quality reviewer too strict:** Focus on high-impact issues only (security, performance, accessibility are non-negotiable; style is negotiable if consistent).

**Merge conflicts:** Should not happen with independent issues. If they do, identify conflicting files, resolve manually, re-run reviews.

**Blocked on dependency:** Set issue state to "Blocked", add comment explaining the blocker, set `blockedBy` to the blocking issue ID. Resume when unblocked.
