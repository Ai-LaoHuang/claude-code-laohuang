# Current Feature State

This page records what is currently known about Claude Code LaoHuang after the
upstream test backfill on 2026-05-18.

## Verified By Automated Tests

| Area | State | Notes |
| --- | --- | --- |
| Desktop server APIs | Verified | `bun run test:desktop-server` passes 773 tests across 46 files. |
| Provider presets and proxy transforms | Verified | Includes LaoHuang OpenAI-compatible preset ordering and Anthropic/OpenAI Chat/Responses transforms. |
| MiniMax runtime smoke | Verified | `smoke:laohuang-runtime` confirms the active provider/model/base URL path. |
| Sessions and WebSocket chat | Verified | Uses the mock SDK CLI in tests; covers streaming, reconnect, stop, permission, runtime override, and startup errors. |
| H5 access security | Verified | Token gating, CORS, local loopback exemptions, remote browser restrictions, REST, proxy, SDK, and WebSocket routes are covered. |
| Settings and model APIs | Verified | Covers model switching, effort levels, provider-managed settings, and OpenAI OAuth model visibility. |
| Plugins and skills APIs | Verified | Plugin reload rereads settings, `enabledPlugins` version arrays count as enabled, skills list user/project/plugin sources. |
| Tasks and scheduled tasks | Verified | Covers nested task lists and scheduled cron task CRUD. |
| Teams and agents APIs | Verified | Covers team listing, member transcript lookup, agent CRUD, and source-based shared agent lists. |
| Memory API | Verified | Covers project memory listing, read/write boundaries, metadata, traversal, and symlink safety. |
| Workspace/filesystem APIs | Verified | Covers git status/diff, file tree, read states, search, traversal, and symlink safety. |
| Repository launch, worktrees, and rewind | Verified | Covers repository context, branch launch planning, isolated worktree metadata, Git info, workspace panel stores, turn checkpoints, and rewind restore flows. |
| Computer Use API config | Verified | Covers enable flag, CLI gate wiring, Python interpreter normalization, Python runtime discovery, and requirement pinning; real OS control still needs manual runtime validation. |
| Desktop ChatInput regression | Verified | Covers the prior "empty session cannot send because launch controls are hidden" bug. |

## Verified By Smoke, Not Full Live Credentials

| Area | State | Notes |
| --- | --- | --- |
| Provider proxy live call | Skipped unless credentials exist | Static and stream transforms pass; live request is intentionally skipped without real provider credentials. |
| IM adapters | Config validation tested | Adapter APIs mask, preserve, and clear credentials. Telegram/Feishu/WeChat/DingTalk live message delivery still needs credentials and manual validation. |
| OpenAI OAuth | Storage/API flow tested | Token storage, status, refresh failure, and model visibility are covered; real browser OAuth flow should be manually checked when account credentials are available. |
| Computer Use desktop control | Config tested | API configuration is covered; actual Python bridge/app control should be tested on the target Mac. |
| Packaged workspace UI | Partial live pass | Packaged app launched on 2026-05-19. Project/session listing, workspace changed files, diff preview, composer file reference, sidecar workspace APIs, and traversal rejection were validated. Real model-send worktree materialization and live rewind execute were deferred to avoid an unplanned provider call. |

## Current Runtime Defaults

| Item | Current value |
| --- | --- |
| Package name | `claude-code-laohuang` |
| App version | `0.1.0` |
| Author | `AI老黄` |
| CLI binary | `bin/claude-code-laohuang` |
| Main quality command | `bun run quality:laohuang` |
| Desktop server test command | `bun run test:desktop-server` |
| Runtime smoke command | `bun run smoke:laohuang-runtime` |

## Important Implementation Notes

- The app still uses some internal storage names inherited from cc-haha, such
  as `cc-haha` managed settings directories. Do not rename those casually
  without a migration.
- `script/build_and_run.sh` should not force the local Codex bridge by default.
  The bridge path is opt-in via `USE_CODEX_BRIDGE=1`.
- `getModelOptions()` keeps saved OpenAI OAuth Codex models visible alongside
  env-configured third-party provider models.
- `refreshActivePlugins()` resets the settings cache before resolving active
  plugins, so desktop/server toggles are visible to the active CLI reload path.
- `enabledPlugins` values can be `true` or version constraint arrays. Both mean
  enabled.
- `desktop/src/pages/AgentTeams.tsx` is a mock/demo page, while the production
  agent/team surfaces are Settings > Agents and the active-session
  `TeamStatusBar`.
- The composer context indicator displays session inspection `rawMaxTokens`,
  not the theoretical maximum of this Codex desktop conversation. Provider and
  model context windows come from provider config, env overrides, built-in model
  mappings, or transcript/live CLI estimates.
- Settings > Computer Use persists `enabled` to
  `~/.claude/cc-haha/computer-use-config.json`, and the CLI gate reads that
  value before injecting the dynamic `computer-use` MCP server. The environment
  override `CLAUDE_COMPUTER_USE_ENABLED=0` still wins.
- Desktop repository launches record branch/worktree intent in session metadata
  first. Isolated worktrees are materialized at CLI startup under
  `.claude/worktrees/desktop-...`, while internal `worktree-desktop-...`
  branches are hidden from normal branch pickers.
- The workspace panel merges Git changes, session transcript changes, and
  file-history snapshots. Rewind prefers file-history backups and falls back to
  transcript tool changes when snapshots are missing.

## Remaining Manual Checks

These are the next sensible checks before claiming the full app is production
ready:

1. Launch packaged macOS app and send one real message through the MiniMax path.
2. Open Settings and verify Providers, H5 Access, Adapters, Skill, Agents,
   Memory, Computer Use, and About pages still render after the UI restyle.
3. If credentials are available, perform one live adapter test per IM channel.
4. If a phone/browser flow is needed, enable H5 access and test the token flow
   from a second device or browser profile.
5. If AI老黄 provides GitHub Releases URLs, restore updater configuration to the
   new repository rather than the old upstream repository.
6. In a disposable Git repo, send one intentional low-cost message from an
   isolated worktree session to materialize the planned worktree, then execute a
   rewind after previewing it.
