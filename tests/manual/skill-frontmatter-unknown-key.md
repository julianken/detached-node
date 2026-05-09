# One-shot manual test — SKILL.md frontmatter unknown-key tolerance

## Purpose

30-second pre-W3.4 verification that Claude Code's SKILL.md parser tolerates unknown
frontmatter keys (specifically `realizes:`). This confirms the parser does not hard-crash
or refuse to load a skill when it encounters an unrecognised key.

Honest limitation per `docs/agentic-bridge/reframe/analysis-v1.md` §J #3 / Risk 10
item 3: there is no automated way to assert this at the unit level; the only observable
signal is whether Claude Code's session start succeeds and the skill remains callable.

**This is a one-shot artifact.** It is run once before W3.4 (#322 12-factor-agent
umbrella) and then archived. It has no CI integration and no idempotency requirement.

---

## Procedure

- [ ] Pick the target SKILL.md:
  `.claude/skills/subagent-workflow/SKILL.md`
  (any other in-repo SKILL.md is equally valid).

- [ ] Open the file and add a single dummy key to its YAML frontmatter block, e.g.:

  ```yaml
  ---
  name: subagent-workflow
  description: "..."
  realizes: [test-pattern]
  ---
  ```

  The `realizes:` line is the unknown key under test. Insert it anywhere inside the
  `---` delimiters, not outside them.

- [ ] Save the file.

- [ ] Open Claude Code in a **fresh session** in the repository root
  (close any existing session first so the skill cache is cold).

- [ ] Confirm no parse error appears in Claude Code's startup output or logs.
  Expected: the session starts normally; the skill is listed and loadable.

- [ ] If the `mcp__plugin_<x>__list_skills` tool is available in the session, invoke it
  and confirm the call completes without a crash or error response.

- [ ] Revert the `realizes:` line from the SKILL.md frontmatter before closing the
  session (or immediately after recording the result below).

---

## Result

Record the outcome after running the procedure above.

- [ ] PASS — session started normally; skill loaded; no parse error observed.
  - [ ] `list_skills` (if available): no crash.
- [ ] FAIL — parse error or skill failed to load.

**Observation:**
<!-- Replace this line with a brief note: what you saw, Claude Code version, date. -->

---

## One-shot framing

This artifact is:

- **Not idempotent** — running the procedure a second time is meaningless (the result
  was already recorded on the first run).
- **Not integrated into CI** — no `.github/workflows/` entry references this file.
- **Not a script** — there is no `.sh` or `.ts` counterpart to automate these steps.
- **Archived after use** — once the result is recorded, this file serves only as an
  audit trail. It does not need to be re-executed.
