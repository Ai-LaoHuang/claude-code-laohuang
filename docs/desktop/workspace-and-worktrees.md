# Workspace And Worktrees

This page documents the current Claude Code LaoHuang workspace, repository
launch, changed-file, and rewind behavior. The implementation is already in the
app; this page is the recovery map for future UI and feature work.

## User-Facing Surfaces

| Surface | Current files | Purpose |
| --- | --- | --- |
| Repository launch controls | `desktop/src/components/shared/RepositoryLaunchControls.tsx` | Pick a directory, branch, and current-vs-isolated worktree launch mode before creating a session. |
| Empty-session launcher | `desktop/src/pages/EmptySession.tsx` | Creates the initial desktop session and forwards repository launch options to the server. |
| Active workspace panel | `desktop/src/components/workspace/WorkspacePanel.tsx` | Shows changed files, file tree, previews, diffs, image previews, and code references. |
| Workspace panel store | `desktop/src/stores/workspacePanelStore.ts` | Owns panel width, active view, request ordering, tree expansion, and preview tabs. |
| Chat context store | `desktop/src/stores/workspaceChatContextStore.ts` | Turns file references, code comments, selections, and chat selections into prompt context. |

## Repository Launch Flow

The desktop UI asks the server for repository context before creating a
session:

`GET /api/sessions/repository-context?workDir=...`

The response includes:

- repository root and display name
- current branch and default branch
- dirty status from `git status --porcelain`
- local and remote branches
- known Git worktrees
- whether a branch is already checked out elsewhere

Launch options are sent through `POST /api/sessions`:

```json
{
  "workDir": "/path/to/repo",
  "repository": {
    "branch": "feature/example",
    "worktree": true
  }
}
```

If `worktree` is false, the app records a direct checkout plan. The actual
branch switch is deferred until CLI startup, so placeholder session metadata can
be safely replaced by the real transcript.

If `worktree` is true, the app first stores a planned isolated worktree path in
session metadata. The real worktree is materialized when the CLI process starts.
This keeps empty sessions light and avoids creating orphan worktrees when a
session is only prepared but never launched.

## Isolated Worktree Details

Desktop-created isolated worktrees use this shape:

| Item | Current behavior |
| --- | --- |
| Directory | `<repo>/.claude/worktrees/desktop-<branch>-<session-prefix>` |
| Branch | `worktree-desktop-<branch>-<session-prefix>` |
| Base ref | selected local branch or remote tracking ref |
| Exclusion | `.claude/worktrees/` is added to the repo Git exclude file |
| Post-create setup | copy local settings, configure hooks, symlink configured large directories, copy `.worktreeinclude` files |

Internal desktop branches starting with `worktree-desktop-` are hidden from
normal branch pickers. When recent projects and session metadata are displayed,
the UI should prefer the source project identity over internal worktree branch
names.

Safety behavior:

- Missing or non-directory working directories return structured bad-request
  errors.
- Non-Git directories cannot use branch/worktree launch options.
- Direct branch launch blocks branches already checked out in another worktree.
- Dirty source checkouts can still plan an isolated worktree because the source
  folder is not switched.
- Worktree slugs are validated to prevent path traversal and directory escape.

## Workspace Panel

The workspace panel is the desktop-side code surface for an active session. It
uses these server routes:

| Route | Purpose |
| --- | --- |
| `GET /api/sessions/:id/workspace/status` | Current repo/session changed files and branch context. |
| `GET /api/sessions/:id/workspace/tree?path=...` | One-level file tree listing for the selected workspace path. |
| `GET /api/sessions/:id/workspace/file?path=...` | Text, Markdown, or image preview. |
| `GET /api/sessions/:id/workspace/diff?path=...` | Git/session diff for a path. |

The panel has two views:

- `Changed`: merged changed files from Git status, session transcript changes,
  and file-history snapshots.
- `All`: a tree browser rooted at the session workspace.

Preview support:

- text files with language hints and line numbers
- Markdown rendered preview
- common image extensions as data URLs
- binary and too-large states
- Git diffs, session diffs, and synthesized untracked-file diffs

Workspace references can be added to the composer as:

