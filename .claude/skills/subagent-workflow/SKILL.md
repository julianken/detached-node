---
name: subagent-workflow
description: MANDATORY for all multi-step tasks - parallel task execution with sequential per-task workflow (implementer → spec review → quality review) with GitHub Issues as source of truth
---

# Subagent-Driven Development Workflow

**MANDATORY for all multi-step work. Skip ONLY for single-line fixes, pure research, or reading files.**

## 8 Core Principles

1. **One GitHub Issue = one worktree = one PR** — never split an issue across multiple PRs
2. **Always query GitHub Issues before starting** — they are the source of truth
3. **Both spec + quality reviews required for each pull request** — no exceptions, no shortcuts
4. **E2E tests must pass before PR** — CI may run them too, but local validation is mandatory; do not rely on the queue to catch what the local run could
5. **All work via dispatched agents** — lead agent orchestrates, never edits code directly
6. **Fixes stay in the same worktree/PR** — never create a new PR for review fixes
7. **Update the GitHub Issue at every state transition** — full audit trail required: clean, templated comments with status bars and recently completed items
8. **Clean debug artifacts before PR** — no debug-*.spec.ts, *.bak, or console.log leftovers

## GitHub Issue State Definitions

GitHub Issues do not ship a built-in state machine beyond `open` / `closed`. Use a small set of `status:*` labels to express workflow state, plus assignee:

| State | Expression on the issue |
|-------|------------------------|
| **Backlog** | `open`, no assignee, no `status:*` label |
| **Todo** | `open`, label `status:todo`, no assignee |
| **In Progress** | `open`, label `status:in-progress`, assignee = you |
| **Blocked** | `open`, label `status:blocked` (use `Blocked by #N` line in the body to link) |
| **In Review** | `open`, label `status:in-review`, linked PR open |
| **Done** | `closed`, linked PR merged |

If the repo doesn't have these labels yet, create them once with `gh label create status:todo`, etc., before running this skill.

## Workflow Overview

```
PARALLEL across GitHub Issues, SEQUENTIAL within each issue:

#330 ─┬─ Implementer → Spec Review → Quality Review → Merge
#331 ─┬─ Implementer → Spec Review → Quality Review → Merge
#332 ─┬─ Implementer → Spec Review → Quality Review → Merge

State flow: Backlog → Todo → In Progress → [Blocked] → In Review → Done
```

## Issue Comments (3 per issue — no more)

1. **Started:** `"Starting work on #{N}"`
2. **Review findings:** Combined spec + quality review results
3. **Done:** `"Completed #{N}, merged PR #{PR_NUM}"`

---

# Step 0: Get Work from GitHub Issues

**MANDATORY first step.**

1. List ready-to-start issues:
   ```
   gh issue list --state open --label "status:todo" --json number,title,labels,body,assignees
   ```
   Or to scan the backlog:
   ```
   gh issue list --state open --json number,title,labels,assignees
   ```
2. Filter for unblocked issues — drop anything with `status:blocked` or with a `Blocked by #N` reference whose blocker is still open.
3. Read full issue details:
   ```
   gh issue view <issue-num> --json title,body,labels,assignees,comments,milestone
   ```
   Walk through: description, acceptance criteria, comments, linked PRs, labels, dependencies.
4. **Claim the issue:**
   ```
   gh issue edit <issue-num> --add-assignee @me --add-label "status:in-progress" --remove-label "status:todo"
   ```

**If `gh` is not authenticated or the repo's issue tracker is unreachable:** STOP. Run `gh auth login` or ask the user to provide a specific issue number. Never fabricate issue numbers.

---

# Step 1: Identify Parallel GitHub Issues

Look for independent issues that modify different files/areas and have no dependencies on each other.

```
✅ GOOD: 3 independent issues → 3 worktrees → 3 PRs (parallel)
❌ BAD:  1 issue split into 3 tasks → 3 worktrees → 3 PRs (never do this)
```

Track each issue with `TodoWrite`.

---

# Step 2: Create Git Worktrees

One worktree per GitHub Issue using `Skill(using-git-worktrees)`:

```bash
git worktree add ../wt-330-login-form -b feat/login-form
cd ../wt-330-login-form && ./scripts/setup-worktree-e2e.sh && cd -
```

**CRITICAL:** Run `./scripts/setup-worktree-e2e.sh` in EACH worktree to prevent port conflicts.

Verify: `git worktree list`

---

# Step 3–5: Dispatch Agent Template

Steps 3, 4, and 5 each dispatch agents using `Task`. All agents for a given step are dispatched in a SINGLE message (parallel execution). Below is the reusable prompt template — each step fills in the role-specific section.

## Common Prompt Template

```
You are the {ROLE} for GitHub Issue #{N}.

**Working directory:** ../wt-{N}-{slug}
**Issue:** #{N} "{title}"
{IF_REVIEW: **PR to review:** PR #{PR_NUM}}

**Context scope:**
1. Always read the project root CLAUDE.md
2. Read additional CLAUDE.md files only if the issue spans those areas
3. Determine scope from: issue title, description, file paths mentioned, labels

**Issue context:** Read issue #{N} description, comments, and linked PRs.

{ROLE_SPECIFIC_INSTRUCTIONS}

**CRITICAL:**
- One PR for the ENTIRE issue — do NOT split
- Fixes happen in the SAME worktree/PR, never a new one
- E2E tests MUST pass before marking complete
```

