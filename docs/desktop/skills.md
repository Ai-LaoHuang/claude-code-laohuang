# Skills

This page records the current LaoHuang desktop behavior for Skills. The UI
label is intentionally English: `Skills`.

## Current Status

| Area | Status | Notes |
| --- | --- | --- |
| Skill browser | Verified | Settings > Skills lists user, project, and plugin skills. |
| Skill detail view | Verified | Shows metadata, file tree, markdown body, and code files. |
| Slash command discovery | Verified | User-invocable skills are merged into session slash commands. |
| Plugin skill navigation | Verified | Plugin detail can jump into the shared Skills tab. |
| Skill editing/installation | Not surfaced here | This page is a browser/reader, not an installer or editor. |

## UI Entry Points

| UI | Path | Behavior |
| --- | --- | --- |
| Settings > Skills | `desktop/src/components/skills/SkillList.tsx` | Groups skills by source, shows counts and token estimates. |
| Skill detail | `desktop/src/components/skills/SkillDetail.tsx` | Shows entry metadata, rendered markdown, code files, and file tree. |
| Plugin detail > Skills | `desktop/src/components/plugins/PluginDetail.tsx` | Opens a plugin-provided skill in the shared Skills tab. |
| Slash command panel | `src/desktop-server/api/sessions.ts` | Adds invocable skills to slash commands for a session cwd. |

## API

| Endpoint | Method | Current behavior |
| --- | --- | --- |
| `/api/skills?cwd=...` | `GET` | Lists skill metadata from user, project, and plugin sources. |
| `/api/skills/detail?source=...&name=...&cwd=...` | `GET` | Returns full skill detail, file tree, and readable files. |

Only `GET` is supported. Mutating requests return method-not-allowed.

## Skill Sources

| Source | Location |
| --- | --- |
| `user` | `$CLAUDE_CONFIG_DIR/skills` or `~/.claude/skills` |
| `project` | `.claude/skills` directories from cwd upward toward home |
| `plugin` | enabled plugin `skillsPath` / `skillsPaths` entries |

Plugin skill names are namespaced as:

```text
{pluginName}:{skillDirectoryName}
```

This prevents collisions with user and project skills and lets plugin detail
open the exact skill entry later.

## Skill Metadata

Each skill directory must contain:

```text
SKILL.md
```

The API reads markdown frontmatter from `SKILL.md`. Important fields:

| Field | Behavior |
| --- | --- |
| `name` | Display name in the UI. |
| `description` | Description shown in list/detail; first non-empty body line is fallback. |
| `version` | Optional version pill. |
| `user-invocable` | `false` hides the skill from slash command discovery. |

The UI also displays common frontmatter keys such as `when_to_use`,
`argument-hint`, `allowed-tools`, `model`, `effort`, `paths`, `agent`, and
`context` when present.

## Detail File Rules

| Rule | Value |
| --- | --- |
| Maximum readable files | 50 |
| Maximum readable file size | 100 KB |
| Skipped entries | `node_modules`, `.git`, `__pycache__`, `.DS_Store`, dotfiles |
| Entry file | `SKILL.md` |

The detail API still includes large/unreadable files in the tree when possible,
but it only returns content for files below the 100 KB size limit.

Supported language labels include markdown, TypeScript, JavaScript, JSON, YAML,
shell, Python, TOML, CSS, HTML, text, XML, SQL, Rust, and Go.

## Slash Commands

Session APIs call `listSkillSlashCommands(cwd)`. The list includes skills whose
metadata has:

```text
user-invocable != false
```

Each invocable skill contributes:

```ts
{
  name: skill.name,
  description: skill.description || ''
}
```

Those skill slash commands are merged with the session's cached slash commands
inside `src/desktop-server/api/sessions.ts`.

## Verification

Automated coverage currently includes:

```bash
bun test src/desktop-server/__tests__/skills.test.ts
cd desktop && bun test src/__tests__/skillsSettings.test.tsx
cd desktop && bun test src/components/skills/SkillDetail.test.tsx
```

Related plugin navigation behavior is covered in:

```bash
cd desktop && bun test src/__tests__/pluginsSettings.test.tsx
```

## Manual Validation Still Needed

- Open Settings > Skills in the packaged macOS app and confirm user, project,
  and plugin groups appear as expected.
- Open a plugin-provided skill from Plugin detail after enabling and applying a
  plugin reload.
- Start a session in a workspace with `.claude/skills` and confirm invocable
  skills appear in slash commands.