- file references
- line comments
- line selections
- chat selections

`formatWorkspaceReferencePrompt()` emits a compact context block using
`@"path:Lx-Ly"` style labels plus optional comments and quoted code. This is the
bridge between UI inspection and the next model turn.

## File And Path Boundaries

Workspace reads resolve every requested path against the session workdir and
reject escapes. Current limits:

- text preview reads up to 1 MB
- untracked synthesized diff stats avoid reading large untracked files beyond
  the configured stat limit
- Git operations use no-prompt environment variables and timeouts
- workspace tree listing hides dotfiles by default
- binary files are detected by NUL bytes

The server supports non-Git workspaces for file/session changes, but Git-only
features such as Git diff return explicit non-Git states.

## Rewind And Turn Checkpoints

Rewind is exposed through:

| Route | Purpose |
| --- | --- |
| `POST /api/sessions/:id/rewind` | Dry-run or execute a rewind to a selected user message. |
| `GET /api/sessions/:id/turn-checkpoints` | List completed turn checkpoints and file-change previews. |
| `GET /api/sessions/:id/turn-checkpoints/diff?targetUserMessageId=...&path=...` | Diff for a path at a selected checkpoint. |

The rewind target can be selected by `targetUserMessageId` or by
`userMessageIndex`. The request may include `expectedContent`; when present,
the server rejects stale index fallbacks if the visible prompt text no longer
matches.

File restoration prefers file-history snapshots stored under:

`~/.claude/file-history/<sessionId>/...`

When snapshots are missing, the server falls back to transcript tool changes
from `Write`, `Edit`, `MultiEdit`, `NotebookEdit`, and `apply_patch`. It also
pulls related child/subagent transcript changes into the parent turn preview.

Execution behavior:

- dry-run returns the messages/files that would be removed or restored
- execute trims the active conversation chain after the selected point
- edited files are restored from backups when possible
- files created after the target turn can be removed
- checkpoint paths are resolved from the target prompt cwd, with workspace
  boundary checks

## Verification

Automated coverage:

```bash
bun test src/desktop-server/__tests__/workspace-service.test.ts
bun test src/desktop-server/__tests__/sessions.test.ts
cd desktop && bun run test -- \
  src/components/shared/RepositoryLaunchControls.test.tsx \
  src/pages/EmptySession.test.tsx \
  src/components/workspace/WorkspacePanel.test.tsx \
  src/stores/workspacePanelStore.test.ts \
  src/stores/workspaceChatContextStore.test.ts \
  --run
bun run smoke:laohuang-runtime
```

Packaged app validation on 2026-05-19:

- Launched the packaged macOS app with `./script/build_and_run.sh --verify`.
- Created a disposable Git repository with `main` and
  `feature/workspace-check`.
- Verified `GET /api/sessions/repository-context` from the packaged sidecar
  reported the current branch, dirty state, local branches, and current
  worktree.
- Created a current-branch session and an isolated-worktree session through the
  packaged sidecar API.
- Verified the isolated session reports a planned
  `.claude/worktrees/desktop-...` path and `worktree-desktop-...` branch without
  materializing the directory before CLI startup.
- Verified packaged workspace APIs for changed files, root tree, Markdown/text
  preview, tracked diff, untracked diff, PNG image preview, and traversal
  rejection.
- Verified the running desktop UI lists the validation project, opens the
  workspace panel, shows changed files/diff, and can add `README.md` as a
  composer reference.

Deferred from this no-cost validation pass:

- Sending a real model prompt to materialize the isolated worktree.
- Executing rewind against a live conversation. The route was present and empty
  sessions returned no checkpoints; full restore behavior remains covered by
  automated tests until a disposable live conversation is created.

Manual checks still needed after major UI restyles:

1. Create a session on the current branch.
2. Create a session on another branch with `Current worktree`.
3. Create a session on another branch with `Isolated worktree`.
4. Open the workspace panel, inspect a changed text file, image file, and diff.
5. Add a code comment or selection to the composer and verify it appears in the
   sent prompt.
6. Rewind one completed turn with dry-run first, then execute in a disposable
   test repository.
