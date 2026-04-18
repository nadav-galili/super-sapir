# Context

You are working on **RetailSkillz Analytics** (nadav-galili/super-sapir), a B2B SaaS retail management dashboard MVP. Hebrew RTL interface, Bun + Vite + React 19 + TypeScript.

## Recent commits

!`git log --oneline -10`

## Open Sandcastle issues

!`gh issue list --state open --label Sandcastle --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'`

# Task

1. Read `CLAUDE.md` at the repo root — it contains the full architecture, design system rules, and project conventions. Follow it strictly.
2. Read `architecture.md` for the file tree and route map.
3. Identify all open issues labeled `Sandcastle` whose blockers (listed in "Blocked by") are already closed.
4. Work through each unblocked issue **in order** (lowest issue number first). For each issue:
   a. Implement the issue according to its acceptance criteria.
   b. Follow the design system in CLAUDE.md — especially:
   - Color palette (KPI status colors from shared utility, CTA stays `#DC4E59`)
   - Font sizes (minimum 15px for labels, 18px for body)
   - RTL conventions (`ms-`/`me-`/`ps-`/`pe-`, not `ml-`/`mr-`)
   - Border radius rules
     c. Verify: `bun run build` passes and `bun run lint` passes.
     d. Commit by invoking the **`/update-docs-and-commit`** slash command. It updates `changelog.md` (and `architecture.md` if structure changed), stages, and commits in one step. Make sure the commit message it produces references the issue number (e.g. "Fix #13: ..."). Do **not** hand-roll `git commit` or separately edit `changelog.md` — always go through this command.
     e. Close the issue: `gh issue close <number> --comment "Implemented in this branch."`
     f. Re-check blockers — completing this issue may unblock others. If so, continue to the next unblocked issue.

# Done

When all unblocked issues are implemented, closed, build passes, and lint is clean:

<promise>COMPLETE</promise>
