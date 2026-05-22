# Agents And Teams

This page records the current LaoHuang desktop behavior for agents and agent
teams. It is based on the current source, not on the upstream screenshots.

## Current Status

| Area | Status | Notes |
| --- | --- | --- |
| Installed agents browser | Verified | Settings has a real Agents tab backed by `/api/agents`. |
| Agent detail view | Verified | Shows source, model display, tools, description, base directory, and system prompt. |
| Agent CRUD API | Partially surfaced | Server supports create/update/delete under `/api/agents`; the current desktop UI is read-only. |
| Plugin agent navigation | Verified | Plugin detail can jump into the shared Agents tab after a plugin is enabled. |
| Team list/detail API | Verified | Reads team config and member state from the local Claude config directory. |
| Team status bar | Verified by UI/store tests | Active session can show a team strip and open member transcript tabs. |
| Live team orchestration | Needs runtime validation | Requires a real multi-agent session and CLI-created team files. |

`desktop/src/pages/AgentTeams.tsx` is currently a mock/demo surface using
`desktop/src/mocks/data.ts`. Do not treat it as the current production team
manager. The production UI path is the Settings Agents tab plus
`TeamStatusBar` inside an active session.

## UI Entry Points

| UI | Path | Behavior |
| --- | --- | --- |
| Settings > Agents | `desktop/src/pages/Settings.tsx` | Uses `AgentsSettings` to fetch and group installed agents. |
| Agent detail | `desktop/src/pages/Settings.tsx` | Renders one selected agent and its system prompt. |
| Plugin detail > Agents | `desktop/src/components/plugins/PluginDetail.tsx` | Opens a plugin-provided agent in the shared Agents tab. |
| Active session team strip | `desktop/src/components/teams/TeamStatusBar.tsx` | Shows team progress and member rows when `activeTeam` exists. |
| Member transcript tab | `desktop/src/stores/teamStore.ts` | Opens a synthetic `team-member:<agentId>` session tab. |

## Agent API

| Endpoint | Method | Current behavior |
| --- | --- | --- |
| `/api/agents?cwd=...` | `GET` | Lists active and all resolved agents for a workspace. |
| `/api/agents/:name` | `GET` | Reads one user-created agent file through `AgentService`. |
| `/api/agents` | `POST` | Creates a YAML user agent under the config directory. |
| `/api/agents/:name` | `PUT` | Updates an existing user agent file. |
| `/api/agents/:name` | `DELETE` | Deletes an existing user agent file. |

The Settings UI currently calls only `GET /api/agents`. The CRUD endpoints are
available at the desktop-server layer, but no current LaoHuang Settings control
creates, edits, or deletes agents.

## Agent Sources

`GET /api/agents` uses `getAgentDefinitionsWithOverrides(cwd)` and serializes
both active and shadowed entries. Current source labels include:

| Source | Meaning in UI |
| --- | --- |
| `built-in` | Bundled agent definition. |
| `userSettings` | User-level agent definition. |
| `projectSettings` | Project-level agent definition. |
| `localSettings` | Local workspace settings. |
| `policySettings` | Managed/policy source. |
| `flagSettings` | CLI-provided source. |
| `plugin` | Agent supplied by an enabled plugin. |

The UI groups by source and marks entries shadowed by a higher-priority source
with `overriddenBy`.

## Agent Storage

The direct CRUD service writes user agents to:

```text
$CLAUDE_CONFIG_DIR/agents
```

or, when `CLAUDE_CONFIG_DIR` is not set:

```text
~/.claude/agents
```

Supported file shapes:

| Extension | Format |
| --- | --- |
| `.yaml` / `.yml` | YAML fields including `systemPrompt`. |
| `.md` | YAML frontmatter plus body used as `systemPrompt` when not present in frontmatter. |

New agent names are sanitized to lowercase file names with only
`a-z`, `0-9`, `_`, and `-`.

## Team API

| Endpoint | Method | Current behavior |
| --- | --- | --- |
| `/api/teams` | `GET` | Lists teams from local team directories. |
| `/api/teams/:name` | `GET` | Returns team detail and discovered members. |
| `/api/teams/:name/members/:id/transcript` | `GET` | Reads a member transcript from session JSONL or subagent JSONL. |
| `/api/teams/:name/members/:id/messages` | `POST` | Writes a user message to the member mailbox. |
| `/api/teams/:name` | `DELETE` | Deletes inactive teams; active members block deletion. |

## Team Storage

Team state is read from:

```text
$CLAUDE_CONFIG_DIR/teams/{teamName}/config.json
$CLAUDE_CONFIG_DIR/teams/{teamName}/inboxes/*.json
$CLAUDE_CONFIG_DIR/projects/{projectId}/{sessionId}.jsonl
$CLAUDE_CONFIG_DIR/projects/{projectId}/{leadSessionId}/subagents/*.jsonl
```

When `CLAUDE_CONFIG_DIR` is not set, the base is `~/.claude`.

The service intentionally discovers extra members from `inboxes/` and
`subagents/` so the UI can recover from concurrent config writes that omit a
new member.

## Team Runtime Flow

1. The CLI or agent runtime creates a team under the Claude config directory.
2. `teamWatcher.start()` begins polling from `src/desktop-server/index.ts`.
3. `TeamWatcher` broadcasts WebSocket events:
   - `team_created`
   - `team_update`
   - `team_deleted`
4. `teamStore` updates `activeTeam`.
5. `TeamStatusBar` renders the member strip in `ActiveSession`.
6. Clicking a member opens a synthetic session tab.
7. That tab polls the member transcript every 1500 ms while the member is
   running or has pending user messages.

## Verification

Automated coverage currently includes:

```bash
bun test src/desktop-server/__tests__/teams.test.ts
bun test src/desktop-server/__tests__/team-watcher.test.ts
cd desktop && bun test src/__tests__/agentsSettings.test.tsx
```

Related transcript rendering and background-agent behavior is covered in:

```bash
cd desktop && bun test src/components/chat/MessageList.test.tsx
cd desktop && bun test src/pages/ActiveSession.test.tsx
```

## Manual Validation Still Needed

- Launch a real multi-agent/team run from the current app.
- Confirm the active session shows `TeamStatusBar`.
- Open one member transcript tab and watch it refresh.
- Send a direct message to a member and confirm it is written to the mailbox and
  later appears in the transcript.
- Confirm inactive teams can be deleted and active teams are blocked.

