Update project documentation and commit all changes.

## Steps

1. **Analyze recent changes**: Run `git diff --staged` and `git diff` to understand what changed since the last commit. Also run `git log -1 --oneline` to see the last commit message for context.

2. **Update `changelog.md`**: Add a new dated entry (or append to today's entry if one exists) summarizing the changes. Follow the existing format with a date header (`## YYYY-MM-DD - Description`) and categorized bullet points. Be concise but thorough.

3. **Update `architecture.md`** (only if needed): If the changes affect the project structure (new files, removed files, new dependencies, new scripts, changed test counts, etc.), update the relevant sections. If nothing structural changed, skip this step.

4. **Stage and commit**: Stage all changes (including the doc updates) and create a commit with a meaningful message that summarizes the work done. Follow the repository's commit message style. End the commit message with:
   ```
   Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
   ```

Do NOT push to remote — only commit locally.
