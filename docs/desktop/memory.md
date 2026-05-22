# Memory

This page records the current LaoHuang desktop memory surface. It covers the
desktop Settings memory editor and the memory events shown inside chat.

## Current Status

| Area | Status | Notes |
| --- | --- | --- |
| Memory project list | Verified | Lists current and existing project memory directories. |
| Memory file browser | Verified | Shows markdown files as a nested resource tree. |
| Memory editor | Verified | Reads, edits, previews, and saves markdown files. |
| Memory file creation API | Verified at API/store layer | `PUT /api/memory/file` can create files; current visible UI is focused on existing files. |
| Chat memory cards | Verified by component tests | Saved/read memory activity can open the Memory tab at a target file. |
| Automatic memory extraction | Needs runtime validation | Upstream memory docs describe richer behavior; the current desktop docs only claim tested UI/API behavior. |

## UI Entry Points

| UI | Path | Behavior |
| --- | --- | --- |
| Settings > Memory | `desktop/src/pages/MemorySettings.tsx` | Project picker, search, file tree, editor, preview, save/revert. |
| Chat memory saved card | `desktop/src/components/chat/MessageList.tsx` | Opens Settings > Memory and targets the saved file. |
| Tool group memory activity | `desktop/src/components/chat/ToolCallGroup.tsx` | Promotes memory reads/writes into dedicated memory UI cards. |

## API

| Endpoint | Method | Current behavior |
| --- | --- | --- |
| `/api/memory/projects?cwd=...` | `GET` | Lists project-scoped memory directories. |
| `/api/memory/files?projectId=...` | `GET` | Lists markdown files for one memory project. |
| `/api/memory/file?projectId=...&path=...` | `GET` | Reads one markdown memory file. |
| `/api/memory/file` | `PUT` | Updates or creates one markdown memory file. |

## Storage

Project memory lives under:

```text
$CLAUDE_CONFIG_DIR/projects/{projectId}/memory
```

or, when `CLAUDE_CONFIG_DIR` is not set:

```text
~/.claude/projects/{projectId}/memory
```

`projectId` is the sanitized canonical git root or cwd, using the same
sanitization style as the session storage layer.

## File Rules

| Rule | Value |
| --- | --- |
| Editable file extension | `.md` only |
| Maximum editable file size | 512 KB |
| Maximum listed files per project | 500 |
| Hidden entries | dotfiles and dot-directories are skipped |
| Ignored directory | `node_modules` |
| New file mode | `0600` |
| Created directory mode | `0700` |

Paths must be relative markdown paths. Absolute paths, empty segments, `.`,
`..`, null bytes, and non-markdown files are rejected.

## Safety Boundary

The memory API checks that project directories and memory files remain inside
the expected `projects/{projectId}/memory` boundary. Existing paths are resolved
with realpath checks, so symlink escapes are rejected.

When writing, the API creates the containing directory first, then checks the
directory boundary again before writing the file.

## Project Labels

The Memory UI attempts to show helpful labels instead of only sanitized project
IDs. Label resolution uses:

1. the current cwd or canonical git root,
2. recent session JSONL metadata fields such as `cwd`, `workDir`, or
   `projectPath`,
3. a bounded filesystem search under home and temporary roots,
4. the unsanitized project ID as a fallback.

## Chat Integration

The chat transcript can surface memory activity in two ways:

- `memory_event` system messages become saved-memory cards.
- Tool calls that read/write files under a memory directory are promoted into
  memory-specific cards.

Clicking a memory card sets:

```text
pendingSettingsTab = "memory"
pendingMemoryPath = <absolute memory path>
```

`MemorySettings` then resolves that absolute path to the matching project and
relative memory file.

## Verification

Automated coverage currently includes:

```bash
bun test src/desktop-server/__tests__/memory.test.ts
bun test src/desktop-server/__tests__/ws-memory-events.test.ts
cd desktop && bun test src/__tests__/memorySettings.test.tsx
cd desktop && bun test src/components/chat/MessageList.test.tsx
```

## Manual Validation Still Needed

- Save a memory edit from the packaged macOS app.
- Trigger a real memory write during a chat session and verify the card opens
  the correct file.
- Validate any automatic memory extraction or AutoDream-style behavior before
  documenting it as available in LaoHuang.