---

# Step 3: Dispatch Implementer Agents

Update each issue: add `status:in-progress` label, assign to you. Post comment: `"Starting work on #{N}"`.

**Role-specific instructions for IMPLEMENTER:**

```
1. Read the GitHub Issue for FULL context (description, comments, linked PRs)
2. Read the project CLAUDE.md for patterns (context scope above)
3. Implement the ENTIRE issue in this worktree
4. Write tests (>80% coverage)
5. Run pre-PR gate:
   pnpm test:run && pnpm lint && pnpm typecheck
   pnpm test:e2e && pnpm test:e2e:summary  # MUST show "0 failed"
   git status --porcelain | grep -E "debug-|\.bak$" && echo "FAIL" && exit 1
6. Clean debug artifacts (debug-*.spec.ts, *.bak, console.log)
7. Commit using conventional-commit prefix: feat(scope): description (#N)
8. Self-review, push, create draft PR using .github/PULL_REQUEST_TEMPLATE.md
9. Comment on the issue with pre-PR verification evidence (actual test output)
10. Mark task as completed
11. Documentation check: If your changes touch any of these high-signal files, update the corresponding doc section per the project's Update Triggers table:
    - Keyboard shortcut handlers → CLAUDE.md Keyboard Shortcuts
    - API route directories → CLAUDE.md API Routes
    - New packages → root CLAUDE.md package table
    - Scene/state type definitions → CLAUDE.md Architecture Notes
    If no doc-impacting changes, note "No doc updates needed" in your commit.
```

**BLOCKING:** Do NOT create PR if ANY check fails. Fix first, re-run, then proceed.

---

# Step 4: Dispatch Spec Reviewers

One reviewer per issue/PR.

**Role-specific instructions for SPEC COMPLIANCE REVIEWER:**

```
1. Read the GitHub Issue's acceptance criteria
2. Review PR diff and code
3. Verify EACH acceptance criterion is met
4. Check tests cover acceptance criteria
5. Verify E2E tests pass
6. Documentation verification: Confirm that the implementer updated docs if changes touched files listed in the project's Update Triggers table, or explicitly noted "No doc updates needed."

If APPROVED: "SPEC COMPLIANT - #{N} acceptance criteria met"
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

If APPROVED: "QUALITY APPROVED - #{N} code meets standards"
If ISSUES: "QUALITY ISSUES FOUND" + specific issues → implementer fixes in SAME worktree → re-review

Focus on HIGH-IMPACT issues only. Don't nitpick.
```

**Do NOT merge until quality review passes.**

---

# Step 6: Merge and Integrate

Once BOTH reviews pass for each issue:

1. Update the issue: replace `status:in-progress` with `status:in-review`
2. Verify PR template is complete (all checkboxes checked, Five-Level Explanation filled)
3. Merge PRs in dependency order (foundation first, UI last; parallel if no dependencies). On Mergify-managed repos, comment `@mergifyio queue` rather than calling `gh pr merge` directly.
4. Issue closes automatically if the PR body contains `Closes #N`. Otherwise, run `gh issue close <N>`. Post comment: `"Completed #{N}, merged PR #{PR_NUM}"`
5. Cleanup: `git worktree remove ../wt-{N}-{slug}`

**Merge blockers:** Unchecked E2E checkbox, missing Five-Level Explanation, unresolved review issues.

---

# Example: Multiple Independent Issues

**Issues:** #330 (login form), #331 (trivia fix), #332 (theme colors)

```
Step 0: gh issue list with status:todo, read full context, claim with @me + status:in-progress
Step 1: 3 independent issues → task list
Step 2: 3 worktrees (wt-330-login, wt-331-trivia, wt-332-theme)
Step 3: 3 implementers dispatched in parallel (one Task call each, single message)
Step 4: 3 spec reviewers in parallel after implementers complete
Step 5: 3 quality reviewers in parallel after spec reviews pass
Step 6: Merge 3 PRs (auto-closes 3 issues via "Closes #N"), cleanup 3 worktrees
```

Result: 3 issues → 3 worktrees → 3 PRs

---

# Troubleshooting

**Can't access GitHub:** Run `gh auth login`, or ask the user for the issue number. Never fabricate issue numbers.

**Agent failed:** Read output, check worktree status, fix blockers, re-dispatch with corrected context.

**Reviews keep finding issues:** Verify acceptance criteria are clear in the GitHub Issue. If ambiguous, ask the user and update the issue body.

**Quality reviewer too strict:** Focus on high-impact issues only (security, performance, accessibility are non-negotiable; style is negotiable if consistent).

**Merge conflicts:** Should not happen with independent issues. If they do, identify conflicting files, resolve manually, re-run reviews.

**Blocked on dependency:** Add `status:blocked` label to the issue, add a comment explaining the blocker, and add a `Blocked by #N` line to the issue body. Resume when unblocked.
